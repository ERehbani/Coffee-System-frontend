import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Observable, of, Subject, throwError } from 'rxjs';
import { TierRepository } from '../../services/tier.repository';
import { AdminTierStore } from '../../services/tier.store';
import { SaveTierInput, Tier } from '../../types/tier.model';
import { TIERS_FIXTURE } from '../../utils/tier.fixture';
import { AdminTiersPage } from './admin-tiers-page';

describe('AdminTiersPage', () => {
  let fixture: ComponentFixture<AdminTiersPage>;
  let element: HTMLElement;
  let getTiers: ReturnType<typeof vi.fn>;
  let createTier: ReturnType<typeof vi.fn>;
  let updateTier: ReturnType<typeof vi.fn>;

  async function render(list: Observable<readonly Tier[]> = of(TIERS_FIXTURE)) {
    getTiers = vi.fn().mockReturnValue(list);
    createTier = vi.fn();
    updateTier = vi.fn();
    await TestBed.configureTestingModule({
      imports: [AdminTiersPage],
      providers: [
        AdminTierStore,
        { provide: TierRepository, useValue: { getTiers, createTier, updateTier } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminTiersPage);
    // Attached to the document so focus can be observed.
    document.body.appendChild(fixture.nativeElement);
    element = fixture.nativeElement;
    await settle();
  }

  async function settle() {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  }

  afterEach(() => fixture.nativeElement.remove());

  const button = (name: string) =>
    [...element.querySelectorAll<HTMLButtonElement>('button')].find(
      (candidate) =>
        candidate.textContent?.trim() === name || candidate.getAttribute('aria-label') === name,
    )!;
  const dialog = () => element.querySelector<HTMLElement>('[role="dialog"]');
  const nameInput = () => element.querySelector<HTMLInputElement>('input[name="name"]')!;
  const pointsInput = () => element.querySelector<HTMLInputElement>('input[name="minPoints"]')!;
  const rows = () => [...element.querySelectorAll('tbody tr')];

  async function type(input: HTMLInputElement, value: string) {
    input.value = value;
    input.dispatchEvent(new Event('input'));
    await settle();
  }

  async function click(target: HTMLElement) {
    target.click();
    await settle();
  }

  const conflict = (message: string) => new HttpErrorResponse({ status: 409, error: message });

  describe('page', () => {
    it('titles the page "Tiers" with a description and the "Nuevo tier" action', async () => {
      await render();

      expect(element.querySelector('h1')?.textContent?.trim()).toBe('Tiers');
      expect(element.querySelector('app-admin-page-header p')?.textContent).toContain(
        'Configura los niveles y los puntos necesarios para alcanzarlos.',
      );
      expect(button('Nuevo tier')).toBeTruthy();
    });

    it('shows a busy state while the tiers load', async () => {
      await render(new Subject<readonly Tier[]>());

      expect(element.querySelector('[aria-busy="true"]')).not.toBeNull();
      expect(element.querySelector('[role="status"]')?.textContent).toContain('Cargando tiers');
      expect(element.querySelector('table')).toBeNull();
    });

    it('lists every tier with its points formatted for es-AR and an edit button', async () => {
      await render();

      const headers = [...element.querySelectorAll('thead th')].map((th) => th.textContent?.trim());
      expect(headers).toEqual(['Nombre', 'Puntos necesarios', 'Acciones']);
      expect(
        rows().map((row) => row.querySelector('td:nth-child(2)')?.textContent?.trim()),
      ).toEqual(['0', '1.000', '3.000', '7.000']);
      expect(button('Editar ORO')).toBeTruthy();
      expect(element.querySelectorAll('tbody button')).toHaveLength(4);
    });

    it('marks only the base tier', async () => {
      await render();

      const marked = rows().filter((row) => row.textContent?.includes('Base'));
      expect(marked).toHaveLength(1);
      expect(marked[0].textContent).toContain('BRONCE');
    });

    it('explains that there are no tiers yet', async () => {
      await render(of([]));

      expect(element.textContent).toContain('Todavía no hay tiers.');
      expect(element.querySelector('table')).toBeNull();
    });

    it('offers to retry when the tiers fail to load', async () => {
      await render(throwError(() => new Error('down')));

      expect(element.querySelector('[role="alert"]')?.textContent).toContain(
        'No pudimos cargar los tiers',
      );
      getTiers.mockReturnValue(of(TIERS_FIXTURE));

      await click(button('Reintentar'));

      expect(rows()).toHaveLength(4);
      expect(element.querySelector('[role="alert"]')).toBeNull();
    });
  });

  describe('create flow', () => {
    it('opens a dialog titled "Nuevo tier" with the two inputs and the actions', async () => {
      await render();

      await click(button('Nuevo tier'));

      const panel = dialog()!;
      expect(panel.getAttribute('aria-modal')).toBe('true');
      const titleId = panel.getAttribute('aria-labelledby')!;
      expect(panel.querySelector(`#${titleId}`)?.textContent?.trim()).toBe('Nuevo tier');
      expect(panel.querySelector('label[for="tier-name"]')?.textContent?.trim()).toBe('Nombre');
      expect(panel.querySelector('label[for="tier-min-points"]')?.textContent?.trim()).toBe(
        'Puntos necesarios',
      );
      expect(pointsInput().type).toBe('number');
      expect(pointsInput().min).toBe('0');
      expect(pointsInput().step).toBe('1');
      expect(button('Cancelar')).toBeTruthy();
      expect(button('Guardar')).toBeTruthy();
    });

    it('saves a new tier, closes the drawer and confirms with a banner', async () => {
      await render();
      createTier.mockReturnValue(of({ id: 'new', name: 'Platino', minPoints: 5000 }));
      await click(button('Nuevo tier'));

      await type(nameInput(), '  Platino ');
      await type(pointsInput(), '5000');
      await click(button('Guardar'));

      expect(createTier).toHaveBeenCalledWith({
        name: 'Platino',
        minPoints: 5000,
      } satisfies SaveTierInput);
      expect(dialog()).toBeNull();
      expect(element.querySelector('[role="status"]')?.textContent).toContain('Tier creado.');
      expect(
        rows().map((row) => row.querySelector('td')?.textContent?.trim().replace(/\s+/g, ' ')),
      ).toContain('Platino');
    });

    it('dismisses the confirmation banner', async () => {
      await render();
      createTier.mockReturnValue(of({ id: 'new', name: 'Platino', minPoints: 5000 }));
      await click(button('Nuevo tier'));
      await type(nameInput(), 'Platino');
      await type(pointsInput(), '5000');
      await click(button('Guardar'));

      await click(button('Cerrar aviso'));

      expect(element.querySelector('[role="status"]')).toBeNull();
    });

    it('does not call the backend while the form is invalid and shows the reasons', async () => {
      await render();
      await click(button('Nuevo tier'));

      await click(button('Guardar'));

      expect(createTier).not.toHaveBeenCalled();
      expect(dialog()).not.toBeNull();
      expect(element.textContent).toContain('El nombre es obligatorio.');
      expect(element.textContent).toContain('Los puntos son obligatorios.');
      expect(nameInput().getAttribute('aria-invalid')).toBe('true');
      expect(nameInput().getAttribute('aria-describedby')).toBeTruthy();
    });

    it.each([
      ['x'.repeat(51), '10', 'El nombre puede tener hasta 50 caracteres.'],
      ['Nuevo', '-5', 'Los puntos no pueden ser negativos.'],
      ['Nuevo', '1.5', 'Los puntos deben ser un número entero.'],
    ])('validates "%s" / "%s" before saving', async (name, points, message) => {
      await render();
      await click(button('Nuevo tier'));
      await type(nameInput(), name);
      await type(pointsInput(), points);

      await click(button('Guardar'));

      expect(createTier).not.toHaveBeenCalled();
      expect(element.textContent).toContain(message);
    });

    it('shows a duplicate name from the server under the name input and keeps the drawer open', async () => {
      await render();
      createTier.mockReturnValue(throwError(() => conflict('A tier named Oro already exists')));
      await click(button('Nuevo tier'));
      await type(nameInput(), 'Oro');
      await type(pointsInput(), '4000');

      await click(button('Guardar'));

      const message = nameInput().getAttribute('aria-describedby')!;
      expect(element.querySelector(`#${message}`)?.textContent).toContain(
        'Ya existe un tier con ese nombre.',
      );
      expect(nameInput().getAttribute('aria-invalid')).toBe('true');
      expect(nameInput().className).toContain('border-rose-600');
      expect(dialog()).not.toBeNull();
    });

    it('shows duplicate points from the server under the points input and clears it on edit', async () => {
      await render();
      createTier.mockReturnValue(
        throwError(() => conflict('A tier with 3000 points already exists')),
      );
      await click(button('Nuevo tier'));
      await type(nameInput(), 'Nuevo');
      await type(pointsInput(), '3000');
      await click(button('Guardar'));

      expect(element.textContent).toContain('Ya existe un tier con esa cantidad de puntos.');
      expect(pointsInput().getAttribute('aria-invalid')).toBe('true');

      await type(pointsInput(), '3500');

      expect(element.textContent).not.toContain('Ya existe un tier con esa cantidad de puntos.');
      expect(pointsInput().getAttribute('aria-invalid')).toBeNull();
    });

    it('shows an unexpected failure inside the drawer', async () => {
      await render();
      createTier.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 500 })));
      await click(button('Nuevo tier'));
      await type(nameInput(), 'Nuevo');
      await type(pointsInput(), '10');

      await click(button('Guardar'));

      expect(dialog()!.querySelector('[role="alert"]')?.textContent).toContain(
        'No pudimos guardar el tier. Inténtalo de nuevo.',
      );
    });

    it('disables the actions while saving', async () => {
      await render();
      createTier.mockReturnValue(new Subject<Tier>());
      await click(button('Nuevo tier'));
      await type(nameInput(), 'Nuevo');
      await type(pointsInput(), '10');

      await click(button('Guardar'));

      expect(button('Guardar').disabled).toBe(true);
      expect(button('Cancelar').disabled).toBe(true);
    });
  });

  describe('edit flow', () => {
    it('opens "Editar tier" prefilled with the tier', async () => {
      await render();

      await click(button('Editar PLATA'));

      const panel = dialog()!;
      expect(panel.querySelector('h2')?.textContent?.trim()).toBe('Editar tier');
      expect(nameInput().value).toBe('PLATA');
      expect(pointsInput().value).toBe('1000');
      expect(pointsInput().disabled).toBe(false);
    });

    it('saves the changes on the tier id and confirms', async () => {
      await render();
      updateTier.mockReturnValue(of({ id: 'tier-plata', name: 'Plata plus', minPoints: 1500 }));
      await click(button('Editar PLATA'));

      await type(nameInput(), 'Plata plus');
      await type(pointsInput(), '1500');
      await click(button('Guardar'));

      expect(updateTier).toHaveBeenCalledWith('tier-plata', {
        name: 'Plata plus',
        minPoints: 1500,
      });
      expect(dialog()).toBeNull();
      expect(element.querySelector('[role="status"]')?.textContent).toContain('Tier actualizado.');
      expect(button('Editar Plata plus')).toBeTruthy();
    });

    it('locks the points of the base tier at 0 with an explanation', async () => {
      await render();
      updateTier.mockReturnValue(of({ id: 'tier-bronce', name: 'Inicial', minPoints: 0 }));

      await click(button('Editar BRONCE'));

      expect(pointsInput().disabled).toBe(true);
      expect(pointsInput().value).toBe('0');
      expect(dialog()!.textContent).toContain('El tier base siempre requiere 0 puntos.');
      expect(pointsInput().getAttribute('aria-describedby')).toBeTruthy();

      await type(nameInput(), 'Inicial');
      await click(button('Guardar'));

      expect(updateTier).toHaveBeenCalledWith('tier-bronce', { name: 'Inicial', minPoints: 0 });
    });

    it('does not lock the points of a new tier nor of the other tiers', async () => {
      await render();

      await click(button('Nuevo tier'));

      expect(pointsInput().disabled).toBe(false);
      expect(dialog()!.textContent).not.toContain('El tier base siempre requiere 0 puntos.');
    });
  });

  describe('drawer behaviour', () => {
    it('moves the focus into the drawer when it opens', async () => {
      await render();

      await click(button('Nuevo tier'));

      expect(dialog()!.contains(document.activeElement)).toBe(true);
    });

    it('closes with Cancelar and returns the focus to the trigger', async () => {
      await render();
      const trigger = button('Editar ORO');
      trigger.focus();
      await click(trigger);

      await click(button('Cancelar'));

      expect(dialog()).toBeNull();
      expect(document.activeElement).toBe(trigger);
    });

    it('closes with Escape', async () => {
      await render();
      const trigger = button('Nuevo tier');
      trigger.focus();
      await click(trigger);

      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      await settle();

      expect(dialog()).toBeNull();
      expect(document.activeElement).toBe(trigger);
    });

    it('closes when the backdrop is clicked but not when the panel is', async () => {
      await render();
      await click(button('Nuevo tier'));

      await click(dialog()!);
      expect(dialog()).not.toBeNull();

      await click(element.querySelector<HTMLElement>('[data-testid="tier-drawer-backdrop"]')!);
      expect(dialog()).toBeNull();
    });

    it('discards what was typed when it is closed', async () => {
      await render();
      await click(button('Nuevo tier'));
      await type(nameInput(), 'Borrador');
      await click(button('Cancelar'));

      await click(button('Nuevo tier'));

      expect(nameInput().value).toBe('');
    });
  });
});
