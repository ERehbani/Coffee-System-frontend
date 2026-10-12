import { TestBed } from '@angular/core/testing';
import { NEVER, Observable, of, throwError } from 'rxjs';
import { ClientDashboardStore } from '../../application/client-dashboard.store';
import { ClientDashboard } from '../../domain/client-dashboard.model';
import { ClientDashboardRepository } from '../../domain/client-dashboard.repository';
import { buildClientDashboardFixture } from '../../infrastructure/client-dashboard.fixture';
import { mapClientDashboardDto } from '../../infrastructure/client-dashboard.mapper';
import { ClientDashboardPage } from './client-dashboard-page';

describe('ClientDashboardPage', () => {
  const dashboard = mapClientDashboardDto(buildClientDashboardFixture(new Date()));
  let getDashboard: ReturnType<typeof vi.fn<() => Observable<ClientDashboard>>>;

  beforeEach(async () => {
    getDashboard = vi.fn<() => Observable<ClientDashboard>>();
    await TestBed.configureTestingModule({
      imports: [ClientDashboardPage],
      providers: [
        ClientDashboardStore,
        { provide: ClientDashboardRepository, useValue: { getDashboard } },
      ],
    }).compileComponents();
  });

  async function render(): Promise<HTMLElement> {
    const fixture = TestBed.createComponent(ClientDashboardPage);
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  const headings = (host: HTMLElement, selector: string) =>
    Array.from(host.querySelectorAll(selector)).map((h) => h.textContent?.trim());

  it('renders the greeting and the three dashboard sections from the repository data', async () => {
    getDashboard.mockReturnValue(of(dashboard));
    const host = await render();

    expect(headings(host, 'h1')).toEqual(['¡Hola, Juan!']);
    expect(headings(host, 'h2')).toEqual([
      'Tus canjes activos y códigos',
      'Cafeterías de la red cercanas',
      'Beneficios destacados',
    ]);
    expect(host.textContent).toContain('1 activo');
    expect(host.querySelectorAll('app-nearby-cafe-card')).toHaveLength(2);
    expect(host.querySelectorAll('app-featured-benefit-card')).toHaveLength(2);
  });

  it('shows an empty state when there are no active redemptions', async () => {
    getDashboard.mockReturnValue(of({ ...dashboard, activeRedemptions: [] }));
    const host = await render();

    expect(host.textContent).toContain('No tienes canjes activos');
    expect(host.textContent).not.toContain('1 activo');
  });

  it('shows a busy skeleton while loading', async () => {
    getDashboard.mockReturnValue(NEVER);
    const fixture = TestBed.createComponent(ClientDashboardPage);
    TestBed.tick();
    const host = fixture.nativeElement as HTMLElement;

    expect(host.querySelector('[aria-busy="true"]')).not.toBeNull();
    expect(host.querySelector('[role="status"]')?.textContent).toContain('Cargando tu panel');
  });

  it('shows an error with a retry that reloads the dashboard', async () => {
    getDashboard
      .mockReturnValueOnce(throwError(() => new Error('Network down')))
      .mockReturnValueOnce(of(dashboard));
    const fixture = TestBed.createComponent(ClientDashboardPage);
    await fixture.whenStable();
    const host = fixture.nativeElement as HTMLElement;

    expect(host.querySelector('[role="alert"] h1')?.textContent).toContain(
      'No pudimos cargar tu panel',
    );
    const retry = Array.from(host.querySelectorAll('button')).find((button) =>
      button.textContent?.includes('Reintentar'),
    );
    retry?.click();
    await fixture.whenStable();

    expect(getDashboard).toHaveBeenCalledTimes(2);
    expect(headings(host, 'h1')).toEqual(['¡Hola, Juan!']);
  });
});
