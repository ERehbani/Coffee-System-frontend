import { registerLocaleData } from '@angular/common';
import localeEsAr from '@angular/common/locales/es-AR';
import { LOCALE_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { CouponPreview } from '../../types/coupon.model';
import { CHECKOUT_CAFE_FIXTURE, CHECKOUT_ITEMS_FIXTURE } from '../../utils/checkout.fixture';
import { toCheckoutSummary } from '../../utils/checkout.mapper';
import { CheckoutSummaryCard } from './checkout-summary';

registerLocaleData(localeEsAr);

const DISCOUNT_PREVIEW: CouponPreview = {
  couponName: '15% de descuento',
  subtotal: 9200,
  discount: 1380,
  gift: null,
  total: 7820,
};

const GIFT_PREVIEW: CouponPreview = {
  couponName: 'Cookie por puntos',
  subtotal: 9200,
  discount: 0,
  gift: { id: 'prod-central-005', name: 'Cookie Red Velvet', price: 2500 },
  total: 9200,
};

describe('CheckoutSummaryCard', () => {
  async function render(preview: CouponPreview | null = null): Promise<HTMLElement> {
    await TestBed.configureTestingModule({
      imports: [CheckoutSummaryCard],
      providers: [{ provide: LOCALE_ID, useValue: 'es-AR' }],
    }).compileComponents();

    const fixture = TestBed.createComponent(CheckoutSummaryCard);
    fixture.componentRef.setInput(
      'summary',
      toCheckoutSummary(CHECKOUT_CAFE_FIXTURE, CHECKOUT_ITEMS_FIXTURE),
    );
    fixture.componentRef.setInput('preview', preview);
    fixture.detectChanges();
    return fixture.nativeElement;
  }

  const text = (element: HTMLElement, testId: string) =>
    element.querySelector(`[data-testid="${testId}"]`)?.textContent?.replace(/\s+/g, ' ').trim();

  it('shows the cafe of the order', async () => {
    const element = await render();

    expect(element.querySelector('[data-testid="checkout-cafe"]')?.textContent).toBe(
      'Cafe Central',
    );
  });

  it('lists every product with its quantity and subtotal', async () => {
    const element = await render();

    const rows = Array.from(element.querySelectorAll('li')).map((row) =>
      row.textContent?.replace(/\s+/g, ' ').trim(),
    );
    expect(rows.length).toBe(2);
    expect(rows[0]).toContain('Espresso Doble');
    expect(rows[0]).toContain('2 ×');
    expect(rows[0]).toContain('5.600');
    expect(rows[1]).toContain('Flat White');
    expect(rows[1]).toContain('1 ×');
    expect(rows[1]).toContain('3.600');
  });

  it('shows the total', async () => {
    const element = await render();

    expect(element.querySelector('[data-testid="checkout-total"]')?.textContent).toContain('9.200');
  });

  it('shows only the total when there is no coupon', async () => {
    const element = await render();

    expect(element.querySelector('[data-testid="checkout-subtotal"]')).toBeNull();
    expect(element.querySelector('[data-testid="checkout-discount"]')).toBeNull();
    expect(element.querySelector('[data-testid="checkout-gift"]')).toBeNull();
  });

  it('shows the subtotal, the discount and the final total with a discount coupon', async () => {
    const element = await render(DISCOUNT_PREVIEW);

    expect(text(element, 'checkout-subtotal')).toContain('9.200');
    expect(text(element, 'checkout-discount')).toContain('1.380');
    expect(text(element, 'checkout-total')).toContain('7.820');
    expect(element.textContent).toContain('15% de descuento');
  });

  it('shows the cents of a discount that is not a whole number', async () => {
    const element = await render({ ...DISCOUNT_PREVIEW, discount: 110.99, total: 9089.01 });

    expect(text(element, 'checkout-discount')).toContain('110,99');
    expect(text(element, 'checkout-total')).toContain('9.089,01');
  });

  it('shows the gift product and keeps the total with a free product coupon', async () => {
    const element = await render(GIFT_PREVIEW);

    expect(text(element, 'checkout-gift')).toContain('1 × Cookie Red Velvet de regalo');
    expect(element.textContent).toContain('Gratis');
    expect(element.querySelector('[data-testid="checkout-discount"]')).toBeNull();
    expect(text(element, 'checkout-total')).toContain('9.200');
  });

  it('warns when the coupon has no effect on the order', async () => {
    const element = await render({ ...DISCOUNT_PREVIEW, discount: 0, total: 9200 });

    expect(text(element, 'checkout-no-effect')).toContain('no tiene efecto');
  });

  it('does not warn when the coupon has an effect', async () => {
    const element = await render(DISCOUNT_PREVIEW);

    expect(element.querySelector('[data-testid="checkout-no-effect"]')).toBeNull();
  });
});
