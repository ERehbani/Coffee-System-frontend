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
      email: 'elena.rostova@coffeesystem.admin',
      role: 'superadmin',
      status: 'active',
      createdAt: new Date('2023-01-10T08:30:00.000Z'),
    },
    {
      id: 'USR-2003',
      email: 'andres@velvetbrew.com',
      role: 'cafe_admin',
      status: 'active',
      createdAt: new Date('2026-10-18T11:45:00.000Z'),
    },
    {
      id: 'USR-3001',
      email: 'sofia.martinez@email.com',
      role: 'client',
      status: 'active',
      createdAt: new Date('2024-02-14T10:00:00.000Z'),
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
    expect(compiled.textContent).toContain('elena.rostova@coffeesystem.admin');
    expect(compiled.textContent).toContain('andres@velvetbrew.com');
    expect(compiled.textContent).toContain('sofia.martinez@email.com');
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
    expect(modalText).toContain('elena.rostova@coffeesystem.admin');
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

  it('should show the client account without invented loyalty data', () => {
    store.selectUser(mockUsers[2]);
    fixture.detectChanges();

    const modal = fixture.nativeElement.querySelector('app-user-detail-modal');
    expect(modal).toBeTruthy();

    const modalText = modal.textContent;
    expect(modalText).toContain('sofia.martinez@email.com');
    expect(modalText).toContain('Cliente / Consumidor');
    expect(modalText).not.toContain('pts');
    expect(modalText).not.toContain('Auditoría de Programa de Fidelización');
    expect(modalText).not.toContain('ID en Base de Datos');
    expect(modalText).not.toContain('Email Verificado');
    expect(modalText).not.toContain('Seguridad 2FA');
  });

  it('should display the cafe account without invented cafe details, pending request banner, activate button, or database id', () => {
    store.selectUser(mockUsers[1]);
    fixture.detectChanges();

    const modal = fixture.nativeElement.querySelector('app-user-detail-modal');
    expect(modal).toBeTruthy();

    const modalText = modal.textContent;
    expect(modalText).toContain('andres@velvetbrew.com');
    expect(modalText).toContain('Administrador de Comercio');
    expect(modalText).not.toContain('Auditoría de Cafetería / Comercio Asociado');
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

    const buttons = modal.querySelectorAll('button');
    const deactivateBtn = Array.from(buttons).find((b: any) =>
      b.textContent?.includes('Dar de baja usuario')
    ) as HTMLButtonElement;

    expect(deactivateBtn).toBeTruthy();
    deactivateBtn.click();
    fixture.detectChanges();

    expect(modal.textContent).toContain('¿Confirmar baja?');

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
    input.value = 'sofia';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(store.searchQuery()).toBe('sofia');
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('sofia.martinez@email.com');
    expect(compiled.textContent).not.toContain('elena.rostova@coffeesystem.admin');
  });
});
