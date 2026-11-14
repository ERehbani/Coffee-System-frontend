import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Observable, of, Subject, throwError } from 'rxjs';
import type { Mock } from 'vitest';
import { CartService } from '../../cart/services/cart.service';
import { ConfirmedOrder, CreatePurchaseInput, ServerCart } from '../types/checkout.model';
import { CheckoutCoupon } from '../types/coupon.model';
import {
  buildPurchaseResponse,
  CHECKOUT_CAFE_FIXTURE,
  CHECKOUT_ITEMS_FIXTURE,
  CHECKOUT_SERVER_CART_FIXTURE,
} from '../utils/checkout.fixture';
import { toConfirmedOrder } from '../utils/checkout.mapper';
import {
  CHECKOUT_COUPON_DTOS_FIXTURE,
  DISCOUNT_COUPON_DTO,
  MEMBER_PRODUCT_COUPON_DTO,
  TWO_FOR_ONE_COUPON_DTO,
} from '../utils/coupon.fixture';
import { toCheckoutCoupons } from '../utils/coupon.mapper';
import { CheckoutRepository } from './checkout.repository';
import { CheckoutStore } from './checkout.store';

const order: ConfirmedOrder = toConfirmedOrder(
  buildPurchaseResponse('purchase-1', CHECKOUT_CAFE_FIXTURE, CHECKOUT_ITEMS_FIXTURE, new Date()),
);

