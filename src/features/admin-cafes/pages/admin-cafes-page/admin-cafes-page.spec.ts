import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { Cafe } from '../../../home/model/cafe.model';
import { CafeService } from '../../../home/services/cafe.service';
import { CafeRegisterModal } from '../../components/cafe-register-modal/cafe-register-modal';
import { AdminCafesPage } from './admin-cafes-page';

describe('AdminCafesPage', () => {
  let fixture: ComponentFixture<AdminCafesPage>;
  let component: AdminCafesPage;

  const mockCafes: Cafe[] = [
    {
      externalId: 'cafe-1',
      name: 'Café Aroma',
      address: 'Calle San Martín 100',
      email: 'aroma@cafe.com',
      phoneNumber: '+54 11 1111-2222',
      description: 'Café de especialidad',
      state: true,
      schedule: 'Lun a Vie 08:00 - 20:00',
    },
    {
      externalId: 'cafe-2',
      name: 'Café Luna',
      address: 'Av. Corrientes 200',
      email: 'luna@cafe.com',
      phoneNumber: null,
      description: null,
      state: false,
      schedule: null,
    },
  ];

  const mockCafeService = {
    getAll: vi.fn().mockReturnValue(of(mockCafes)),
    getByExternalId: vi.fn().mockImplementation((id: string) =>
      of(mockCafes.find((c) => c.externalId === id))
    ),
    register: vi.fn().mockReturnValue(
      of({ externalId: 'cafe-3', email: 'nuevo@cafe.com', state: true })
    ),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminCafesPage],
      providers: [
        provideRouter([]),
        { provide: CafeService, useValue: mockCafeService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminCafesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('lista las cafeterías y muestra «Activa» / «Inactiva» según state', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Café Aroma');
    expect(compiled.textContent).toContain('Café Luna');

    const rows = compiled.querySelectorAll('tbody tr');
    expect(rows.length).toBe(2);

    expect(rows[0].textContent).toContain('Café Aroma');
    expect(rows[0].textContent).toContain('Activa');
    expect(rows[0].textContent).not.toContain('Inactiva');

    expect(rows[1].textContent).toContain('Café Luna');
    expect(rows[1].textContent).toContain('Inactiva');
  });

  it('el filtro «Inactivas» deja sólo las de state: false', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const buttons = Array.from(compiled.querySelectorAll('button'));
    const inactiveBtn = buttons.find((btn) => btn.textContent?.includes('Inactivas'));
    expect(inactiveBtn).toBeTruthy();

    inactiveBtn?.click();
    fixture.detectChanges();

    const rows = compiled.querySelectorAll('tbody tr');
    expect(rows.length).toBe(1);
    expect(rows[0].textContent).toContain('Café Luna');
    expect(rows[0].textContent).toContain('Inactiva');
    expect(compiled.textContent).not.toContain('Café Aroma');
    expect(component.filteredCafes().every((c) => !c.state)).toBe(true);
  });

  it('después de un alta exitosa, al reabrir el modal, el campo de correo está vacío', () => {
    component.openRegister();
    fixture.detectChanges();
    TestBed.flushEffects();

    const modalDebug = fixture.debugElement.query(By.directive(CafeRegisterModal));
    expect(modalDebug).toBeTruthy();
    const modalComponent = modalDebug.componentInstance as CafeRegisterModal;

    modalComponent.cafeModel.set({
      email: 'nuevo@cafe.com',
      password: 'Password123',
      name: 'Nuevo Café',
      address: 'Av. Libertador 500',
      phoneNumber: '12345678',
      schedule: 'Lun a Vie 08:00 - 20:00',
      description: 'Una descripción',
    });
    fixture.detectChanges();

    const emailInput = fixture.nativeElement.querySelector('input[type="email"]') as HTMLInputElement;
    expect(emailInput.value).toBe('nuevo@cafe.com');

    component.onRegisterCafe({
      email: 'nuevo@cafe.com',
      password: 'Password123',
      name: 'Nuevo Café',
      address: 'Av. Libertador 500',
      phoneNumber: '12345678',
      schedule: 'Lun a Vie 08:00 - 20:00',
      description: 'Una descripción',
    });
    TestBed.flushEffects();
    fixture.detectChanges();

    expect(component.isRegisterOpen()).toBe(false);

    component.openRegister();
    TestBed.flushEffects();
    fixture.detectChanges();

    expect(modalComponent.cafeModel().email).toBe('');
    const emailInputAfter = fixture.nativeElement.querySelector('input[type="email"]') as HTMLInputElement;
    expect(emailInputAfter.value).toBe('');
    expect(modalComponent.attemptedSubmit()).toBe(false);
    expect(modalComponent.cafeModel().schedule).toBe('Lun a Vie 08:00 - 20:00');
  });
});

