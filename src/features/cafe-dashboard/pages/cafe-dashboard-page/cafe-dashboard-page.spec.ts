import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { HttpCafeProfileRepository } from '../../../cafe-profile/services/http-cafe-profile.repository';
import { CAFE_PROFILE_FIXTURE } from '../../../cafe-profile/utils/cafe-profile.fixture';
import { PurchaseService } from '../../../purchase-history/services/purchase.service';
import { toCafeProfile } from '../../../cafe-profile/utils/cafe-profile.mapper';
import { CafeDashboardPage } from './cafe-dashboard-page';

describe('CafeDashboardPage', () => {
  let fixture: ComponentFixture<CafeDashboardPage>;
  let getProfile: ReturnType<typeof vi.fn>;

  async function render(): Promise<void> {
    await TestBed.configureTestingModule({
      imports: [CafeDashboardPage],
      providers: [
        provideRouter([]),
        { provide: HttpCafeProfileRepository, useValue: { getProfile } },
        { provide: PurchaseService, useValue: { getOpenOrders: () => of([]), updateStatus: vi.fn() } },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(CafeDashboardPage);
    fixture.detectChanges();
  }

  beforeEach(() => {
    getProfile = vi.fn(() => of(toCafeProfile(CAFE_PROFILE_FIXTURE)));
  });

  it('shows the cafe and whether it is open, without the summary of today', async () => {
    await render();
    const text = fixture.nativeElement.textContent.replace(/\s+/g, ' ');

    expect(text).toContain('Café Central');
    expect(text).toContain('Abierto ahora');
    expect(text).not.toContain('Resumen de hoy');
  });

  it('shows the orders the cafe has to handle', async () => {
    await render();

    expect(fixture.nativeElement.textContent).toContain('Pedidos en curso');
  });

  it('offers to retry when the dashboard cannot be loaded', async () => {
    getProfile = vi.fn(() => throwError(() => new Error('offline')));
    await render();

    expect(fixture.nativeElement.textContent).toContain('No pudimos cargar el panel.');
  });
});
