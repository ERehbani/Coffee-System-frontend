import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { of, Subject, throwError } from 'rxjs';
import type { Mock } from 'vitest';
import { CartService } from '../../cart/services/cart.service';
import { ConfirmedOrder, CreatePurchaseInput } from '../types/checkout.model';
import {
  buildPurchaseResponse,
  CHECKOUT_CAFE_FIXTURE,
  CHECKOUT_ITEMS_FIXTURE,
} from '../utils/checkout.fixture';
import { toConfirmedOrder } from '../utils/checkout.mapper';
import { CheckoutRepository } from './checkout.repository';
import { CheckoutStore } from './checkout.store';

const order: ConfirmedOrder = toConfirmedOrder(
  buildPurchaseResponse('purchase-1', CHECKOUT_CAFE_FIXTURE, CHECKOUT_ITEMS_FIXTURE, new Date()),
);

describe('CheckoutStore', () => {
  let store: CheckoutStore;
  let cart: CartService;
  let findCartId: Mock<(cafeId: string) => ReturnType<CheckoutRepository['findCartId']>>;
  let createPurchase: Mock<
    (input: CreatePurchaseInput) => ReturnType<CheckoutRepository['createPurchase']>
  >;

  beforeEach(() => {
    findCartId = vi.fn(() => of('cart-1'));
    createPurchase = vi.fn(() => of(order));

    TestBed.configureTestingModule({
      providers: [
        CheckoutStore,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: CheckoutRepository, useValue: { findCartId, createPurchase } },
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
    expect(findCartId).not.toHaveBeenCalled();
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it('creates the purchase from the cart of the cafe', () => {
    store.confirm(vi.fn());

    expect(findCartId).toHaveBeenCalledWith('cafe-central-001');
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
    expect(findCartId).toHaveBeenCalledOnce();
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
    findCartId.mockReturnValue(
      throwError(() => new HttpErrorResponse({ status: 404, error: 'Cart not found' })),
    );

    store.confirm(vi.fn());

    expect(store.errorMessage()).toContain('No encontramos tu carrito');
    expect(createPurchase).not.toHaveBeenCalled();
    expect(cart.items().length).toBe(2);
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
});
