import { registerLocaleData } from '@angular/common';
import localeEsAr from '@angular/common/locales/es-AR';
import { LOCALE_ID } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ApplicableCoupon, CouponsStatus } from '../../types/coupon.model';
import { findApplicableCoupons } from '../../utils/coupon-eligibility';
import { CHECKOUT_COUPON_DTOS_FIXTURE } from '../../utils/coupon.fixture';
import { toCheckoutCoupons } from '../../utils/coupon.mapper';
import { CouponSelector } from './coupon-selector';

registerLocaleData(localeEsAr);

const COUPONS: readonly ApplicableCoupon[] = findApplicableCoupons(
  toCheckoutCoupons(CHECKOUT_COUPON_DTOS_FIXTURE),
  'cafe-central-001',
  new Date(2026, 10, 13),
);

interface RenderOptions {
  readonly coupons?: readonly ApplicableCoupon[];
  readonly status?: CouponsStatus;
  readonly selectedId?: string | null;
  readonly disabled?: boolean;
}

describe('CouponSelector', () => {
  let fixture: ComponentFixture<CouponSelector>;
  let element: HTMLElement;
  let emitted: (string | null)[];

  async function render(options: RenderOptions = {}): Promise<void> {
    await TestBed.configureTestingModule({
      imports: [CouponSelector],
      providers: [{ provide: LOCALE_ID, useValue: 'es-AR' }],
    }).compileComponents();

    fixture = TestBed.createComponent(CouponSelector);
    fixture.componentRef.setInput('coupons', options.coupons ?? COUPONS);
    fixture.componentRef.setInput('status', options.status ?? 'ready');
    fixture.componentRef.setInput('selectedId', options.selectedId ?? null);
    fixture.componentRef.setInput('disabled', options.disabled ?? false);
    emitted = [];
    fixture.componentInstance.couponSelected.subscribe((id) => emitted.push(id));
    fixture.detectChanges();
    element = fixture.nativeElement;
  }

  const optionButtons = () =>
    Array.from(element.querySelectorAll<HTMLButtonElement>('[data-testid="coupon-option"]'));

  const optionTexts = () =>
    optionButtons().map((button) => button.textContent?.replace(/\s+/g, ' ').trim());

  const clearButton = () =>
    element.querySelector<HTMLButtonElement>('[data-testid="coupon-clear"]');

  it('lists every coupon with its name and reward', async () => {
    await render();

    const rows = optionTexts();
    expect(rows.length).toBe(4);
    expect(rows[0]).toContain('15% de descuento');
    expect(rows[1]).toContain('2x1 en Espresso Doble');
    expect(rows[2]).toContain('Cookie Red Velvet gratis');
    expect(rows[3]).toContain('Croissant de Almendras gratis');
  });

  it('shows the expiration date or that it never expires', async () => {
    await render();

    expect(optionTexts()[0]).toContain('Vence el 31/12/2099');
    expect(optionTexts()[1]).toContain('Sin vencimiento');
  });

  it('shows where the coupon is valid', async () => {
    await render();

    expect(optionTexts()[0]).toContain('Válido en Cafe Central');
    expect(optionTexts()[3]).toContain('Válido en todas las cafeterías');
  });

  it('marks only the chosen coupon as pressed', async () => {
    await render({ selectedId: 'coupon-two-for-one' });

    expect(optionButtons().map((button) => button.getAttribute('aria-pressed'))).toEqual([
      'false',
      'true',
      'false',
      'false',
    ]);
  });

  it('uses real buttons so the keyboard can reach them', async () => {
    await render();

    expect(optionButtons().every((button) => button.type === 'button' && !button.disabled)).toBe(
      true,
    );
  });

  it('emits the id of the coupon that was clicked', async () => {
    await render();

    optionButtons()[1].click();

    expect(emitted).toEqual(['coupon-two-for-one']);
  });

  it('emits null when the chosen coupon is clicked again', async () => {
    await render({ selectedId: 'coupon-discount' });

    optionButtons()[0].click();

    expect(emitted).toEqual([null]);
  });

  it('offers to remove the coupon only when one is chosen', async () => {
    await render();
    expect(clearButton()).toBeNull();

    fixture.componentRef.setInput('selectedId', 'coupon-discount');
    fixture.detectChanges();

    clearButton()!.click();
    expect(emitted).toEqual([null]);
  });

  it('disables every control while disabled', async () => {
    await render({ selectedId: 'coupon-discount', disabled: true });

    expect(optionButtons().every((button) => button.disabled)).toBe(true);
    expect(clearButton()?.disabled).toBe(true);
  });

  it('shows a loading state without options while loading', async () => {
    await render({ status: 'loading', coupons: [] });

    expect(element.querySelector('[data-testid="coupons-loading"]')?.getAttribute('role')).toBe(
      'status',
    );
    expect(optionButtons().length).toBe(0);
  });

  it('shows a discreet error that says paying without coupon is possible', async () => {
    await render({ status: 'failed', coupons: [] });

    expect(element.querySelector('[data-testid="coupons-error"]')?.textContent).toContain(
      'Podés confirmar tu pago igual, sin cupón',
    );
    expect(optionButtons().length).toBe(0);
  });

  it('shows an empty state when there are no coupons for this purchase', async () => {
    await render({ coupons: [] });

    expect(element.querySelector('[data-testid="coupons-empty"]')?.textContent).toContain(
      'No tenés cupones disponibles para esta compra',
    );
  });
});
