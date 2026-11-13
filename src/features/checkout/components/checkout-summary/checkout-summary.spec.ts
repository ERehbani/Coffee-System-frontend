import { registerLocaleData } from '@angular/common';
import localeEsAr from '@angular/common/locales/es-AR';
import { LOCALE_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { CHECKOUT_CAFE_FIXTURE, CHECKOUT_ITEMS_FIXTURE } from '../../utils/checkout.fixture';
import { toCheckoutSummary } from '../../utils/checkout.mapper';
import { CheckoutSummaryCard } from './checkout-summary';

registerLocaleData(localeEsAr);

describe('CheckoutSummaryCard', () => {
  async function render(): Promise<HTMLElement> {
    await TestBed.configureTestingModule({
      imports: [CheckoutSummaryCard],
      providers: [{ provide: LOCALE_ID, useValue: 'es-AR' }],
    }).compileComponents();

    const fixture = TestBed.createComponent(CheckoutSummaryCard);
    fixture.componentRef.setInput(
      'summary',
      toCheckoutSummary(CHECKOUT_CAFE_FIXTURE, CHECKOUT_ITEMS_FIXTURE),
    );
    fixture.detectChanges();
    return fixture.nativeElement;
  }

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
});
