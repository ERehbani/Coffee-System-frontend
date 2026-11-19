import { registerLocaleData } from '@angular/common';
import localeEsAr from '@angular/common/locales/es-AR';
import { LOCALE_ID } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FeaturedBenefit } from '../../types/profile.model';
import { FeaturedBenefitCard } from './featured-benefit-card';

registerLocaleData(localeEsAr);

const benefit: FeaturedBenefit = {
  id: 'benefit-1',
  title: 'Café de cortesía',
  description: 'Un café a elección',
  imageUrl: 'https://example.com/benefit.jpg',
  pointsCost: 300,
};

describe('FeaturedBenefitCard', () => {
  let fixture: ComponentFixture<FeaturedBenefitCard>;
  let element: HTMLElement;

  function render(overrides: Partial<FeaturedBenefit> = {}) {
    TestBed.configureTestingModule({
      imports: [FeaturedBenefitCard],
      providers: [{ provide: LOCALE_ID, useValue: 'es-AR' }],
    });
    fixture = TestBed.createComponent(FeaturedBenefitCard);
    fixture.componentRef.setInput('benefit', { ...benefit, ...overrides });
    fixture.componentRef.setInput('availablePoints', 1000);
    fixture.detectChanges();
    element = fixture.nativeElement;
  }

  it('shows the image of the benefit', () => {
    render();

    expect(element.querySelector('img')?.getAttribute('src')).toContain('example.com/benefit.jpg');
  });

  it('shows a placeholder instead of a broken image when the benefit has no image', () => {
    render({ imageUrl: null });

    expect(element.querySelector('img')).toBeNull();
    expect(element.querySelector('[data-testid="benefit-placeholder"]')).not.toBeNull();
    expect(element.textContent).toContain('Café de cortesía');
    expect(element.textContent).toContain('300 pts');
  });

  describe('redeem action', () => {
    const buttons = () => Array.from(element.querySelectorAll('button')) as HTMLButtonElement[];

    it('asks to redeem the benefit with its id', () => {
      render();
      const requested: string[] = [];
      fixture.componentInstance.redeem.subscribe((id) => requested.push(id));

      buttons()[0].click();

      expect(requested).toEqual(['benefit-1']);
    });

    it('hides the button and says how many points are missing when the points are not enough', () => {
      render();
      fixture.componentRef.setInput('availablePoints', 100);
      fixture.detectChanges();

      expect(buttons()).toHaveLength(0);
      expect(element.textContent).toContain('Te faltan 200 pts');
    });

    it('cannot redeem while another benefit is being redeemed', () => {
      render();
      fixture.componentRef.setInput('locked', true);
      fixture.detectChanges();

      expect(buttons()[0].disabled).toBe(true);
    });

    it('asks to confirm the cost and emits the answer', () => {
      render();
      fixture.componentRef.setInput('phase', 'confirming');
      fixture.detectChanges();
      let confirmations = 0;
      let cancellations = 0;
      fixture.componentInstance.redeemConfirmed.subscribe(() => confirmations++);
      fixture.componentInstance.redeemCancelled.subscribe(() => cancellations++);

      expect(element.textContent).toContain('¿Canjear Café de cortesía por 300 pts?');
      buttons().find((button) => button.textContent?.includes('Confirmar'))?.click();
      buttons().find((button) => button.textContent?.includes('Cancelar'))?.click();

      expect(confirmations).toBe(1);
      expect(cancellations).toBe(1);
    });

    it('is busy while the redeem is in flight', () => {
      render();
      fixture.componentRef.setInput('phase', 'redeeming');
      fixture.detectChanges();

      expect(buttons()[0].disabled).toBe(true);
      expect(buttons()[0].textContent).toContain('Canjeando');
    });
  });
});
