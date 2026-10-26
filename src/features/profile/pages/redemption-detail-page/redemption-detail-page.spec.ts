import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { Observable, of, Subject, throwError } from 'rxjs';
import { toQrSymbol } from '../../../../shared/components/qr-code/qr-code';
import { ProfileRepository } from '../../services/profile.repository';
import { ProfileStore } from '../../services/profile.store';
import { ActiveRedemption, ProfileDashboard } from '../../types/profile.model';
import { buildProfileDashboardFixture } from '../../utils/profile.fixture';
import { toProfileDashboard } from '../../utils/profile.mapper';
import { RedemptionDetailPage } from './redemption-detail-page';

const DAY_MS = 24 * 60 * 60 * 1000;

const redemption: ActiveRedemption = {
  id: 'redemption-001',
  title: 'Descuento 15% bienvenida',
  description: 'Válido en cualquier sucursal adherida',
  code: 'VLD-8492-C0FF',
  expiresAt: new Date(Date.now() + 5 * DAY_MS),
  expiresAtHasTime: true,
  cafeName: null,
  conditions: ['Un solo uso por cliente.', 'No acumulable con otras promociones.'],
};

function dashboardWith(activeRedemptions: readonly ActiveRedemption[]): ProfileDashboard {
  return { ...toProfileDashboard(buildProfileDashboardFixture(new Date())), activeRedemptions };
}

describe('RedemptionDetailPage', () => {
  let fixture: ComponentFixture<RedemptionDetailPage>;
  let element: HTMLElement;

  async function render(getDashboard: () => Observable<ProfileDashboard>, id = redemption.id) {
    await TestBed.configureTestingModule({
      imports: [RedemptionDetailPage],
      providers: [
        provideRouter([]),
        ProfileStore,
        { provide: ProfileRepository, useValue: { getDashboard } },
        { provide: ActivatedRoute, useValue: { paramMap: of(convertToParamMap({ id })) } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RedemptionDetailPage);
    TestBed.flushEffects();
    fixture.detectChanges();
    element = fixture.nativeElement;
  }

  it('CA: renders a readable QR with the alphanumeric code below, conditions and expiry date', async () => {
    await render(() => of(dashboardWith([redemption])));

    const qr = element.querySelector('app-qr-code svg');
    expect(qr).not.toBeNull();
    expect(qr?.querySelector('path')?.getAttribute('d')).toBe(toQrSymbol(redemption.code).path);
    expect(qr?.getAttribute('aria-label')).toContain(redemption.code);

    const code = element.querySelector('[data-testid="redemption-code"]');
    expect(code?.textContent?.trim()).toBe(redemption.code);
    // The text code comes after the QR in document order, so it is rendered below it.
    expect(qr!.compareDocumentPosition(code!) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();

    expect(element.textContent).toContain('Descuento 15% bienvenida');
    expect(element.textContent).toContain('Un solo uso por cliente.');
    expect(element.textContent).toContain('No acumulable con otras promociones.');

    const expiry = element.querySelector('time');
    expect(expiry?.getAttribute('datetime')).toBe(redemption.expiresAt!.toISOString());
    expect(element.textContent).toContain('Expira en 5 días');
  });

  it('shows the time of an expiry that has one', async () => {
    const expiresAt = new Date(2030, 5, 15, 18, 45);
    await render(() => of(dashboardWith([{ ...redemption, expiresAt, expiresAtHasTime: true }])));

    expect(element.querySelector('time')?.textContent).toContain('18:45');
  });

  it('shows only the date when the expiry came without a time', async () => {
    const expiresAt = new Date(2030, 5, 15, 23, 59, 59);
    await render(() => of(dashboardWith([{ ...redemption, expiresAt, expiresAtHasTime: false }])));

    const expiry = element.querySelector('time');
    expect(expiry?.textContent).toContain('15');
    expect(expiry?.textContent).not.toMatch(/\d{1,2}:\d{2}/);
    expect(expiry?.getAttribute('datetime')).toBe('2030-06-15');
  });

  it('shows the cafe the coupon is valid in', async () => {
    await render(() => of(dashboardWith([{ ...redemption, cafeName: 'Cafe Norte' }])));

    expect(element.querySelector('[data-testid="redemption-cafe"]')?.textContent).toContain(
      'Válido en Cafe Norte',
    );
  });

  it('says a global coupon is valid in every cafe', async () => {
    await render(() => of(dashboardWith([redemption])));

    expect(element.querySelector('[data-testid="redemption-cafe"]')?.textContent).toContain(
      'Válido en todas las cafeterías',
    );
  });

  it('omits the expiry section when the coupon never expires', async () => {
    await render(() => of(dashboardWith([{ ...redemption, expiresAt: null }])));

    expect(element.querySelector('time')).toBeNull();
    expect(element.textContent).not.toContain('Vencimiento');
    expect(element.textContent).not.toContain('Expira');
    expect(element.querySelector('[data-testid="redemption-code"]')?.textContent?.trim()).toBe(
      redemption.code,
    );
  });

  it('shows a fallback when the benefit has no conditions', async () => {
    await render(() => of(dashboardWith([{ ...redemption, conditions: [] }])));

    expect(element.textContent).toContain('Este beneficio no tiene condiciones adicionales.');
  });

  it('shows a not found message when the redemption is not active', async () => {
    await render(() => of(dashboardWith([redemption])), 'unknown');

    expect(element.querySelector('app-qr-code')).toBeNull();
    expect(element.querySelector('[role="alert"]')?.textContent).toContain(
      'No encontramos este canje',
    );
  });

  it('shows a loading state while the redemption is loading', async () => {
    await render(() => new Subject<ProfileDashboard>());

    expect(element.querySelector('[aria-busy="true"]')).not.toBeNull();
    expect(element.querySelector('app-qr-code')).toBeNull();
  });

  it('shows an error and retries when "Reintentar" is clicked', async () => {
    let calls = 0;
    await render(() =>
      ++calls === 1 ? throwError(() => new Error('500')) : of(dashboardWith([redemption])),
    );

    expect(element.querySelector('[role="alert"]')?.textContent).toContain(
      'No pudimos cargar tu canje',
    );

    const retry = Array.from(element.querySelectorAll('button')).find((button) =>
      button.textContent?.includes('Reintentar'),
    );
    retry!.click();
    TestBed.flushEffects();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(calls).toBe(2);
    expect(element.querySelector('app-qr-code svg')).not.toBeNull();
  });
});
