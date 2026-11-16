import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ActiveRedemptionView } from '../../services/profile.store';
import { CouponItem } from './coupon-item';

const coupon: ActiveRedemptionView = {
  id: 'redemption-1',
  title: '2x1 en medialunas',
  description: 'Dos medialunas por el precio de una',
  code: 'VLD-2201-B4KE',
  expiresAt: new Date(2026, 11, 31, 23, 59, 59),
  expiresAtHasTime: false,
  daysUntilExpiry: 66,
  cafeName: 'Cafe Norte',
  conditions: [],
};

describe('CouponItem', () => {
  let fixture: ComponentFixture<CouponItem>;
  let element: HTMLElement;

  function render(overrides: Partial<ActiveRedemptionView> = {}) {
    TestBed.configureTestingModule({ imports: [CouponItem], providers: [provideRouter([])] });
    fixture = TestBed.createComponent(CouponItem);
    fixture.componentRef.setInput('coupon', { ...coupon, ...overrides });
    fixture.detectChanges();
    element = fixture.nativeElement;
  }

  it('shows the benefit name, the code with its expiry date and the ready state', () => {
    render();

    expect(element.querySelector('h3')?.textContent).toContain('2x1 en medialunas');
    expect(element.textContent).toContain('VLD-2201-B4KE');
    expect(element.textContent).toContain('Vence el 31/12/2026');
    expect(element.textContent).toContain('Listo');
  });

  it('omits the expiry part when the coupon never expires', () => {
    render({ expiresAt: null, daysUntilExpiry: null });

    expect(element.textContent).toContain('VLD-2201-B4KE');
    expect(element.textContent).not.toContain('Vence');
    expect(element.textContent).not.toContain('null');
  });

  it('names the cafe the coupon is valid in', () => {
    render();

    expect(element.textContent).toContain('Válido en Cafe Norte');
  });

  it('says a global coupon is valid in every cafe', () => {
    render({ cafeName: null });

    expect(element.textContent).toContain('Válido en todas las cafeterías');
  });

  it('links "Ver código" to the redemption detail with an accessible name', () => {
    render();

    const link = element.querySelector('a');
    expect(link?.getAttribute('href')).toBe('/profile/redemptions/redemption-1');
    expect(link?.textContent).toContain('Ver código');
    expect(link?.getAttribute('aria-label')).toBe('Ver código de 2x1 en medialunas');
  });
});
