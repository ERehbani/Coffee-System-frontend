import { registerLocaleData } from '@angular/common';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import localeEsAr from '@angular/common/locales/es-AR';
import { LOCALE_ID } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import type { Mock } from 'vitest';
import { ESPRESSO_FIXTURE } from '../../../catalog/utils/product.fixture';
import { CHECKOUT_PATH } from '../../../checkout/utils/checkout-paths';
import { CartService } from '../../services/cart.service';
import { CartButton } from './cart-button';

registerLocaleData(localeEsAr);

describe('CartButton', () => {
  let fixture: ComponentFixture<CartButton>;
  let element: HTMLElement;
  let cart: CartService;
  let navigateByUrl: Mock;

  beforeEach(async () => {
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

  afterEach(() => localStorage.clear());

  function fillCart() {
    cart.items.set([{ product: ESPRESSO_FIXTURE, quantity: 2 }]);
    cart.cafe.set({ externalId: 'cafe-central-001', name: 'Cafe Central' });
    fixture.detectChanges();
  }

  function openCart() {
    fixture.componentInstance.openCart();
    fixture.detectChanges();
  }

  const panel = () => element.querySelector('#panel-carrito');

  const payButton = () =>
    Array.from(element.querySelectorAll('button')).find((button) =>
      button.textContent?.includes('Ir a pagar'),
    )!;

  it('takes the client to the checkout and closes the cart', () => {
    fillCart();
    openCart();

    payButton().click();
    fixture.detectChanges();

    expect(navigateByUrl).toHaveBeenCalledWith(CHECKOUT_PATH);
    expect(fixture.componentInstance.isOpen()).toBe(false);
  });

  it('keeps the cart when going to the checkout', () => {
    fillCart();
    openCart();

    payButton().click();

    expect(cart.items().length).toBe(1);
    expect(cart.cafe()?.name).toBe('Cafe Central');
  });

  it('no longer simulates the payment inside the cart', () => {
    fillCart();
    openCart();

    payButton().click();
    fixture.detectChanges();

    expect(element.textContent).not.toContain('¡Pagaste con éxito!');
  });

  it('does not go to the checkout with an empty cart', () => {
    openCart();

    expect(payButton().disabled).toBe(true);
    fixture.componentInstance.goToCheckout();

    expect(navigateByUrl).not.toHaveBeenCalled();
  });

  describe('panel', () => {
    it('is not in the page until the client opens the cart', () => {
      fillCart();

      expect(panel()).toBeNull();
      expect(element.textContent).not.toContain('Mi carrito');
    });

    it('shows the products of the cart when the client opens it', () => {
      fillCart();
      openCart();

      expect(panel()?.textContent).toContain('Mi carrito');
      expect(panel()?.textContent).toContain('Espresso Doble');
      expect(element.querySelector('button[aria-controls="panel-carrito"]')?.getAttribute('aria-expanded')).toBe('true');
    });

    it('shows the count of products on the button while the panel is closed', () => {
      fillCart();

      expect(element.querySelector('button[aria-controls="panel-carrito"]')?.textContent?.trim()).toBe('2');
    });

    it('closes when the client presses escape', () => {
      fillCart();
      openCart();

      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      fixture.detectChanges();

      expect(fixture.componentInstance.isOpen()).toBe(false);
    });
  });
});
