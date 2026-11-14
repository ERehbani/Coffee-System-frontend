import { registerLocaleData } from '@angular/common';
import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import localeEsAr from '@angular/common/locales/es-AR';
import { LOCALE_ID } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { Observable, of, Subject, throwError } from 'rxjs';
import type { Mock } from 'vitest';
import { CartService } from '../../../cart/services/cart.service';
import { CheckoutRepository } from '../../services/checkout.repository';
import { CheckoutStore } from '../../services/checkout.store';
import { ConfirmedOrder, CreatePurchaseInput } from '../../types/checkout.model';
import { CheckoutCoupon } from '../../types/coupon.model';
import {
  buildPurchaseResponse,
  CHECKOUT_CAFE_FIXTURE,
  CHECKOUT_ITEMS_FIXTURE,
  CHECKOUT_SERVER_CART_FIXTURE,
} from '../../utils/checkout.fixture';
import { toConfirmedOrder } from '../../utils/checkout.mapper';
import { CHECKOUT_COUPON_DTOS_FIXTURE, DISCOUNT_COUPON_DTO } from '../../utils/coupon.fixture';
import { toCheckoutCoupons } from '../../utils/coupon.mapper';
import { CHECKOUT_SUCCESS_PATH } from '../../utils/checkout-paths';
import { CheckoutPage } from './checkout-page';

registerLocaleData(localeEsAr);

const order: ConfirmedOrder = toConfirmedOrder(
  buildPurchaseResponse('purchase-1', CHECKOUT_CAFE_FIXTURE, CHECKOUT_ITEMS_FIXTURE, new Date()),
);

