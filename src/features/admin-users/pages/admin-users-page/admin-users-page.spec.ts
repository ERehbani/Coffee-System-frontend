import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { AdminUserRepository } from '../../services/admin-user.repository';
import { AdminUserStore } from '../../services/admin-user.store';
import { AdminUser, UserStatus } from '../../types/admin-user.model';
import { AdminUsersPage } from './admin-users-page';

describe('AdminUsersPage', () => {
  let fixture: ComponentFixture<AdminUsersPage>;
  let component: AdminUsersPage;
  let store: AdminUserStore;

  const mockUsers: readonly AdminUser[] = [
    {
      id: 'USR-1001',
      firstName: 'Elena',
      lastName: 'Rostova',
      fullName: 'Elena Rostova',
      email: 'elena.rostova@coffeesystem.admin',
      phoneNumber: '+54 11 4521-8890',
      avatarUrl: null,
      role: 'superadmin',
      status: 'active',
      createdAt: new Date('2023-01-10T08:30:00.000Z'),
      lastLoginAt: new Date('2026-10-20T10:15:22.000Z'),
      emailVerified: true,
      twoFactorEnabled: true,
      authProvider: 'email_password',
      notes: 'Superadministradora fundadora.',
      superadminDetails: {
        accessLevel: 'Control Total',
        department: 'Seguridad y Operaciones',
        lastAuditAction: 'Modificación de parámetros',
        ipAddressLastLogin: '190.210.45.12',
      },
    },
    {
      id: 'USR-2003',
      firstName: 'Andrés',
      lastName: 'Morales',
      fullName: 'Andrés Morales',
      email: 'contacto@velvetbrew.com',
      phoneNumber: '+54 11 9812-7634',
      avatarUrl: null,
      role: 'cafe_admin',
      status: 'active',
      createdAt: new Date('2026-10-18T11:45:00.000Z'),
      lastLoginAt: new Date('2026-10-19T14:10:00.000Z'),
      emailVerified: true,
      twoFactorEnabled: false,
      authProvider: 'email_password',
      notes: 'Cafetería habilitada',
      cafeAdminDetails: {
        cafeId: 'cafe-velvet-brew',
        cafeName: 'Velvet Specialty Brew',
        cafeRole: 'Comercio Asociado',
        cafeAddress: 'Thames 1720',
        branchCount: 1,
      },
    },
    {
      id: 'USR-3001',
      firstName: 'Sofía',
      lastName: 'Martínez',
      fullName: 'Sofía Martínez',
      email: 'sofia.martinez@email.com',
      phoneNumber: '+54 11 6543-9870',
      avatarUrl: null,
      role: 'client',
      status: 'active',
      createdAt: new Date('2024-02-14T10:00:00.000Z'),
      lastLoginAt: new Date('2026-10-20T07:50:23.000Z'),
      emailVerified: true,
      twoFactorEnabled: true,
      authProvider: 'google',
      notes: 'Cliente diamante',
      clientDetails: {
        loyaltyTier: 'diamond',
        availablePoints: 4520,
        lifetimePoints: 12450,
        redemptionsCount: 24,
        preferredCafe: 'Café Central',
      },
    },
  ];

  const mockRepository: Partial<AdminUserRepository> = {
    getUsers: vi.fn().mockReturnValue(of(mockUsers)),
    getUserById: vi.fn().mockImplementation((id: string) =>
      of(mockUsers.find((u) => u.id === id) ?? null)
    ),
    updateUserStatus: vi.fn().mockImplementation((id: string, status: UserStatus) => {
      const found = mockUsers.find((u) => u.id === id);
      return of({ ...found!, status });
    }),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminUsersPage],
      providers: [
        provideRouter([]),
        AdminUserStore,
        { provide: AdminUserRepository, useValue: mockRepository },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminUsersPage);
    component = fixture.componentInstance;
    store = TestBed.inject(AdminUserStore);
    fixture.detectChanges();
  });

  it('should create and render header title and stats', () => {
    expect(component).toBeTruthy();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Auditoría de Usuarios');
    expect(compiled.textContent).toContain('Total Registrados');
    expect(compiled.textContent).toContain('3');
  });

  it('should render table with all registered users', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Elena Rostova');
    expect(compiled.textContent).toContain('elena.rostova@coffeesystem.admin');
    expect(compiled.textContent).toContain('Andrés Morales');
    expect(compiled.textContent).toContain('Velvet Specialty Brew');
    expect(compiled.textContent).toContain('Sofía Martínez');
  });

  it('should not show modal initially when no user is selected', () => {
    const modal = fixture.nativeElement.querySelector('app-user-detail-modal');
    expect(modal).toBeNull();
  });

  it('should open modal with superadmin attributes without security audit section or audit notes', () => {
    store.selectUser(mockUsers[0]);
    fixture.detectChanges();

    const modal = fixture.nativeElement.querySelector('app-user-detail-modal');
    expect(modal).toBeTruthy();

    const modalText = modal.textContent;
    expect(modalText).toContain('Elena Rostova');
    expect(modalText).not.toContain('Privilegios y Auditoría de Seguridad');
    expect(modalText).not.toContain('Control Total');
    expect(modalText).not.toContain('Seguridad y Operaciones');
    expect(modalText).not.toContain('190.210.45.12');
    expect(modalText).not.toContain('Notas de Auditoría y Observaciones');
    expect(modalText).not.toContain('ID en Base de Datos');
    expect(modalText).not.toContain('Email Verificado');
    expect(modalText).not.toContain('Seguridad 2FA');
    expect(modalText).not.toContain('Autenticación');
  });

  it('should show client-specific attributes in modal when client is selected', () => {
    store.selectUser(mockUsers[2]);
    fixture.detectChanges();

    const modal = fixture.nativeElement.querySelector('app-user-detail-modal');
    expect(modal).toBeTruthy();

    const modalText = modal.textContent;
    expect(modalText).toContain('Sofía Martínez');
    expect(modalText).toContain('4520 pts');
    expect(modalText).toContain('12450 pts');
    expect(modalText).toContain('Café Central');
    expect(modalText).not.toContain('ID en Base de Datos');
    expect(modalText).not.toContain('Email Verificado');
    expect(modalText).not.toContain('Seguridad 2FA');
  });

  it('should display cafe details without pending request banner, activate button, or database id', () => {
    store.selectUser(mockUsers[1]);
    fixture.detectChanges();

    const modal = fixture.nativeElement.querySelector('app-user-detail-modal');
    expect(modal).toBeTruthy();

    const modalText = modal.textContent;
    expect(modalText).toContain('Andrés Morales');
    expect(modalText).toContain('Velvet Specialty Brew');
    expect(modalText).toContain('Thames 1720');
    expect(modalText).not.toContain('Solicitud de Cafetería Pendiente');
    expect(modalText).not.toContain('Activar Cafetería');
    expect(modalText).not.toContain('ID en Base de Datos');
    expect(modalText).not.toContain('Email Verificado');
    expect(modalText).not.toContain('Seguridad 2FA');
  });

  it('should allow giving a user de baja (inactive) with confirmation in the modal', () => {
    store.selectUser(mockUsers[2]);
    fixture.detectChanges();

    const modal = fixture.nativeElement.querySelector('app-user-detail-modal');

    // Click "Dar de baja usuario"
    const buttons = modal.querySelectorAll('button');
    const deactivateBtn = Array.from(buttons).find((b: any) =>
      b.textContent?.includes('Dar de baja usuario')
    ) as HTMLButtonElement;

    expect(deactivateBtn).toBeTruthy();
    deactivateBtn.click();
    fixture.detectChanges();

    // Confirmation prompt appears
    expect(modal.textContent).toContain('¿Confirmar baja?');

    // Click confirm button
    const confirmBtn = Array.from(modal.querySelectorAll('button')).find((b: any) =>
      b.textContent?.includes('Sí, dar de baja')
    ) as HTMLButtonElement;

    expect(confirmBtn).toBeTruthy();
    confirmBtn.click();
    fixture.detectChanges();

    expect(mockRepository.updateUserStatus).toHaveBeenCalledWith('USR-3001', 'inactive');
    expect(store.selectedUser()?.status).toBe('inactive');
  });

  it('should close modal when close event is emitted', () => {
    store.selectUser(mockUsers[0]);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('app-user-detail-modal')).toBeTruthy();

    const closeBtn = fixture.nativeElement.querySelector('button[aria-label="Cerrar ventana de detalles"]') as HTMLButtonElement;
    closeBtn.click();
    fixture.detectChanges();

    expect(store.selectedUser()).toBeNull();
    expect(fixture.nativeElement.querySelector('app-user-detail-modal')).toBeNull();
  });

  it('should filter table when search input changes', () => {
    const input = fixture.nativeElement.querySelector('input[type="text"]') as HTMLInputElement;
    input.value = 'Sofía';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(store.searchQuery()).toBe('Sofía');
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Sofía Martínez');
    expect(compiled.textContent).not.toContain('Elena Rostova');
  });
});
