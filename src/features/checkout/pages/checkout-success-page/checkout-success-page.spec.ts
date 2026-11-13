import { registerLocaleData } from '@angular/common';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import localeEsAr from '@angular/common/locales/es-AR';
import { LOCALE_ID } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { CheckoutRepository } from '../../services/checkout.repository';
import { CheckoutStore } from '../../services/checkout.store';
import { ConfirmedOrder } from '../../types/checkout.model';
import {
  buildPurchaseResponse,
  CHECKOUT_CAFE_FIXTURE,
  CHECKOUT_ITEMS_FIXTURE,
} from '../../utils/checkout.fixture';
import { toConfirmedOrder } from '../../utils/checkout.mapper';
import { CheckoutSuccessPage } from './checkout-success-page';

registerLocaleData(localeEsAr);

const order: ConfirmedOrder = toConfirmedOrder(
  buildPurchaseResponse('purchase-1', CHECKOUT_CAFE_FIXTURE, CHECKOUT_ITEMS_FIXTURE, new Date()),
);

describe('CheckoutSuccessPage', () => {
  let fixture: ComponentFixture<CheckoutSuccessPage>;
  let element: HTMLElement;

  const text = (testId: string) =>
    element.querySelector(`[data-testid="${testId}"]`)?.textContent?.replace(/\s+/g, ' ').trim();

  async function render(confirmedOrder: ConfirmedOrder | null = order) {
    await TestBed.configureTestingModule({
      imports: [CheckoutSuccessPage],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        CheckoutStore,
        { provide: LOCALE_ID, useValue: 'es-AR' },
        { provide: CheckoutRepository, useValue: {} },
      ],
    }).compileComponents();

    TestBed.inject(CheckoutStore).confirmedOrder.set(confirmedOrder);
    fixture = TestBed.createComponent(CheckoutSuccessPage);
    fixture.detectChanges();
    element = fixture.nativeElement;
  }

  afterEach(() => localStorage.clear());

  it('shows the order number, the status in Spanish and the generated points', async () => {
    await render();

    expect(text('success-order-number')).toBe('purchase-1');
    expect(text('success-status')).toBe('Confirmada');
    expect(text('success-points')).toBe(`+${order.generatedPoints} puntos`);
  });

  it('shows the total paid, the cafe and the date of the confirmed order', async () => {
    await render();

    expect(text('success-total')).toContain('9.200');
    expect(text('success-cafe')).toBe('Cafe Central');
    expect(text('success-date')).not.toBe('');
  });

  it('lists a short detail of the products', async () => {
    await render();

    expect(element.querySelectorAll('li').length).toBe(order.lines.length);
    expect(element.textContent).toContain(order.lines[0].productName);
  });

  it('links to the purchase history and to the home', async () => {
    await render();

    const hrefs = Array.from(element.querySelectorAll('a')).map((link) =>
      link.getAttribute('href'),
    );
    expect(hrefs).toEqual(['/purchases', '/home']);
  });

  it('shows the label of a cancelled order', async () => {
    await render({ ...order, status: 'cancelled' });

    expect(text('success-status')).toBe('Cancelada');
  });

  it('renders nothing when there is no confirmed order', async () => {
    await render(null);

    expect(element.querySelector('h1')).toBeNull();
  });
});
