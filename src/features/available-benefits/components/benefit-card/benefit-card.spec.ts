import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AvailableBenefit } from '../../model/available-benefit.model';
import { CAFE_BENEFIT_FIXTURE } from '../../utils/available-benefit.fixture';
import { AvailableBenefitCard } from './benefit-card';

describe('AvailableBenefitCard', () => {
  function render(
    benefit: AvailableBenefit,
    clientTierPoints: number | null = null,
  ): ComponentFixture<AvailableBenefitCard> {
    const fixture = TestBed.createComponent(AvailableBenefitCard);
    fixture.componentRef.setInput('benefit', benefit);
    fixture.componentRef.setInput('clientTierPoints', clientTierPoints);
    fixture.detectChanges();
    return fixture;
  }

  function textOf(fixture: ComponentFixture<AvailableBenefitCard>): string {
    return fixture.nativeElement.textContent.replace(/\s+/g, ' ');
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AvailableBenefitCard],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('shows only the title and a link to the detail of the benefit', () => {
    const fixture = render(CAFE_BENEFIT_FIXTURE);
    const text = textOf(fixture);

    expect(text).toContain('Capuccino por puntos');
    expect(text).not.toContain('Cambiá tus puntos por un capuccino');
    expect(text).not.toContain('Cafe Central');
    expect(fixture.nativeElement.querySelector('a')?.getAttribute('href')).toBe('/rewards/benefit-capuccino');
    expect(fixture.nativeElement.querySelector('button')).toBeNull();
  });

  it('tells the client whether the tier unlocks the benefit', () => {
    expect(textOf(render(CAFE_BENEFIT_FIXTURE, 1000))).toContain('Disponible');
    expect(textOf(render(CAFE_BENEFIT_FIXTURE, 0))).toContain('Bloqueado');
  });

  it('marks a benefit without redemptions left as sold out', () => {
    const text = textOf(render({ ...CAFE_BENEFIT_FIXTURE, soldOut: true }, 1000));

    expect(text).toContain('Agotado');
    expect(text).not.toContain('Disponible');
  });
});
