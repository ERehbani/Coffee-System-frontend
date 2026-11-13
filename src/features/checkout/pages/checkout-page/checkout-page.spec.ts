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
import { ConfirmedOrder } from '../../types/checkout.model';
import {
  buildPurchaseResponse,
  CHECKOUT_CAFE_FIXTURE,
  CHECKOUT_ITEMS_FIXTURE,
} from '../../utils/checkout.fixture';
import { toConfirmedOrder } from '../../utils/checkout.mapper';
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
  let createPurchase: Mock<() => Observable<ConfirmedOrder>>;

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
          useValue: { findCartId: () => of('cart-1'), createPurchase },
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

  beforeEach(() => {
    createPurchase = vi.fn(() => of(order));
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
});
