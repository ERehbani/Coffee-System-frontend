import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AvailableBenefit } from '../../model/available-benefit.model';
import { CAFE_BENEFIT_FIXTURE, GLOBAL_BENEFIT_FIXTURE } from '../../utils/available-benefit.fixture';
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
    await TestBed.configureTestingModule({ imports: [AvailableBenefitCard] }).compileComponents();
  });

  it('shows the title, the cafe, the description and the requirements', () => {
    const text = textOf(render(CAFE_BENEFIT_FIXTURE));

    expect(text).toContain('Capuccino por puntos');
    expect(text).toContain('Cafe Central');
    expect(text).toContain('Cambiá tus puntos por un capuccino');
    expect(text).toContain('Requisitos');
    expect(text).toContain('300 pts');
    expect(text).toContain('Nivel PLATA');
    expect(text).toContain('desde 1,000 pts acumulados');
    expect(text).toContain('Válido hasta el 31/12/2026');
    expect(text).toContain('Válido de lunes a viernes');
  });

  it('shows the product the benefit gives', () => {
    const fixture = render(CAFE_BENEFIT_FIXTURE);
    const rows = Array.from(fixture.nativeElement.querySelectorAll('.requirement-row')) as HTMLElement[];

    expect(rows.some((row) => row.textContent?.trim() === 'Capuccino')).toBe(true);
  });

  it('says that a global benefit works in every cafe', () => {
    expect(textOf(render(GLOBAL_BENEFIT_FIXTURE))).toContain('Todas las cafeterías');
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
