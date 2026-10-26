import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BenefitFormat, SaveBenefitFormatInput } from '../../types/benefit-format.model';
import { BENEFIT_FORMATS_FIXTURE } from '../../utils/benefit-format.fixture';
import { BenefitFormatDrawer } from './benefit-format-drawer';

describe('BenefitFormatDrawer', () => {
  const descuento = BENEFIT_FORMATS_FIXTURE.find((f) => f.code === 'CODIGO_DESCUENTO')!;
  const unused = BENEFIT_FORMATS_FIXTURE.find((f) => f.usageCount === 0)!;

  let fixture: ComponentFixture<BenefitFormatDrawer>;
  let element: HTMLElement;
  let saved: SaveBenefitFormatInput[];

  async function render(inputs: {
    format?: BenefitFormat | null;
    availableCodes?: readonly string[];
    returnFocusTo?: HTMLElement | null;
    fallbackFocus?: HTMLElement | null;
  }) {
    fixture = TestBed.createComponent(BenefitFormatDrawer);
    fixture.componentRef.setInput('format', inputs.format ?? null);
    fixture.componentRef.setInput(
      'availableCodes',
      inputs.availableCodes ?? ['PRODUCTO_POR_PUNTOS'],
    );
    fixture.componentRef.setInput('returnFocusTo', inputs.returnFocusTo ?? null);
    fixture.componentRef.setInput('fallbackFocus', inputs.fallbackFocus ?? null);
    saved = [];
    fixture.componentInstance.save.subscribe((value) => saved.push(value));
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

  const panel = () => element.querySelector<HTMLElement>('[role="dialog"]')!;
  const select = () => element.querySelector<HTMLSelectElement>('select[name="code"]');
  const nameInput = () => element.querySelector<HTMLInputElement>('input[name="displayName"]')!;
  const description = () => element.querySelector<HTMLTextAreaElement>('textarea')!;
  const active = () => element.querySelector<HTMLInputElement>('input[name="active"]')!;
  const button = (name: string) =>
    [...element.querySelectorAll<HTMLButtonElement>('button')].find(
      (candidate) =>
        candidate.textContent?.trim() === name || candidate.getAttribute('aria-label') === name,
    )!;

  async function type(input: HTMLInputElement | HTMLTextAreaElement, value: string) {
    input.value = value;
    input.dispatchEvent(new Event('input'));
    await settle();
  }

  async function press(key: string, shiftKey = false) {
    const event = new KeyboardEvent('keydown', { key, shiftKey, bubbles: true, cancelable: true });
    document.activeElement?.dispatchEvent(event);
    await settle();
    return event;
  }

  describe('create', () => {
    it('is a dialog titled "Nuevo tipo" with the four fields', async () => {
      await render({});

      expect(panel().getAttribute('aria-modal')).toBe('true');
      expect(panel().querySelector('h2')?.textContent?.trim()).toBe('Nuevo tipo');
      expect(element.querySelector('label[for="benefit-format-code"]')?.textContent?.trim()).toBe(
        'Formato',
      );
      expect(element.querySelector('label[for="benefit-format-name"]')?.textContent?.trim()).toBe(
        'Nombre',
      );
      expect(
        element.querySelector('label[for="benefit-format-description"]')?.textContent?.trim(),
      ).toBe('Descripción');
      expect(element.querySelector('label[for="benefit-format-active"]')?.textContent?.trim()).toBe(
        'Activo',
      );
    });

    it('offers only the available formats, labelled in Spanish, after a placeholder', async () => {
      await render({ availableCodes: ['DOS_POR_UNO', 'PRODUCTO_POR_PUNTOS'] });

      const options = [...select()!.options].map((option) => [option.value, option.text.trim()]);
      expect(options).toEqual([
        ['', 'Elige un formato'],
        ['DOS_POR_UNO', '2x1'],
        ['PRODUCTO_POR_PUNTOS', 'Producto por puntos'],
      ]);
    });

    it('starts active and empty, with the description counter at 0/200', async () => {
      await render({});

      expect(active().checked).toBe(true);
      expect(nameInput().value).toBe('');
      expect(select()!.value).toBe('');
      expect(element.querySelector('#benefit-format-description-count')?.textContent?.trim()).toBe(
        '0/200',
      );
    });

    it('counts the characters of the description as they are typed', async () => {
      await render({});

      await type(description(), 'Canje con puntos');

      expect(element.querySelector('#benefit-format-description-count')?.textContent?.trim()).toBe(
        '16/200',
      );
      expect(description().getAttribute('aria-describedby')).toContain(
        'benefit-format-description-count',
      );
    });

    it('counts the trimmed text, as the validation does', async () => {
      await render({});

      await type(description(), `${'y'.repeat(200)}   `);

      expect(element.querySelector('#benefit-format-description-count')?.textContent?.trim()).toBe(
        '200/200',
      );
      expect(element.querySelector('#benefit-format-description-count')?.className).not.toContain(
        'text-rose-700',
      );
    });

    it('emits the chosen format, the texts and the flag', async () => {
      await render({});
      select()!.value = 'PRODUCTO_POR_PUNTOS';
      select()!.dispatchEvent(new Event('change'));
      await type(nameInput(), '  Por puntos ');
      await type(description(), ' Canje con puntos. ');
      active().click();
      await settle();

      button('Guardar').click();

      expect(saved).toEqual([
        {
          code: 'PRODUCTO_POR_PUNTOS',
          displayName: 'Por puntos',
          description: 'Canje con puntos.',
          active: false,
        },
      ]);
    });

    it('does not emit while the form is invalid and explains why', async () => {
      await render({});

      button('Guardar').click();
      await settle();

      expect(saved).toEqual([]);
      expect(panel().textContent).toContain('Elige un formato.');
      expect(panel().textContent).toContain('El nombre es obligatorio.');
      expect(panel().textContent).toContain('La descripción es obligatoria.');
      expect(nameInput().getAttribute('aria-invalid')).toBe('true');
      expect(select()!.getAttribute('aria-invalid')).toBe('true');
      expect(description().getAttribute('aria-invalid')).toBe('true');
    });

    it('rejects a name over 40 characters and a description over 200', async () => {
      await render({});
      select()!.value = 'PRODUCTO_POR_PUNTOS';
      select()!.dispatchEvent(new Event('change'));
      await type(nameInput(), 'x'.repeat(41));
      await type(description(), 'y'.repeat(201));

      button('Guardar').click();
      await settle();

      expect(saved).toEqual([]);
      expect(panel().textContent).toContain('El nombre puede tener hasta 40 caracteres.');
      expect(panel().textContent).toContain('La descripción puede tener hasta 200 caracteres.');
    });

    it('shows server errors on their fields and tells the parent when a field is edited', async () => {
      await render({});
      const edited: string[] = [];
      fixture.componentInstance.fieldEdited.subscribe((field) => edited.push(field));
      fixture.componentRef.setInput('errors', {
        code: 'Ese formato ya está en el catálogo.',
        displayName: 'Ya existe un tipo con ese nombre.',
        form: 'No pudimos guardar el tipo de beneficio. Inténtalo de nuevo.',
      });
      await settle();

      expect(panel().textContent).toContain('Ese formato ya está en el catálogo.');
      expect(panel().textContent).toContain('Ya existe un tipo con ese nombre.');
      expect(panel().querySelector('[role="alert"]')?.textContent).toContain(
        'No pudimos guardar el tipo de beneficio.',
      );

      await type(nameInput(), 'Otro');
      select()!.dispatchEvent(new Event('change'));
      await type(description(), 'Texto');

      expect(edited).toEqual(['displayName', 'code', 'description']);
    });
  });

  describe('edit', () => {
    it('is titled "Editar tipo", prefilled, and shows the format read-only', async () => {
      await render({ format: descuento });

      expect(panel().querySelector('h2')?.textContent?.trim()).toBe('Editar tipo');
      expect(select()).toBeNull();
      expect(panel().textContent).toContain('Formato');
      expect(panel().textContent).toContain('Código de descuento');
      expect(nameInput().value).toBe('Descuento');
      expect(description().value).toBe(descuento.description);
      expect(active().checked).toBe(true);
    });

    it('emits the format code with the edited fields', async () => {
      await render({ format: descuento });
      await type(nameInput(), 'Rebaja');

      button('Guardar').click();

      expect(saved).toEqual([
        {
          code: 'CODIGO_DESCUENTO',
          displayName: 'Rebaja',
          description: descuento.description,
          active: true,
        },
      ]);
    });

    it('explains that existing benefits do not change when a type in use is deactivated', async () => {
      await render({ format: descuento });
      const note =
        'Los beneficios existentes no cambian; no se podrán crear nuevos con este formato.';
      expect(panel().textContent).not.toContain(note);

      active().click();
      await settle();

      expect(panel().textContent).toContain(note);
      expect(active().getAttribute('aria-describedby')).toBeTruthy();
      expect(saved).toEqual([]);

      active().click();
      await settle();

      expect(panel().textContent).not.toContain(note);
    });

    it('does not show the note for a type nobody uses', async () => {
      await render({ format: unused });

      active().click();
      await settle();

      expect(panel().textContent).not.toContain('Los beneficios existentes no cambian');
    });

    it('does not show the note when creating', async () => {
      await render({});

      active().click();
      await settle();

      expect(panel().textContent).not.toContain('Los beneficios existentes no cambian');
    });
  });

  describe('focus', () => {
    it('moves the focus to the format select when creating', async () => {
      await render({});

      expect(document.activeElement).toBe(select());
    });

    it('moves the focus to the name when editing', async () => {
      await render({ format: descuento });

      expect(document.activeElement).toBe(nameInput());
    });

    it('wraps Tab from the last control to the first', async () => {
      await render({});
      button('Guardar').focus();

      const event = await press('Tab');

      expect(event.defaultPrevented).toBe(true);
      expect(document.activeElement).toBe(button('Cerrar'));
    });

    it('wraps Shift+Tab from the first control to the last', async () => {
      await render({});
      button('Cerrar').focus();

      const event = await press('Tab', true);

      expect(event.defaultPrevented).toBe(true);
      expect(document.activeElement).toBe(button('Guardar'));
    });

    it('leaves Tab alone between the controls of the drawer', async () => {
      await render({});
      nameInput().focus();

      const tab = await press('Tab');
      const shiftTab = await press('Tab', true);

      expect(tab.defaultPrevented).toBe(false);
      expect(shiftTab.defaultPrevented).toBe(false);
    });

    it('wraps within the controls that exist when editing, where the format is not a field', async () => {
      await render({ format: descuento });
      button('Guardar').focus();

      await press('Tab');

      expect(document.activeElement).toBe(button('Cerrar'));
    });

    it('returns the focus to the element it was given when it is destroyed', async () => {
      const trigger = document.createElement('button');
      document.body.appendChild(trigger);
      await render({ returnFocusTo: trigger });

      fixture.destroy();

      expect(document.activeElement).toBe(trigger);
      trigger.remove();
    });

    it('falls back to the given element when the one to return to is disabled', async () => {
      const trigger = document.createElement('button');
      const fallback = document.createElement('main');
      fallback.tabIndex = -1;
      document.body.append(trigger, fallback);
      await render({ returnFocusTo: trigger, fallbackFocus: fallback });
      trigger.disabled = true;

      fixture.destroy();

      expect(document.activeElement).toBe(fallback);
      trigger.remove();
      fallback.remove();
    });

    it('falls back to the given element when the one to return to is gone', async () => {
      const trigger = document.createElement('button');
      const fallback = document.createElement('main');
      fallback.tabIndex = -1;
      document.body.append(trigger, fallback);
      await render({ returnFocusTo: trigger, fallbackFocus: fallback });
      trigger.remove();

      fixture.destroy();

      expect(document.activeElement).toBe(fallback);
      fallback.remove();
    });

    it('does not fail when that element is gone', async () => {
      const trigger = document.createElement('button');
      document.body.appendChild(trigger);
      await render({ returnFocusTo: trigger });
      trigger.remove();

      expect(() => fixture.destroy()).not.toThrow();
    });
  });

  describe('closing', () => {
    it('emits cancel with the Cancelar button, the close button, Escape and the backdrop', async () => {
      await render({});
      let cancelled = 0;
      fixture.componentInstance.cancel.subscribe(() => cancelled++);

      button('Cancelar').click();
      button('Cerrar').click();
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      element.querySelector<HTMLElement>('[data-testid="benefit-format-drawer-backdrop"]')!.click();

      expect(cancelled).toBe(4);
    });

    it('cannot be closed or submitted while saving', async () => {
      await render({});
      fixture.componentRef.setInput('isProcessing', true);
      await settle();
      let cancelled = 0;
      fixture.componentInstance.cancel.subscribe(() => cancelled++);

      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));

      expect(cancelled).toBe(0);
      expect(button('Guardar').disabled).toBe(true);
      expect(button('Cancelar').disabled).toBe(true);
    });
  });
});
