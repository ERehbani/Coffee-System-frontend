import { registerLocaleData } from '@angular/common';
import localeEsAr from '@angular/common/locales/es-AR';
import { LOCALE_ID } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ValidatedCoupon, ValidationOutcome } from '../../types/coupon-validation.model';
import { ValidationResult } from './validation-result';

registerLocaleData(localeEsAr);

const coupon: ValidatedCoupon = {
  id: 'redemption-1',
  code: '3f2b8c1e-9d4a-4c7b-8e21-5a6f0d9b7c34',
  benefitName: '2x1 en medialunas',
  description: 'Llevá dos y pagá una',
  conditions: ['Un solo uso por cliente.', 'No acumulable.'],
  benefitType: 'DOS_POR_UNO',
  discountPercentage: null,
  productName: 'Medialuna de manteca',
  productPrice: 1200,
  usedAt: '2026-11-13T11:42:07',
};

describe('ValidationResult', () => {
  let fixture: ComponentFixture<ValidationResult>;
  let element: HTMLElement;
  let nextClicks: number;

  async function render(outcome: ValidationOutcome): Promise<void> {
    TestBed.configureTestingModule({
      imports: [ValidationResult],
      providers: [{ provide: LOCALE_ID, useValue: 'es-AR' }],
    });
    fixture = TestBed.createComponent(ValidationResult);
    fixture.componentRef.setInput('outcome', outcome);
    nextClicks = 0;
    fixture.componentInstance.next.subscribe(() => nextClicks++);
    element = fixture.nativeElement;
    fixture.detectChanges();
    await fixture.whenStable();
  }

  const outcomeCard = () => element.querySelector('[data-outcome]');
  const heading = () => element.querySelector('h2');

  it('shows a valid coupon with what the cafe has to hand over', async () => {
    await render({ kind: 'valid', code: coupon.code, coupon });

    expect(outcomeCard()?.getAttribute('data-outcome')).toBe('valid');
    expect(heading()?.textContent?.trim()).toBe('Cupón válido');
    expect(element.textContent).toContain('Entregá el beneficio al cliente.');
    expect(element.querySelector('h3')?.textContent?.trim()).toBe('2x1 en medialunas');
    expect(element.textContent).toContain('Llevá dos y pagá una');
    expect(element.textContent).toContain('2x1');
    expect(element.querySelector('[data-testid="reward"]')?.textContent?.trim()).toBe(
      '2x1 en Medialuna de manteca',
    );
    expect(element.textContent?.replace(/\s+/g, ' ')).toContain('Precio de lista: $ 1.200');
    expect(Array.from(element.querySelectorAll('li')).map((li) => li.textContent?.trim())).toEqual([
      'Un solo uso por cliente.',
      'No acumulable.',
    ]);
    expect(element.textContent).toContain(coupon.code);
    expect(element.textContent).toContain('Validado a las 11:42');
  });

  it('shows the discount of a discount coupon without a product price', async () => {
    const discount: ValidatedCoupon = {
      ...coupon,
      benefitType: 'CODIGO_DESCUENTO',
      discountPercentage: 15,
      productName: null,
      productPrice: null,
    };
    await render({ kind: 'valid', code: discount.code, coupon: discount });

    expect(element.textContent).toContain('Código de descuento');
    expect(element.querySelector('[data-testid="reward"]')?.textContent?.trim()).toBe(
      '15% de descuento',
    );
    expect(element.textContent).not.toContain('Precio de lista');
  });

  it('skips the details the coupon does not have', async () => {
    const plain: ValidatedCoupon = {
      ...coupon,
      description: null,
      conditions: [],
      benefitType: null,
      productName: null,
      productPrice: null,
      usedAt: null,
    };
    await render({ kind: 'valid', code: plain.code, coupon: plain });

    expect(element.querySelector('[data-testid="reward"]')).toBeNull();
    expect(element.querySelector('ul')).toBeNull();
    expect(element.textContent).not.toContain('Validado a las');
    expect(element.textContent).not.toContain('null');
  });

  it('warns that a used coupon must not be honoured', async () => {
    await render({ kind: 'used', code: 'code-1' });

    expect(outcomeCard()?.getAttribute('data-outcome')).toBe('used');
    expect(heading()?.textContent?.trim()).toBe('Cupón ya usado');
    expect(element.textContent).toContain('No entregues el beneficio.');
    expect(element.textContent).toContain('code-1');
  });

  it('tells a missing coupon apart', async () => {
    await render({ kind: 'not-found', code: 'code-1' });

    expect(outcomeCard()?.getAttribute('data-outcome')).toBe('not-found');
    expect(heading()?.textContent?.trim()).toBe('Cupón inexistente');
    expect(element.textContent).toContain('Revisá que esté bien escrito');
    expect(element.textContent).toContain('code-1');
  });

  it('shows the reason of any other rejection', async () => {
    await render({
      kind: 'rejected',
      code: 'code-1',
      message: 'Este cupón es de otra cafetería, no se puede canjear en este local.',
    });

    expect(outcomeCard()?.getAttribute('data-outcome')).toBe('rejected');
    expect(heading()?.textContent?.trim()).toBe('No se pudo validar el cupón');
    expect(element.textContent).toContain('Este cupón es de otra cafetería');
    expect(element.textContent).not.toContain('Cupón válido');
    expect(element.textContent).not.toContain('Cupón ya usado');
    expect(element.textContent).not.toContain('Cupón inexistente');
  });

  it('moves the focus to the result so it is read and seen right away', async () => {
    await render({ kind: 'used', code: 'code-1' });

    expect(document.activeElement).toBe(heading());
  });

  it('asks for the next coupon', async () => {
    await render({ kind: 'not-found', code: 'code-1' });

    Array.from(element.querySelectorAll('button'))
      .find((button) => button.textContent?.includes('Validar otro cupón'))
      ?.click();

    expect(nextClicks).toBe(1);
  });
});
