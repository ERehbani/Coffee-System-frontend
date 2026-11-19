import { registerLocaleData } from '@angular/common';
import localeEsAr from '@angular/common/locales/es-AR';
import { LOCALE_ID } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Observable, of, throwError } from 'rxjs';
import { AdminClientRepository } from '../../services/admin-client.repository';
import { AdminClientStore } from '../../services/admin-client.store';
import { AdminClient } from '../../types/admin-client.model';
import { buildAdminClient } from '../../utils/admin-client.fixture';
import { AdminClientsPage } from './admin-clients-page';

registerLocaleData(localeEsAr);

describe('AdminClientsPage', () => {
  let fixture: ComponentFixture<AdminClientsPage>;

  const clients: readonly AdminClient[] = [
    buildAdminClient({
      id: 'c1',
      displayName: 'Ana Pérez',
      email: 'ana@test.com',
      tierName: 'PLATA',
      currentPoints: 320,
      historicalPoints: 1250,
      spentPoints: 930,
    }),
    buildAdminClient({
      id: 'c2',
      displayName: 'Bruno Díaz',
      firstName: 'Bruno',
      lastName: 'Díaz',
      email: 'bruno@test.com',
    }),
  ];

  async function render(getClients: () => Observable<readonly AdminClient[]>): Promise<void> {
    await TestBed.configureTestingModule({
      imports: [AdminClientsPage],
      providers: [
        AdminClientStore,
        { provide: AdminClientRepository, useValue: { getClients } },
        { provide: LOCALE_ID, useValue: 'es-AR' },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminClientsPage);
    fixture.detectChanges();
  }

  const page = () => fixture.nativeElement as HTMLElement;
  const modal = () => page().querySelector('app-client-detail-modal');

  function openDetailOf(name: string): void {
    const row = page().querySelector(`tr[aria-label="Ver detalle de ${name}"]`) as HTMLElement;
    const button = row.querySelector('button[aria-label="Ver detalle"]') as HTMLButtonElement;
    button.click();
    fixture.detectChanges();
  }

  it('shows the title, the summary and one row per client', async () => {
    await render(() => of(clients));

    expect(page().querySelector('h1')?.textContent?.trim()).toBe('Clientes');
    expect(page().textContent).toContain('Puntos disponibles');
    expect(page().querySelectorAll('tbody tr').length).toBe(2);
    expect(page().textContent).toContain('Ana Pérez');
    expect(page().textContent).toContain('bruno@test.com');
  });

  it('does not show the detail until a client is chosen', async () => {
    await render(() => of(clients));

    expect(modal()).toBeNull();
  });

  it('opens the detail with the data and points of the client', async () => {
    await render(() => of(clients));

    openDetailOf('Ana Pérez');

    const text = modal()?.textContent ?? '';
    expect(text).toContain('Ana Pérez');
    expect(text).toContain('ana@test.com');
    expect(text).toContain('320');
    expect(text).toContain('1.250');
    expect(text).toContain('930');
    expect(text).toContain('PLATA');
  });

  it('closes the detail with the close button', async () => {
    await render(() => of(clients));
    openDetailOf('Ana Pérez');

    const close = page().querySelector('button[aria-label="Cerrar detalle del cliente"]') as HTMLButtonElement;
    close.click();
    fixture.detectChanges();

    expect(modal()).toBeNull();
  });

  it('closes the detail with the Escape key', async () => {
    await render(() => of(clients));
    openDetailOf('Ana Pérez');

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    fixture.detectChanges();

    expect(modal()).toBeNull();
  });

  it('filters the table while typing in the search box', async () => {
    await render(() => of(clients));

    const input = page().querySelector('input[type="search"]') as HTMLInputElement;
    input.value = 'bruno';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(page().querySelectorAll('tbody tr').length).toBe(1);
    expect(page().textContent).toContain('Bruno Díaz');
    expect(page().textContent).not.toContain('Ana Pérez');
  });

  it('shows the error with a retry button when the clients cannot be loaded', async () => {
    await render(() => throwError(() => new Error('Network error')));

    const alert = page().querySelector('[role="alert"]');
    expect(alert?.textContent).toContain('No se pudo cargar la lista de clientes');
    expect(alert?.textContent).toContain('Reintentar');
    expect(page().querySelector('app-client-table')).toBeNull();
  });
});
