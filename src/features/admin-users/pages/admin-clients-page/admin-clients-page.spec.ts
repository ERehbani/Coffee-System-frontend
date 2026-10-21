import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of } from 'rxjs';
import { AdminClientStore } from '../../services/admin-client.store';
import { AdminUserRepository } from '../../services/admin-user.repository';
import {
  TEST_CAFE_ADMIN,
  TEST_CLIENT_JUAN,
  TEST_CLIENT_SOFIA,
} from '../../utils/admin-client.test-data';
import { AdminClientsPage } from './admin-clients-page';

describe('AdminClientsPage', () => {
  let fixture: ComponentFixture<AdminClientsPage>;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminClientsPage],
      providers: [
        provideRouter([]),
        AdminClientStore,
        {
          provide: AdminUserRepository,
          useValue: { getClients: () => of([TEST_CLIENT_SOFIA, TEST_CAFE_ADMIN, TEST_CLIENT_JUAN]) },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminClientsPage);
    fixture.detectChanges();
    element = fixture.nativeElement;
  });

  it('CA: shows a table with only the users that have the client role', () => {
    const rows = element.querySelectorAll('[data-testid="client-row"]');

    expect(rows).toHaveLength(2);
    expect(element.textContent).toContain('Sofía Martínez');
    expect(element.textContent).toContain('Juan Pérez');
    expect(element.textContent).not.toContain('Mateo Valenzuela');
    expect(element.querySelector('[data-testid="stat-total"]')?.textContent?.trim()).toBe('2');
  });

  it('shows tier and available points for each client', () => {
    const firstRow = element.querySelector('[data-testid="client-row"]')!;

    expect(firstRow.textContent).toContain('Diamante');
    expect(firstRow.textContent).toContain('4,520');
  });

  it('CA: opens the client detail when a row is clicked', () => {
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);

    (element.querySelector('[data-testid="client-row"]') as HTMLElement).click();

    expect(navigate).toHaveBeenCalledWith(['/admin/clients', 'USR-3001']);
  });

  it('links each row to its detail page', () => {
    const link = element.querySelector('a[aria-label="Ver detalle de Juan Pérez"]');

    expect(link?.getAttribute('href')).toBe('/admin/clients/USR-3002');
  });

  it('shows an empty state when no client matches the filters', () => {
    const input = element.querySelector('input[type="text"]') as HTMLInputElement;
    input.value = 'nadie';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(element.querySelectorAll('[data-testid="client-row"]')).toHaveLength(0);
    expect(element.textContent).toContain('No se encontraron clientes');
  });
});
