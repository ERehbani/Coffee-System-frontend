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
});
