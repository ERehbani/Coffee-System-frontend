import { registerLocaleData } from '@angular/common';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import localeEsAr from '@angular/common/locales/es-AR';
import { LOCALE_ID } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import type { Mock } from 'vitest';
import { environment } from '../../../../environments/environment';
import { MOCK_PRODUCTS } from '../../../catalog/data/products.mock';
import { CHECKOUT_PATH } from '../../../checkout/utils/checkout-paths';
import { CartService } from '../../services/cart.service';
import { CartButton } from './cart-button';

registerLocaleData(localeEsAr);

describe('CartButton', () => {
  let fixture: ComponentFixture<CartButton>;
  let element: HTMLElement;
  let cart: CartService;
  let navigateByUrl: Mock;
  const originalUseMockApi = environment.useMockApi;

  beforeEach(async () => {
    environment.useMockApi = true;
    await TestBed.configureTestingModule({
      imports: [CartButton],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: LOCALE_ID, useValue: 'es-AR' },
      ],
    }).compileComponents();

    cart = TestBed.inject(CartService);
    navigateByUrl = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    fixture = TestBed.createComponent(CartButton);
    element = fixture.nativeElement;
  });

  afterEach(() => {
    environment.useMockApi = originalUseMockApi;
    localStorage.clear();
  });

  function fillCart() {
    cart.items.set([{ product: MOCK_PRODUCTS[0], quantity: 2 }]);
    cart.cafe.set({ externalId: 'cafe-central-001', name: 'Cafe Central' });
    fixture.detectChanges();
  }

  const payButton = () =>
    Array.from(element.querySelectorAll('button')).find((button) =>
      button.textContent?.includes('Ir a pagar'),
    )!;

  it('takes the client to the checkout and closes the cart', () => {
    fillCart();
    fixture.componentInstance.openCart();
    fixture.detectChanges();

    payButton().click();
    fixture.detectChanges();

    expect(navigateByUrl).toHaveBeenCalledWith(CHECKOUT_PATH);
    expect(fixture.componentInstance.isOpen()).toBe(false);
  });

  it('keeps the cart when going to the checkout', () => {
    fillCart();

    payButton().click();

    expect(cart.items().length).toBe(1);
    expect(cart.cafe()?.name).toBe('Cafe Central');
  });

  it('no longer simulates the payment inside the cart', () => {
    fillCart();

    payButton().click();
    fixture.detectChanges();

    expect(element.textContent).not.toContain('¡Pagaste con éxito!');
  });

  it('does not go to the checkout with an empty cart', () => {
    fixture.detectChanges();

    expect(payButton().disabled).toBe(true);
    fixture.componentInstance.goToCheckout();

    expect(navigateByUrl).not.toHaveBeenCalled();
  });
});
