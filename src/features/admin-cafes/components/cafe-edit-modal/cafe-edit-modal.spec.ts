import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Cafe, UpdateCafeRequest } from '../../../home/model/cafe.model';
import { CafeEditModal } from './cafe-edit-modal';

describe('CafeEditModal', () => {
  const cafe: Cafe = {
    externalId: 'cafe-1',
    name: 'Café Aroma',
    address: 'Calle San Martín 100',
    email: 'aroma@cafe.com',
    phoneNumber: '1122334455',
    description: 'Café de especialidad',
    state: true,
    openNow: true,
    logo: 'https://img/logo.png',
    image: 'https://img/portada.png',
  };
  let fixture: ComponentFixture<CafeEditModal>;
  let element: HTMLElement;
  let submitted: UpdateCafeRequest | null;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [CafeEditModal] }).compileComponents();
    fixture = TestBed.createComponent(CafeEditModal);
    element = fixture.nativeElement;
    submitted = null;
    fixture.componentInstance.submitted.subscribe((request) => (submitted = request));
    fixture.componentRef.setInput('cafe', cafe);
    fixture.detectChanges();
    TestBed.flushEffects();
    fixture.detectChanges();
  });

  function type(selector: string, value: string): void {
    const input = element.querySelector<HTMLInputElement>(selector)!;
    input.value = value;
    input.dispatchEvent(new Event('input'));
  }

  function submit(): void {
    element.querySelector('form')!.dispatchEvent(new Event('submit'));
    fixture.detectChanges();
  }

  it('no se muestra mientras no hay una cafetería para editar', () => {
    fixture.componentRef.setInput('cafe', null);
    fixture.detectChanges();

    expect(element.querySelector('[role="dialog"]')).toBeNull();
  });

  it('carga los datos actuales de la cafetería', () => {
    expect(element.querySelector<HTMLInputElement>('#edit-cafe-name')!.value).toBe('Café Aroma');
    expect(element.querySelector<HTMLInputElement>('#edit-cafe-address')!.value).toBe(
      'Calle San Martín 100',
    );
    expect(element.querySelector<HTMLInputElement>('#edit-cafe-phone')!.value).toBe('1122334455');
  });

  it('manda los cambios y conserva el logo y la portada de la cafetería', () => {
    type('#edit-cafe-name', '  Café Aroma Palermo ');
    type('#edit-cafe-phone', '');
    submit();

    expect(submitted).toEqual({
      name: 'Café Aroma Palermo',
      address: 'Calle San Martín 100',
      phoneNumber: null,
      description: 'Café de especialidad',
      logo: 'https://img/logo.png',
      image: 'https://img/portada.png',
    });
  });

  it('pide un teléfono de 10 números, como el perfil de la cafetería', () => {
    type('#edit-cafe-phone', '11 2233-4455');
    submit();

    expect(element.textContent).toContain('El teléfono tiene que tener 10 números');
    expect(submitted).toBeNull();
  });

  it('no deja guardar sin nombre ni dirección', () => {
    type('#edit-cafe-name', '');
    type('#edit-cafe-address', '');
    submit();

    expect(element.textContent).toContain('El nombre de la cafetería es obligatorio.');
    expect(element.textContent).toContain('La dirección es obligatoria.');
    expect(submitted).toBeNull();
  });

  it('muestra el error que le pasa la página', () => {
    fixture.componentRef.setInput('errorMessage', 'El nombre debe tener entre 2 y 80 caracteres');
    fixture.detectChanges();

    expect(element.querySelector('[data-testid="edit-cafe-error"]')?.textContent).toContain(
      'El nombre debe tener entre 2 y 80 caracteres',
    );
  });
});
