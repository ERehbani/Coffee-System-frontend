import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { AdminCafeRepository } from '../../services/admin-cafe.repository';
import { AdminCafeStore } from '../../services/admin-cafe.store';
import { AdminCafe } from '../../types/admin-cafe.model';
import { AdminCafesPage } from './admin-cafes-page';

describe('AdminCafesPage', () => {
  let fixture: ComponentFixture<AdminCafesPage>;
  let component: AdminCafesPage;
  let store: AdminCafeStore;

  const mockCafes: readonly AdminCafe[] = [
    {
      externalId: 'cafe-central-001',
      name: 'Café Central',
      address: 'Av. Corrientes 1450, CABA',
      email: 'contacto@cafecentral.com',
      phoneNumber: '+54 11 4523-8890',
      description: 'Café clásico de especialidad',
      state: true,
      schedule: 'Lun a Vie 08:00 - 20:00',
      image: 'https://sample.com/central.jpg',
      createdAt: '2023-01-01T00:00:00.000Z',
      rating: 4.8,
      totalReviews: 50,
    },
    {
      externalId: 'cafe-tostado-002',
      name: 'Tostado Club',
      address: 'Thames 1600, Palermo',
      email: 'admin@tostado.com',
      phoneNumber: '+54 11 4833-9090',
      description: 'Toasties y café',
      state: false,
      schedule: 'Lun a Dom 09:00 - 19:00',
      image: 'https://sample.com/tostado.jpg',
      createdAt: '2023-05-01T00:00:00.000Z',
      rating: 4.5,
      totalReviews: 20,
    },
  ];

  beforeEach(async () => {
    const mockRepo: Partial<AdminCafeRepository> = {
      getCafes: vi.fn().mockReturnValue(of(mockCafes)),
      getCafeById: vi.fn(),
      registerCafe: vi.fn().mockReturnValue(
        of({
          externalId: 'cafe-nuevo-999',
          name: 'Café Latte Art',
          address: 'Av. Santa Fe 2000',
          email: 'contacto@latteart.coffee',
          phoneNumber: '+54 11 9999-8888',
          description: 'Café de autor',
          state: true,
          schedule: '08:00 - 20:00',
          image: 'https://sample.com/latte.jpg',
          createdAt: '2026-10-22T00:00:00.000Z',
          rating: 5.0,
          totalReviews: 0,
        }),
      ),
      updateCafeStatus: vi.fn().mockImplementation((id, state) => {
        const found = mockCafes.find((c) => c.externalId === id);
        return of({ ...found!, state });
      }),
    };

    await TestBed.configureTestingModule({
      imports: [AdminCafesPage],
      providers: [
        provideRouter([]),
        AdminCafeStore,
        { provide: AdminCafeRepository, useValue: mockRepo },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminCafesPage);
    component = fixture.componentInstance;
    store = TestBed.inject(AdminCafeStore);
    fixture.detectChanges();
  });

  it('renders the header and action buttons', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('h1')?.textContent).toContain('Cafeterías del Sistema');
    expect(el.textContent).toContain('Dar de Alta Cafetería');
  });

  it('renders the stats ribbon counters correctly', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Total Comercios');
    expect(store.stats().totalCafes).toBe(2);
    expect(store.stats().activeCafes).toBe(1);
    expect(store.stats().inactiveCafes).toBe(1);
  });

  it('renders cafeterias in the table', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Café Central');
    expect(el.textContent).toContain('Tostado Club');
  });

  it('filters cafeterias when search query is typed', () => {
    const el = fixture.nativeElement as HTMLElement;
    const searchInput = el.querySelector('input[type="text"]') as HTMLInputElement;

    searchInput.value = 'Central';
    searchInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(store.filteredCafes().length).toBe(1);
    expect(store.filteredCafes()[0].name).toBe('Café Central');
  });

  it('filters cafeterias by state', () => {
    const el = fixture.nativeElement as HTMLElement;
    const select = el.querySelector('select') as HTMLSelectElement;

    select.value = 'inactive';
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    expect(store.filteredCafes().length).toBe(1);
    expect(store.filteredCafes()[0].name).toBe('Tostado Club');
  });

  it('opens and closes the detail modal', () => {
    const el = fixture.nativeElement as HTMLElement;
    const row = el.querySelector('tbody tr') as HTMLElement;
    row.click();
    fixture.detectChanges();

    expect(store.selectedCafe()).not.toBeNull();
    expect(el.querySelector('app-cafe-detail-modal')).not.toBeNull();

    // Close detail modal
    const closeBtn = el.querySelector('app-cafe-detail-modal button[aria-label="Cerrar modal"]') as HTMLButtonElement;
    closeBtn?.click();
    fixture.detectChanges();

    expect(store.selectedCafe()).toBeNull();
  });

  it('opens and closes the register modal', () => {
    const el = fixture.nativeElement as HTMLElement;
    const registerBtn = el.querySelector('button[title="Registrar una nueva cafetería"]') as HTMLButtonElement;
    registerBtn.click();
    fixture.detectChanges();

    expect(store.isRegisterModalOpen()).toBe(true);
    expect(el.querySelector('app-cafe-register-modal')).not.toBeNull();

    // Close register modal
    const closeBtn = el.querySelector('app-cafe-register-modal button[aria-label="Cerrar modal de registro"]') as HTMLButtonElement;
    closeBtn.click();
    fixture.detectChanges();

    expect(store.isRegisterModalOpen()).toBe(false);
  });

  it('allows registering a new cafe from the modal', () => {
    store.openRegisterModal();
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    const nameInput = el.querySelector('#cafe-name') as HTMLInputElement;
    const emailInput = el.querySelector('#cafe-email') as HTMLInputElement;
    const passInput = el.querySelector('#cafe-password') as HTMLInputElement;
    const confirmPassInput = el.querySelector('#cafe-confirm-password') as HTMLInputElement;
    const addressInput = el.querySelector('#cafe-address') as HTMLInputElement;

    nameInput.value = 'Café Latte Art';
    nameInput.dispatchEvent(new Event('input'));
    emailInput.value = 'contacto@latteart.coffee';
    emailInput.dispatchEvent(new Event('input'));
    passInput.value = 'Password123';
    passInput.dispatchEvent(new Event('input'));
    confirmPassInput.value = 'Password123';
    confirmPassInput.dispatchEvent(new Event('input'));
    addressInput.value = 'Av. Santa Fe 2000';
    addressInput.dispatchEvent(new Event('input'));

    fixture.detectChanges();

    const submitBtn = el.querySelector('app-cafe-register-modal button[type="submit"]') as HTMLButtonElement;
    expect(submitBtn.disabled).toBe(false);
    submitBtn.click();
    fixture.detectChanges();

    expect(store.isRegisterModalOpen()).toBe(false);
    expect(store.cafes()[0].name).toBe('Café Latte Art');
  });

  it('allows toggling status of a cafe', () => {
    expect(store.cafes()[0].state).toBe(true);

    component['onToggleStatus']({ externalId: 'cafe-central-001', state: false });
    fixture.detectChanges();

    expect(store.cafes().find((c) => c.externalId === 'cafe-central-001')?.state).toBe(false);
  });

  it('configures schedule using the 3 selects (days with checkboxes, open time, close time)', () => {
    store.openRegisterModal();
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;

    // Open days dropdown
    const daysBtn = el.querySelector('#days-dropdown-btn') as HTMLButtonElement;
    expect(daysBtn).not.toBeNull();
    daysBtn.click();
    fixture.detectChanges();

    // 7 day checkboxes should be present
    const checkboxes = el.querySelectorAll('input[type="checkbox"]');
    expect(checkboxes.length).toBe(7);

    // Click 'Todos' preset button
    const allDaysBtn = Array.from(el.querySelectorAll('button')).find(
      (b) => b.textContent?.trim() === 'Todos',
    );
    allDaysBtn?.click();
    fixture.detectChanges();

    // Select open and close times
    const openSelect = el.querySelector('#cafe-open-time') as HTMLSelectElement;
    const closeSelect = el.querySelector('#cafe-close-time') as HTMLSelectElement;

    expect(openSelect).not.toBeNull();
    expect(closeSelect).not.toBeNull();

    openSelect.selectedIndex = Array.from(openSelect.options).findIndex(
      (o) => o.value === '09:00',
    );
    openSelect.dispatchEvent(new Event('change'));

    closeSelect.selectedIndex = Array.from(closeSelect.options).findIndex(
      (o) => o.value === '21:00',
    );
    closeSelect.dispatchEvent(new Event('change'));

    fixture.detectChanges();

    expect(el.textContent).toContain('Todos los días 09:00 - 21:00');
  });
});
