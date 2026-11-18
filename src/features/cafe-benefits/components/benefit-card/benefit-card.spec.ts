import { TestBed } from '@angular/core/testing';
import { CafeBenefit } from '../../model/cafe-benefit.model';
import { BenefitCard } from './benefit-card';

describe('BenefitCard', () => {
  const benefit: CafeBenefit = {
    externalId: 'benefit-1',
    name: '2x1 Espresso',
    description: 'Dos por uno',
    pointsCost: 100,
    status: true,
    isPublic: true,
    maxRedemptions: 10,
    global: false,
  };

  function validityOf(dates: Pick<CafeBenefit, 'startDate' | 'endDate'>): string {
    const fixture = TestBed.createComponent(BenefitCard);
    fixture.componentRef.setInput('benefit', { ...benefit, ...dates });
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    return element.querySelector('[data-testid="benefit-validity"]')?.textContent?.replace(/\s+/g, ' ').trim() ?? '';
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [BenefitCard] }).compileComponents();
  });

  it('shows the validity range when both dates are set', () => {
    expect(validityOf({ startDate: '2026-11-15', endDate: '2026-12-15' })).toBe(
      'Vigencia: 15/11/2026 al 15/12/2026',
    );
  });

  it('shows only the start date when there is no end date', () => {
    expect(validityOf({ startDate: '2026-11-15', endDate: null })).toBe('Desde 15/11/2026');
  });

  it('shows only the end date when there is no start date', () => {
    expect(validityOf({ startDate: null, endDate: '2026-12-15' })).toBe('Hasta 15/12/2026');
  });

  it('says the benefit does not expire when there are no dates', () => {
    expect(validityOf({})).toBe('Sin vencimiento');
  });
});
