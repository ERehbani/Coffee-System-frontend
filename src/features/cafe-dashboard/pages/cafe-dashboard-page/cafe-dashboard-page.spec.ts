import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { HttpCafeProfileRepository } from '../../../cafe-profile/services/http-cafe-profile.repository';
import { CAFE_PROFILE_FIXTURE } from '../../../cafe-profile/utils/cafe-profile.fixture';
import { PurchaseService } from '../../../purchase-history/services/purchase.service';
import { toCafeProfile } from '../../../cafe-profile/utils/cafe-profile.mapper';
import { CafeDashboardService } from '../../services/cafe-dashboard.service';
import { CafeDashboard } from '../../types/cafe-dashboard.model';
import { CafeDashboardPage } from './cafe-dashboard-page';

const DASHBOARD: CafeDashboard = {
  activeProducts: 8,
  soldOutProducts: 1,
  activeBenefits: 3,
  redemptionsToday: 4,
  purchasesToday: 12,
  salesToday: 45600,
  pointsAwardedToday: 350,
};

describe('CafeDashboardPage', () => {
  let fixture: ComponentFixture<CafeDashboardPage>;
  let getMine: ReturnType<typeof vi.fn>;

  async function render(): Promise<void> {
    await TestBed.configureTestingModule({
      imports: [CafeDashboardPage],
      providers: [
        provideRouter([]),
        { provide: CafeDashboardService, useValue: { getMine } },
        { provide: HttpCafeProfileRepository, useValue: { getProfile: () => of(toCafeProfile(CAFE_PROFILE_FIXTURE)) } },
        { provide: PurchaseService, useValue: { getOpenOrders: () => of([]), updateStatus: vi.fn() } },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(CafeDashboardPage);
    fixture.detectChanges();
  }

  beforeEach(() => {
    getMine = vi.fn(() => of(DASHBOARD));
  });

  it('shows the cafe, whether it is open and the summary of today', async () => {
    await render();
    const text = fixture.nativeElement.textContent.replace(/\s+/g, ' ');

    expect(text).toContain('Café Central');
    expect(text).toContain('Abierto ahora');
    expect(text).toMatch(/8\s*Productos a la venta/);
    expect(text).toMatch(/1\s*Agotados hoy/);
    expect(text).toMatch(/3\s*Beneficios activos/);
    expect(text).toMatch(/4\s*Cupones validados hoy/);
    expect(text).toMatch(/12\s*Compras de hoy/);
    expect(text).toContain('Ventas de hoy');
  });

  it('shows the orders the cafe has to handle', async () => {
    await render();

    expect(fixture.nativeElement.textContent).toContain('Pedidos en curso');
  });

  it('links each card to the section it summarizes', async () => {
    await render();
    const hrefs = Array.from(fixture.nativeElement.querySelectorAll('section a')).map((a) =>
      (a as HTMLAnchorElement).getAttribute('href'),
    );

    expect(hrefs).toEqual([
      '/cafe/purchases',
      '/cafe/validate',
      '/cafe/products',
      '/cafe/products',
      '/cafe/benefits',
    ]);
  });

  it('offers to retry when the dashboard cannot be loaded', async () => {
    getMine = vi.fn(() => throwError(() => new Error('offline')));
    await render();

    expect(fixture.nativeElement.textContent).toContain('No pudimos cargar el panel.');
  });
});