describe('CheckoutPage', () => {
  let fixture: ComponentFixture<CheckoutPage>;
  let element: HTMLElement;
  let cart: CartService;
  let navigateByUrl: Mock;
  let createPurchase: Mock<(input: CreatePurchaseInput) => Observable<ConfirmedOrder>>;
  let findCoupons: Mock<() => Observable<readonly CheckoutCoupon[]>>;

  async function render(withProducts = true) {
    await TestBed.configureTestingModule({
      imports: [CheckoutPage],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        CheckoutStore,
        { provide: LOCALE_ID, useValue: 'es-AR' },
        {
          provide: CheckoutRepository,
          useValue: {
            findCart: () => of(CHECKOUT_SERVER_CART_FIXTURE),
            findCoupons,
            createPurchase,
          },
        },
      ],
    }).compileComponents();

    cart = TestBed.inject(CartService);
    if (withProducts) {
      cart.items.set([...CHECKOUT_ITEMS_FIXTURE]);
      cart.cafe.set(CHECKOUT_CAFE_FIXTURE);
    }
    navigateByUrl = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);

    fixture = TestBed.createComponent(CheckoutPage);
    fixture.detectChanges();
    element = fixture.nativeElement;
  }

  const confirmButton = () =>
    Array.from(element.querySelectorAll('button')).find((button) =>
      button.textContent?.includes('Confirmar pago') ||
      button.textContent?.includes('Confirmando pago'),
    );

  function clickConfirm() {
    confirmButton()!.click();
    fixture.detectChanges();
  }

  const couponOptions = () =>
    Array.from(element.querySelectorAll<HTMLButtonElement>('[data-testid="coupon-option"]'));

  function chooseCoupon(name: string) {
    couponOptions()
      .find((option) => option.textContent?.includes(name))!
      .click();
    fixture.detectChanges();
  }

  beforeEach(() => {
    createPurchase = vi.fn(() => of(order));
    findCoupons = vi.fn(() => of(toCheckoutCoupons(CHECKOUT_COUPON_DTOS_FIXTURE)));
  });

  afterEach(() => localStorage.clear());

  it('shows the summary of the order with the cafe and the total', async () => {
    await render();

    expect(element.querySelector('h1')?.textContent).toContain('Confirmar pago');
    expect(element.querySelector('app-checkout-summary')?.textContent).toContain('Cafe Central');
    expect(element.querySelector('[data-testid="checkout-total"]')?.textContent).toContain('9.200');
    expect(confirmButton()?.disabled).toBe(false);
  });

  it('shows an empty state with a link to the catalog when the cart is empty', async () => {
    await render(false);

    expect(element.textContent).toContain('Tu carrito está vacío');
    expect(element.querySelector('app-checkout-summary')).toBeNull();
    expect(confirmButton()).toBeUndefined();
    const catalogLink = Array.from(element.querySelectorAll('a')).find((link) =>
      link.textContent?.includes('Ir al catálogo'),
    );
    expect(catalogLink?.getAttribute('href')).toBe('/catalog');
  });

  it('links back to the catalog of the cafe of the cart', async () => {
    await render();

    const backLink = Array.from(element.querySelectorAll('a')).find((link) =>
      link.textContent?.includes('Volver al catálogo'),
    );
    expect(backLink?.getAttribute('href')).toBe('/catalog?cafe=cafe-central-001');
  });

  it('disables the button and shows the loading text while confirming', async () => {
    createPurchase.mockReturnValue(new Subject<ConfirmedOrder>());
    await render();

    clickConfirm();

    expect(confirmButton()?.textContent).toContain('Confirmando pago...');
    expect(confirmButton()?.disabled).toBe(true);
    expect(confirmButton()?.getAttribute('aria-busy')).toBe('true');
  });

  it('sends a single purchase even after several clicks', async () => {
    createPurchase.mockReturnValue(new Subject<ConfirmedOrder>());
    await render();

    clickConfirm();
    clickConfirm();
    fixture.componentInstance.confirm();

    expect(createPurchase).toHaveBeenCalledOnce();
  });

  it('redirects, empties the cart and keeps the order after paying', async () => {
    await render();

    clickConfirm();

    expect(navigateByUrl).toHaveBeenCalledWith(CHECKOUT_SUCCESS_PATH);
    expect(cart.items()).toEqual([]);
    expect(TestBed.inject(CheckoutStore).confirmedOrder()).toEqual(order);
    expect(element.querySelector('[role="status"]')?.textContent).toContain(
      'Tu pago fue confirmado',
    );
  });

  it('shows the error in Spanish and keeps the cart when the purchase fails', async () => {
    createPurchase.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 500 })));
    await render();

    clickConfirm();

    expect(element.querySelector('[role="alert"]')?.textContent).toContain(
      'No pudimos confirmar tu pago',
    );
    expect(navigateByUrl).not.toHaveBeenCalled();
    expect(cart.items().length).toBe(2);
    expect(element.querySelector('app-checkout-summary')).not.toBeNull();
    expect(confirmButton()?.disabled).toBe(false);
  });

  it('starts a fresh checkout when the page opens again', async () => {
    await render();
    const store = TestBed.inject(CheckoutStore);
    clickConfirm();
    expect(store.status()).toBe('confirmed');

    cart.items.set([...CHECKOUT_ITEMS_FIXTURE]);
    cart.cafe.set(CHECKOUT_CAFE_FIXTURE);
    const reopened = TestBed.createComponent(CheckoutPage);
    reopened.detectChanges();

    expect(store.status()).toBe('idle');
    expect(store.canConfirm()).toBe(true);
  });

  describe('coupons', () => {
    it('lists the coupons that can be used in the cafe of the cart', async () => {
      await render();

      expect(couponOptions().length).toBe(4);
      expect(couponOptions()[0].textContent).toContain('15% de descuento');
      expect(couponOptions().every((option) => option.getAttribute('aria-pressed') === 'false')).toBe(
        true,
      );
    });

    it('shows a loading state while the coupons arrive and lets the order be confirmed', async () => {
      findCoupons.mockReturnValue(new Subject<readonly CheckoutCoupon[]>());
      await render();

      expect(element.querySelector('[data-testid="coupons-loading"]')).not.toBeNull();
      expect(confirmButton()?.disabled).toBe(false);
    });

    it('shows a discreet message when the coupons fail to load and keeps paying possible', async () => {
      findCoupons.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 500 })));
      await render();

      expect(element.querySelector('[data-testid="coupons-error"]')?.textContent).toContain(
        'sin cupón',
      );
      expect(confirmButton()?.disabled).toBe(false);
    });

    it('shows a message when there are no coupons to apply', async () => {
      findCoupons.mockReturnValue(of(toCheckoutCoupons([])));
      await render();

      expect(element.querySelector('[data-testid="coupons-empty"]')?.textContent).toContain(
        'No tenés cupones disponibles',
      );
      expect(confirmButton()?.disabled).toBe(false);
    });

    it('shows the discount and the final total when a coupon is chosen', async () => {
      await render();

      chooseCoupon('15% de descuento');

      expect(element.querySelector('[data-testid="checkout-subtotal"]')?.textContent).toContain(
        '9.200',
      );
      expect(element.querySelector('[data-testid="checkout-discount"]')?.textContent).toContain(
        '1.380',
      );
      expect(element.querySelector('[data-testid="checkout-total"]')?.textContent).toContain('7.820');
      expect(couponOptions()[0].getAttribute('aria-pressed')).toBe('true');
    });

    it('shows the gift product instead of a discount for a free product coupon', async () => {
      await render();

      chooseCoupon('Croissant gratis para socios');

      expect(element.querySelector('[data-testid="checkout-gift"]')?.textContent).toContain(
        'Croissant de Almendras',
      );
      expect(element.querySelector('[data-testid="checkout-discount"]')).toBeNull();
      expect(element.querySelector('[data-testid="checkout-total"]')?.textContent).toContain('9.200');
    });

    it('goes back to the plain total when the coupon is removed', async () => {
      await render();
      chooseCoupon('15% de descuento');

      element.querySelector<HTMLButtonElement>('[data-testid="coupon-clear"]')!.click();
      fixture.detectChanges();

      expect(element.querySelector('[data-testid="checkout-subtotal"]')).toBeNull();
      expect(element.querySelector('[data-testid="checkout-total"]')?.textContent).toContain('9.200');
    });

    it('sends the validation code of the chosen coupon when paying', async () => {
      await render();
      chooseCoupon('15% de descuento');

      clickConfirm();

      expect(createPurchase).toHaveBeenCalledWith({
        cartId: 'cart-1',
        validationCode: DISCOUNT_COUPON_DTO.validationCode,
      });
    });

    it('pays without code when no coupon is chosen', async () => {
      await render();

      clickConfirm();

      expect(createPurchase).toHaveBeenCalledWith({ cartId: 'cart-1', validationCode: undefined });
    });

    it('explains a rejected coupon and lets the client remove it and pay again', async () => {
      createPurchase.mockReturnValueOnce(
        throwError(() => new HttpErrorResponse({ status: 404, error: 'Invalid code' })),
      );
      await render();
      chooseCoupon('15% de descuento');

      clickConfirm();

      expect(element.querySelector('[role="alert"]')?.textContent).toContain(
        'No encontramos ese cupón',
      );
      expect(navigateByUrl).not.toHaveBeenCalled();
      expect(couponOptions()[0].getAttribute('aria-pressed')).toBe('true');

      element.querySelector<HTMLButtonElement>('[data-testid="coupon-clear"]')!.click();
      fixture.detectChanges();
      expect(element.querySelector('[role="alert"]')).toBeNull();

      clickConfirm();

      expect(createPurchase).toHaveBeenLastCalledWith({ cartId: 'cart-1', validationCode: undefined });
      expect(navigateByUrl).toHaveBeenCalledWith(CHECKOUT_SUCCESS_PATH);
    });

    it('blocks the coupon controls while the payment is in flight', async () => {
      createPurchase.mockReturnValue(new Subject<ConfirmedOrder>());
      await render();
      chooseCoupon('15% de descuento');

      clickConfirm();

      expect(couponOptions().every((option) => option.disabled)).toBe(true);
    });
  });
});
