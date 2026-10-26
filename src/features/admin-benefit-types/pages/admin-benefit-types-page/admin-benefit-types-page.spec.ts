import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Observable, of, Subject, throwError } from 'rxjs';
import { BenefitFormatRepository } from '../../services/benefit-format.repository';
import { AdminBenefitFormatStore } from '../../services/benefit-format.store';
import { BenefitFormat } from '../../types/benefit-format.model';
import { BENEFIT_FORMATS_FIXTURE } from '../../utils/benefit-format.fixture';
import { AdminBenefitTypesPage } from './admin-benefit-types-page';

describe('AdminBenefitTypesPage', () => {
  const porPuntos: BenefitFormat = {
    id: 'format-por-puntos',
    code: 'PRODUCTO_POR_PUNTOS',
    displayName: 'Por puntos',
    description: 'Canje con puntos.',
    active: false,
    usageCount: 1234,
  };
  const descuento = BENEFIT_FORMATS_FIXTURE.find((f) => f.code === 'CODIGO_DESCUENTO')!;

  let fixture: ComponentFixture<AdminBenefitTypesPage>;
  let element: HTMLElement;
  let getFormats: ReturnType<typeof vi.fn>;
  let createFormat: ReturnType<typeof vi.fn>;
  let updateFormat: ReturnType<typeof vi.fn>;

  async function render(list: Observable<readonly BenefitFormat[]> = of(BENEFIT_FORMATS_FIXTURE)) {
    getFormats = vi.fn().mockReturnValue(list);
    createFormat = vi.fn();
    updateFormat = vi.fn();
    await TestBed.configureTestingModule({
      imports: [AdminBenefitTypesPage],
      providers: [
        AdminBenefitFormatStore,
        {
          provide: BenefitFormatRepository,
          useValue: { getFormats, createFormat, updateFormat },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminBenefitTypesPage);
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
  const select = () => element.querySelector<HTMLSelectElement>('select[name="code"]')!;
  const nameInput = () => element.querySelector<HTMLInputElement>('input[name="displayName"]')!;
  const description = () => element.querySelector<HTMLTextAreaElement>('textarea')!;
  const active = () => element.querySelector<HTMLInputElement>('input[name="active"]')!;
  const rows = () => [...element.querySelectorAll('tbody tr')];
  const cell = (row: Element, column: number) =>
    row.querySelector(`td:nth-child(${column})`)?.textContent?.trim().replace(/\s+/g, ' ');

  async function type(input: HTMLInputElement | HTMLTextAreaElement, value: string) {
    input.value = value;
    input.dispatchEvent(new Event('input'));
    await settle();
  }

  async function choose(code: string) {
    select().value = code;
    select().dispatchEvent(new Event('change'));
    await settle();
  }

  async function click(target: HTMLElement) {
    target.click();
    await settle();
  }

  const conflict = (message: string) => new HttpErrorResponse({ status: 409, error: message });

  describe('page', () => {
    it('titles the page "Tipos de beneficio" with a description and the "Nuevo tipo" action', async () => {
      await render();

      expect(element.querySelector('h1')?.textContent?.trim()).toBe('Tipos de beneficio');
      expect(element.querySelector('app-admin-page-header p')?.textContent).toContain(
        'Define qué formatos de cupón pueden usar los beneficios.',
      );
      expect(button('Nuevo tipo')).toBeTruthy();
    });

    it('shows a busy state while the formats load', async () => {
      await render(new Subject<readonly BenefitFormat[]>());

      expect(element.querySelector('[aria-busy="true"]')).not.toBeNull();
      expect(element.querySelector('[role="status"]')?.textContent).toContain(
        'Cargando tipos de beneficio',
      );
      expect(element.querySelector('table')).toBeNull();
      expect(button('Nuevo tipo').disabled).toBe(true);
    });

    it('lists every format with its columns, usage for es-AR, state badge and edit button', async () => {
      await render(of([...BENEFIT_FORMATS_FIXTURE, porPuntos]));

      const headers = [...element.querySelectorAll('thead th')].map((th) => th.textContent?.trim());
      expect(headers).toEqual([
        'Nombre',
        'Formato',
        'Descripción',
        'Beneficios que lo usan',
        'Estado',
        'Acciones',
      ]);
      const first = rows()[0];
      expect(cell(first, 1)).toBe('2x1');
      expect(cell(first, 2)).toBe('2x1');
      expect(cell(first, 3)).toBe('Entrega dos unidades del mismo producto al costo de una.');
      expect(cell(first, 4)).toBe('0');
      expect(cell(first, 5)).toBe('Activo');
      expect(rows().map((row) => cell(row, 4))).toEqual(['0', '12', '1.234', '5']);
      expect(rows().map((row) => cell(row, 5))).toEqual(['Activo', 'Activo', 'Inactivo', 'Activo']);
      expect(button('Editar Descuento')).toBeTruthy();
      expect(element.querySelectorAll('tbody button')).toHaveLength(4);
    });

    it('explains that there are no types yet and still offers to register one', async () => {
      await render(of([]));

      expect(element.textContent).toContain('Todavía no hay tipos de beneficio.');
      expect(element.querySelector('table')).toBeNull();
      expect(button('Nuevo tipo').disabled).toBe(false);
    });

    it('offers to retry when the formats fail to load', async () => {
      await render(throwError(() => new Error('down')));

      expect(element.querySelector('[role="alert"]')?.textContent).toContain(
        'No pudimos cargar los tipos de beneficio',
      );
      getFormats.mockReturnValue(of(BENEFIT_FORMATS_FIXTURE));

      await click(button('Reintentar'));

      expect(rows()).toHaveLength(3);
      expect(element.querySelector('[role="alert"]')).toBeNull();
    });

    it('disables "Nuevo tipo" with a hint once the four formats are in the catalog', async () => {
      await render(of([...BENEFIT_FORMATS_FIXTURE, porPuntos]));

      const action = button('Nuevo tipo');
      expect(action.disabled).toBe(true);
      const hint = element.querySelector(`#${action.getAttribute('aria-describedby')}`);
      expect(hint?.textContent).toContain('Ya registraste los 4 formatos disponibles.');

      await click(action);

      expect(dialog()).toBeNull();
    });

    it('keeps "Nuevo tipo" enabled, without a hint, while a format is left', async () => {
      await render();

      expect(button('Nuevo tipo').disabled).toBe(false);
      expect(element.textContent).not.toContain('Ya registraste los 4 formatos');
    });
  });

  describe('create flow', () => {
    it('opens "Nuevo tipo" offering only the formats that are not in the catalog', async () => {
      await render();

      await click(button('Nuevo tipo'));

      expect(dialog()!.querySelector('h2')?.textContent?.trim()).toBe('Nuevo tipo');
      expect([...select().options].map((option) => option.value)).toEqual([
        '',
        'PRODUCTO_POR_PUNTOS',
      ]);
      expect(active().checked).toBe(true);
    });

    it('registers a format, closes the drawer and confirms with a banner', async () => {
      await render();
      createFormat.mockReturnValue(of(porPuntos));
      await click(button('Nuevo tipo'));

      await choose('PRODUCTO_POR_PUNTOS');
      await type(nameInput(), '  Por puntos ');
      await type(description(), 'Canje con puntos.');
      await click(button('Guardar'));

      expect(createFormat).toHaveBeenCalledWith({
        code: 'PRODUCTO_POR_PUNTOS',
        displayName: 'Por puntos',
        description: 'Canje con puntos.',
        active: true,
      });
      expect(dialog()).toBeNull();
      expect(element.querySelector('[role="status"]')?.textContent).toContain(
        'Tipo de beneficio creado.',
      );
      expect(rows().map((row) => cell(row, 1))).toContain('Por puntos');
      expect(button('Nuevo tipo').disabled).toBe(true);
    });

    it('registers an inactive format when "Activo" is turned off', async () => {
      await render();
      createFormat.mockReturnValue(of(porPuntos));
      await click(button('Nuevo tipo'));
      await choose('PRODUCTO_POR_PUNTOS');
      await type(nameInput(), 'Por puntos');
      await type(description(), 'Canje con puntos.');

      await click(active());
      await click(button('Guardar'));

      expect(createFormat).toHaveBeenCalledWith(expect.objectContaining({ active: false }));
    });

    it('dismisses the confirmation banner', async () => {
      await render();
      createFormat.mockReturnValue(of(porPuntos));
      await click(button('Nuevo tipo'));
      await choose('PRODUCTO_POR_PUNTOS');
      await type(nameInput(), 'Por puntos');
      await type(description(), 'Canje con puntos.');
      await click(button('Guardar'));

      await click(button('Cerrar aviso'));

      expect(element.querySelector('[role="status"]')).toBeNull();
    });

    it('does not call the backend while the form is invalid and shows the reasons', async () => {
      await render();
      await click(button('Nuevo tipo'));

      await click(button('Guardar'));

      expect(createFormat).not.toHaveBeenCalled();
      expect(dialog()).not.toBeNull();
      expect(element.textContent).toContain('Elige un formato.');
      expect(element.textContent).toContain('El nombre es obligatorio.');
      expect(element.textContent).toContain('La descripción es obligatoria.');
      expect(nameInput().getAttribute('aria-describedby')).toBeTruthy();
    });

    it('shows a duplicate name from the server under the name input and keeps the drawer open', async () => {
      await render();
      createFormat.mockReturnValue(
        throwError(() => conflict('A benefit type named Descuento already exists')),
      );
      await click(button('Nuevo tipo'));
      await choose('PRODUCTO_POR_PUNTOS');
      await type(nameInput(), 'Descuento');
      await type(description(), 'Canje con puntos.');

      await click(button('Guardar'));

      const message = nameInput().getAttribute('aria-describedby')!;
      expect(element.querySelector(`#${message}`)?.textContent).toContain(
        'Ya existe un tipo con ese nombre.',
      );
      expect(nameInput().getAttribute('aria-invalid')).toBe('true');
      expect(nameInput().className).toContain('border-rose-600');
      expect(dialog()).not.toBeNull();

      await type(nameInput(), 'Otro nombre');

      expect(element.textContent).not.toContain('Ya existe un tipo con ese nombre.');
      expect(nameInput().getAttribute('aria-invalid')).toBeNull();
    });

    it('shows a format already in the catalog under the format select', async () => {
      await render();
      createFormat.mockReturnValue(
        throwError(() => conflict('The format PRODUCTO_POR_PUNTOS is already in the catalog')),
      );
      await click(button('Nuevo tipo'));
      await choose('PRODUCTO_POR_PUNTOS');
      await type(nameInput(), 'Por puntos');
      await type(description(), 'Canje con puntos.');

      await click(button('Guardar'));

      expect(element.textContent).toContain('Ese formato ya está en el catálogo.');
      expect(select().getAttribute('aria-invalid')).toBe('true');
    });

    it('shows an unexpected failure inside the drawer', async () => {
      await render();
      createFormat.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 500 })));
      await click(button('Nuevo tipo'));
      await choose('PRODUCTO_POR_PUNTOS');
      await type(nameInput(), 'Por puntos');
      await type(description(), 'Canje con puntos.');

      await click(button('Guardar'));

      expect(dialog()!.querySelector('[role="alert"]')?.textContent).toContain(
        'No pudimos guardar el tipo de beneficio. Inténtalo de nuevo.',
      );
    });

    it('disables the actions while saving', async () => {
      await render();
      createFormat.mockReturnValue(new Subject<BenefitFormat>());
      await click(button('Nuevo tipo'));
      await choose('PRODUCTO_POR_PUNTOS');
      await type(nameInput(), 'Por puntos');
      await type(description(), 'Canje con puntos.');

      await click(button('Guardar'));

      expect(button('Guardar').disabled).toBe(true);
      expect(button('Cancelar').disabled).toBe(true);
    });
  });

  describe('edit flow', () => {
    it('opens "Editar tipo" prefilled, with the format read-only', async () => {
      await render();

      await click(button('Editar Descuento'));

      const panel = dialog()!;
      expect(panel.querySelector('h2')?.textContent?.trim()).toBe('Editar tipo');
      expect(panel.querySelector('select')).toBeNull();
      expect(panel.textContent).toContain('Código de descuento');
      expect(nameInput().value).toBe('Descuento');
      expect(description().value).toBe(descuento.description);
      expect(active().checked).toBe(true);
    });

    it('saves the changes on the format id and confirms', async () => {
      await render();
      updateFormat.mockReturnValue(of({ ...descuento, displayName: 'Rebaja', active: false }));
      await click(button('Editar Descuento'));

      await type(nameInput(), 'Rebaja');
      await click(active());
      await click(button('Guardar'));

      expect(updateFormat).toHaveBeenCalledWith('format-descuento', {
        code: 'CODIGO_DESCUENTO',
        displayName: 'Rebaja',
        description: descuento.description,
        active: false,
      });
      expect(dialog()).toBeNull();
      expect(element.querySelector('[role="status"]')?.textContent).toContain(
        'Tipo de beneficio actualizado.',
      );
      expect(button('Editar Rebaja')).toBeTruthy();
      expect(rows().map((row) => cell(row, 1))).toContain('Rebaja');
    });

    it('warns, without blocking, that deactivating a type in use leaves existing benefits as they are', async () => {
      await render();
      updateFormat.mockReturnValue(of({ ...descuento, active: false }));
      await click(button('Editar Descuento'));

      await click(active());

      expect(dialog()!.textContent).toContain(
        'Los beneficios existentes no cambian; no se podrán crear nuevos con este formato.',
      );

      await click(button('Guardar'));

      expect(updateFormat).toHaveBeenCalled();
    });

    it('shows a duplicate name from the server when renaming', async () => {
      await render();
      updateFormat.mockReturnValue(
        throwError(() => conflict('A benefit type named 2x1 already exists')),
      );
      await click(button('Editar Descuento'));
      await type(nameInput(), '2x1');

      await click(button('Guardar'));

      expect(element.textContent).toContain('Ya existe un tipo con ese nombre.');
      expect(dialog()).not.toBeNull();
    });
  });

  describe('drawer behaviour', () => {
    it('moves the focus into the drawer when it opens', async () => {
      await render();

      await click(button('Nuevo tipo'));

      expect(dialog()!.contains(document.activeElement)).toBe(true);
    });

    it('returns the focus to the button that opened it even if the click did not focus it', async () => {
      await render();
      const trigger = button('Editar 2x1');
      // A click does not focus a button in Safari: nothing is focused on the trigger here.
      expect(document.activeElement).not.toBe(trigger);
      await click(trigger);

      await click(button('Cancelar'));

      expect(dialog()).toBeNull();
      expect(document.activeElement).toBe(trigger);
    });

    it('keeps the focus on the page when registering the last format disables "Nuevo tipo"', async () => {
      await render();
      createFormat.mockReturnValue(of(porPuntos));
      await click(button('Nuevo tipo'));
      await choose('PRODUCTO_POR_PUNTOS');
      await type(nameInput(), 'Por puntos');
      await type(description(), 'Canje con puntos.');

      await click(button('Guardar'));

      expect(button('Nuevo tipo').disabled).toBe(true);
      expect(document.activeElement).not.toBe(document.body);
      expect(document.activeElement).toBe(element.querySelector('main'));
      expect(element.querySelector('main')?.getAttribute('tabindex')).toBe('-1');
    });

    it('closes with Escape and returns the focus to "Nuevo tipo"', async () => {
      await render();
      const trigger = button('Nuevo tipo');
      await click(trigger);

      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      await settle();

      expect(dialog()).toBeNull();
      expect(document.activeElement).toBe(trigger);
    });

    it('closes when the backdrop is clicked but not when the panel is', async () => {
      await render();
      await click(button('Nuevo tipo'));

      await click(dialog()!);
      expect(dialog()).not.toBeNull();

      await click(
        element.querySelector<HTMLElement>('[data-testid="benefit-format-drawer-backdrop"]')!,
      );
      expect(dialog()).toBeNull();
    });

    it('discards what was typed when it is closed', async () => {
      await render();
      await click(button('Nuevo tipo'));
      await type(nameInput(), 'Borrador');
      await click(button('Cancelar'));

      await click(button('Nuevo tipo'));

      expect(nameInput().value).toBe('');
    });
  });
});