describe('CheckoutStore', () => {
  let store: CheckoutStore;
  let cart: CartService;
  let findCart: Mock<(cafeId: string) => Observable<ServerCart>>;
  let findCoupons: Mock<() => Observable<readonly CheckoutCoupon[]>>;
  let createPurchase: Mock<
    (input: CreatePurchaseInput) => ReturnType<CheckoutRepository['createPurchase']>
  >;

  beforeEach(() => {
    findCart = vi.fn(() => of(CHECKOUT_SERVER_CART_FIXTURE));
    findCoupons = vi.fn(() => of(toCheckoutCoupons(CHECKOUT_COUPON_DTOS_FIXTURE)));
    createPurchase = vi.fn(() => of(order));

    TestBed.configureTestingModule({
      providers: [
        CheckoutStore,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: CheckoutRepository, useValue: { findCart, findCoupons, createPurchase } },
      ],
    });

    cart = TestBed.inject(CartService);
    cart.items.set([...CHECKOUT_ITEMS_FIXTURE]);
    cart.cafe.set(CHECKOUT_CAFE_FIXTURE);
    store = TestBed.inject(CheckoutStore);
  });

  afterEach(() => localStorage.clear());

  it('builds the summary from the local cart', () => {
    expect(store.summary()?.cafeName).toBe('Cafe Central');
    expect(store.summary()?.lines.length).toBe(2);
    expect(store.summary()?.total).toBe(9200);
    expect(store.canConfirm()).toBe(true);
  });

  it('cannot confirm an empty cart', () => {
    cart.clearLocal();
    const onSuccess = vi.fn();

    store.confirm(onSuccess);

    expect(store.summary()).toBeNull();
    expect(store.canConfirm()).toBe(false);
    expect(findCart).not.toHaveBeenCalled();
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it('creates the purchase from the cart of the cafe', () => {
    store.confirm(vi.fn());

    expect(findCart).toHaveBeenCalledWith('cafe-central-001');
    expect(createPurchase).toHaveBeenCalledWith({ cartId: 'cart-1', validationCode: undefined });
  });

  it('passes the validation code on to the purchase', () => {
    store.confirm(vi.fn(), 'VLD-0001-ABCD');

    expect(createPurchase).toHaveBeenCalledWith({
      cartId: 'cart-1',
      validationCode: 'VLD-0001-ABCD',
    });
  });

  it('keeps the order, empties the local cart and calls back after paying', () => {
    const onSuccess = vi.fn();

    store.confirm(onSuccess);

    expect(store.confirmedOrder()).toEqual(order);
    expect(store.status()).toBe('confirmed');
    expect(cart.items()).toEqual([]);
    expect(cart.cafe()).toBeNull();
    expect(onSuccess).toHaveBeenCalledOnce();
  });

  it('shows that it is confirming and ignores a second confirmation meanwhile', () => {
    const purchase = new Subject<ConfirmedOrder>();
    createPurchase.mockReturnValue(purchase);

    store.confirm(vi.fn());
    store.confirm(vi.fn());

    expect(store.isConfirming()).toBe(true);
    expect(store.canConfirm()).toBe(false);
    expect(findCart).toHaveBeenCalledOnce();
    expect(createPurchase).toHaveBeenCalledOnce();

    purchase.next(order);
    purchase.complete();

    expect(store.isConfirming()).toBe(false);
  });

  it('shows the error and keeps the cart when the backend rejects the purchase', () => {
    createPurchase.mockReturnValue(
      throwError(() => new HttpErrorResponse({ status: 400, error: 'Cart cannot be empty' })),
    );
    const onSuccess = vi.fn();

    store.confirm(onSuccess);

    expect(store.errorMessage()).toContain('No encontramos productos en tu carrito');
    expect(store.status()).toBe('idle');
    expect(store.canConfirm()).toBe(true);
    expect(store.confirmedOrder()).toBeNull();
    expect(cart.items().length).toBe(2);
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it('shows the error when the cart cannot be found', () => {
    findCart.mockReturnValue(
      throwError(() => new HttpErrorResponse({ status: 404, error: 'Cart not found' })),
    );

    store.confirm(vi.fn());

    expect(store.errorMessage()).toContain('No encontramos tu carrito');
    expect(createPurchase).not.toHaveBeenCalled();
    expect(cart.items().length).toBe(2);
  });

  describe('when the cart of the backend differs from the local one', () => {
    function confirmAgainst(serverCart: ServerCart): Mock {
      findCart.mockReturnValue(of(serverCart));
      const onSuccess = vi.fn();
      store.confirm(onSuccess);
      return onSuccess;
    }

    it('does not pay when the backend has other quantities', () => {
      const [espresso, flatWhite] = CHECKOUT_SERVER_CART_FIXTURE.lines;

      const onSuccess = confirmAgainst({
        ...CHECKOUT_SERVER_CART_FIXTURE,
        lines: [{ ...espresso, quantity: 5 }, flatWhite],
      });

      expect(createPurchase).not.toHaveBeenCalled();
      expect(onSuccess).not.toHaveBeenCalled();
      expect(store.errorMessage()).toContain('Tu carrito cambió');
    });

    it('does not pay when the backend has another total', () => {
      confirmAgainst({ ...CHECKOUT_SERVER_CART_FIXTURE, total: 9900 });

      expect(createPurchase).not.toHaveBeenCalled();
      expect(store.errorMessage()).toContain('Tu carrito cambió');
    });

    it('keeps the cart and lets the client try again', () => {
      confirmAgainst({ ...CHECKOUT_SERVER_CART_FIXTURE, total: 9900 });

      expect(store.status()).toBe('idle');
      expect(store.canConfirm()).toBe(true);
      expect(cart.items().length).toBe(2);
    });
  });

  it('clears the previous error when confirming again', () => {
    createPurchase.mockReturnValueOnce(throwError(() => new HttpErrorResponse({ status: 500 })));
    store.confirm(vi.fn());
    expect(store.errorMessage()).not.toBeNull();

    store.confirm(vi.fn());

    expect(store.errorMessage()).toBeNull();
    expect(store.status()).toBe('confirmed');
  });

  it('starts a new checkout without losing the last confirmed order', () => {
    store.confirm(vi.fn());

    store.startCheckout();

    expect(store.status()).toBe('idle');
    expect(store.errorMessage()).toBeNull();
    expect(store.confirmedOrder()).toEqual(order);
  });

  describe('coupons', () => {
    const OTHER_CAFE = { externalId: 'cafe-norte-002', name: 'Cafe Norte' };

    function startAndSelect(couponId: string | null): void {
      store.startCheckout();
      store.selectCoupon(couponId);
    }

    it('loads the coupons of the client when the checkout starts', () => {
      store.startCheckout();

      expect(findCoupons).toHaveBeenCalledOnce();
      expect(store.couponsStatus()).toBe('ready');
    });

    it('does not load coupons when there is nothing to pay', () => {
      cart.clearLocal();

      store.startCheckout();

      expect(findCoupons).not.toHaveBeenCalled();
    });

    it('shows that the coupons are loading until they arrive', () => {
      const coupons = new Subject<readonly CheckoutCoupon[]>();
      findCoupons.mockReturnValue(coupons);

      store.startCheckout();

      expect(store.couponsStatus()).toBe('loading');
      expect(store.applicableCoupons()).toEqual([]);

      coupons.next(toCheckoutCoupons([DISCOUNT_COUPON_DTO]));

      expect(store.couponsStatus()).toBe('ready');
      expect(store.applicableCoupons().length).toBe(1);
    });

    it('ignores the answer of a request replaced by a newer one', () => {
      const first = new Subject<readonly CheckoutCoupon[]>();
      findCoupons.mockReturnValueOnce(first);
      findCoupons.mockReturnValueOnce(of(toCheckoutCoupons([DISCOUNT_COUPON_DTO])));
      store.startCheckout();

      store.startCheckout();
      first.next(toCheckoutCoupons([TWO_FOR_ONE_COUPON_DTO]));

      expect(store.applicableCoupons().map((coupon) => coupon.id)).toEqual(['coupon-discount']);
    });

    it('offers only the coupons that can be used in the cafe of the cart', () => {
      store.startCheckout();

      expect(store.applicableCoupons().map((coupon) => coupon.id)).toEqual([
        'coupon-discount',
        'coupon-two-for-one',
        'coupon-points-product',
        'coupon-member-product',
      ]);
    });

    it('keeps paying without coupon possible when the coupons fail to load', () => {
      findCoupons.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 500 })));

      store.startCheckout();

      expect(store.couponsStatus()).toBe('failed');
      expect(store.applicableCoupons()).toEqual([]);
      expect(store.canConfirm()).toBe(true);
    });

    it('has no preview until a coupon is chosen', () => {
      store.startCheckout();

      expect(store.selectedCoupon()).toBeNull();
      expect(store.couponPreview()).toBeNull();
    });

    it('previews the discount and the final total of the chosen coupon', () => {
      startAndSelect('coupon-discount');

      expect(store.selectedCoupon()?.id).toBe('coupon-discount');
      expect(store.couponPreview()).toEqual({
        couponName: '15% de descuento',
        subtotal: 9200,
        discount: 1380,
        gift: null,
        total: 7820,
      });
    });

    it('previews the gift of a free product coupon', () => {
      startAndSelect('coupon-member-product');

      expect(store.couponPreview()?.gift?.name).toBe('Croissant de Almendras');
      expect(store.couponPreview()?.total).toBe(9200);
    });

    it('replaces the coupon when another one is chosen', () => {
      startAndSelect('coupon-discount');

      store.selectCoupon('coupon-two-for-one');

      expect(store.selectedCoupon()?.id).toBe('coupon-two-for-one');
    });

    it('removes the coupon and goes back to the plain total', () => {
      startAndSelect('coupon-discount');

      store.selectCoupon(null);

      expect(store.selectedCoupon()).toBeNull();
      expect(store.couponPreview()).toBeNull();
    });

    it('cannot choose a coupon that is not applicable', () => {
      startAndSelect('coupon-other-cafe');

      expect(store.selectedCoupon()).toBeNull();
    });

    it('drops the chosen coupon when the cart changes and it stops applying', () => {
      startAndSelect('coupon-discount');

      cart.cafe.set(OTHER_CAFE);

      expect(store.selectedCoupon()).toBeNull();
      expect(store.couponPreview()).toBeNull();
    });

    it('keeps a global coupon when the cart changes to another cafe', () => {
      startAndSelect(MEMBER_PRODUCT_COUPON_DTO.externalId);

      cart.cafe.set(OTHER_CAFE);

      expect(store.selectedCoupon()?.id).toBe(MEMBER_PRODUCT_COUPON_DTO.externalId);
    });

    it('updates the preview when the quantities of the cart change', () => {
      startAndSelect('coupon-two-for-one');
      expect(store.couponPreview()?.discount).toBe(2800);

      cart.items.set([{ ...CHECKOUT_ITEMS_FIXTURE[0], quantity: 4 }]);

      expect(store.couponPreview()?.discount).toBe(5600);
    });

    it('clears the previous error when the coupon changes', () => {
      createPurchase.mockReturnValueOnce(
        throwError(() => new HttpErrorResponse({ status: 404, error: 'Invalid code' })),
      );
      startAndSelect('coupon-discount');
      store.confirm(vi.fn());
      expect(store.errorMessage()).toContain('No encontramos ese cupón');

      store.selectCoupon(null);

      expect(store.errorMessage()).toBeNull();
    });

    it('sends the code of the chosen coupon when confirming', () => {
      startAndSelect('coupon-discount');

      store.confirm(vi.fn());

      expect(createPurchase).toHaveBeenCalledWith({
        cartId: 'cart-1',
        validationCode: DISCOUNT_COUPON_DTO.validationCode,
      });
    });

    it('sends no code once the coupon is removed', () => {
      startAndSelect('coupon-discount');
      store.selectCoupon(null);

      store.confirm(vi.fn());

      expect(createPurchase).toHaveBeenCalledWith({ cartId: 'cart-1', validationCode: undefined });
    });

    it('prefers an explicit code over the chosen coupon', () => {
      startAndSelect('coupon-discount');

      store.confirm(vi.fn(), 'OTHER-CODE');

      expect(createPurchase).toHaveBeenCalledWith({
        cartId: 'cart-1',
        validationCode: 'OTHER-CODE',
      });
    });

    it('explains a rejected coupon and keeps it chosen so it can be removed or retried', () => {
      createPurchase.mockReturnValueOnce(
        throwError(
          () =>
            new HttpErrorResponse({
              status: 400,
              error: { error: 'Code already used', status: 400 },
            }),
        ),
      );
      startAndSelect('coupon-discount');

      store.confirm(vi.fn());

      expect(store.errorMessage()).toContain('Ese cupón ya fue usado');
      expect(store.selectedCoupon()?.id).toBe('coupon-discount');
      expect(store.canConfirm()).toBe(true);
      expect(cart.items().length).toBe(2);
    });

    it('forgets the chosen coupon after paying', () => {
      startAndSelect('coupon-discount');

      store.confirm(vi.fn());

      expect(store.selectedCoupon()).toBeNull();
    });

    it('starts every checkout without a chosen coupon', () => {
      startAndSelect('coupon-discount');

      store.startCheckout();

      expect(store.selectedCoupon()).toBeNull();
    });
  });
});
