import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { AdminClientStore } from '../../services/admin-client.store';
import { AdminUserRepository } from '../../services/admin-user.repository';
import { AdminUser } from '../../types/admin-user.model';
import { TEST_CAFE_ADMIN, TEST_CLIENT_SOFIA } from '../../utils/admin-client.test-data';
import { AdminClientDetailPage } from './admin-client-detail-page';

describe('AdminClientDetailPage', () => {
  let fixture: ComponentFixture<AdminClientDetailPage>;
  let element: HTMLElement;

  async function render(id: string, getClients: () => Observable<readonly AdminUser[]>) {
    await TestBed.configureTestingModule({
      imports: [AdminClientDetailPage],
      providers: [
        provideRouter([]),
        AdminClientStore,
        { provide: AdminUserRepository, useValue: { getClients } },
        { provide: ActivatedRoute, useValue: { paramMap: of(convertToParamMap({ id })) } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminClientDetailPage);
    fixture.detectChanges();
    element = fixture.nativeElement;
  }

  const text = (testId: string) =>
    element.querySelector(`[data-testid="${testId}"]`)?.textContent?.trim();

  it('CA: shows the client data and associated points', async () => {
    await render('USR-3001', () => of([TEST_CLIENT_SOFIA, TEST_CAFE_ADMIN]));

    expect(element.querySelector('h1')?.textContent).toContain('Sofía Martínez');
    expect(element.textContent).toContain('USR-3001');
    expect(element.textContent).toContain('sofia.martinez@email.com');
    expect(element.textContent).toContain('+54 11 6543-9870');
    expect(element.textContent).toContain('Google');
    expect(text('client-status')).toBe('Activo');
    expect(text('client-tier')).toBe('Diamante');
    expect(text('client-available-points')).toBe('4,520 pts');
    expect(text('client-lifetime-points')).toBe('12,450 pts');
    expect(element.textContent).toContain('Café Central');
  });

  it('shows not found for an id that is not a client', async () => {
    await render('USR-2001', () => of([TEST_CLIENT_SOFIA, TEST_CAFE_ADMIN]));

    expect(element.querySelector('[data-testid="client-not-found"]')).not.toBeNull();
    expect(element.textContent).not.toContain('Mateo Valenzuela');
  });

  it('shows an error with retry when loading fails', async () => {
    await render('USR-3001', () => throwError(() => new Error('boom')));

    expect(element.querySelector('[role="alert"]')?.textContent).toContain('No se pudo cargar');
  });

  it('links back to the client list', async () => {
    await render('USR-3001', () => of([TEST_CLIENT_SOFIA]));

    expect(element.querySelector('a')?.getAttribute('href')).toBe('/admin/clients');
  });
});
