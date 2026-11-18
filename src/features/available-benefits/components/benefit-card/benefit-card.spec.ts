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

  describe('redeem action', () => {
    const redeemButton = (fixture: ComponentFixture<AvailableBenefitCard>) =>
      fixture.nativeElement.querySelector('button') as HTMLButtonElement;

    function renderWith(
      benefit: AvailableBenefit,
      inputs: { clientTierPoints?: number | null; availablePoints?: number | null; phase?: string } = {},
    ): ComponentFixture<AvailableBenefitCard> {
      const fixture = render(benefit, inputs.clientTierPoints ?? null);
      fixture.componentRef.setInput('availablePoints', inputs.availablePoints ?? null);
      fixture.componentRef.setInput('phase', inputs.phase ?? 'idle');
      fixture.detectChanges();
      return fixture;
    }

    it('asks to redeem the benefit with its id', () => {
      const fixture = renderWith(CAFE_BENEFIT_FIXTURE, { clientTierPoints: 1000, availablePoints: 300 });
      const requested: string[] = [];
      fixture.componentInstance.redeemRequested.subscribe((id) => requested.push(id));

      redeemButton(fixture).click();

      expect(redeemButton(fixture).disabled).toBe(false);
      expect(requested).toEqual(['benefit-capuccino']);
    });

    it('hides the button and says how many points are missing', () => {
      const fixture = renderWith(CAFE_BENEFIT_FIXTURE, { clientTierPoints: 1000, availablePoints: 120 });

      expect(redeemButton(fixture)).toBeNull();
      expect(textOf(fixture)).toContain('Te faltan 180 pts');
    });

    it('hides the button and says which level unlocks the benefit', () => {
      const fixture = renderWith(CAFE_BENEFIT_FIXTURE, { clientTierPoints: 0, availablePoints: 5000 });

      expect(redeemButton(fixture)).toBeNull();
      expect(textOf(fixture)).toContain('Disponible desde Plata');
    });

    it('hides the button of a sold out benefit', () => {
      const fixture = renderWith({ ...CAFE_BENEFIT_FIXTURE, soldOut: true }, { clientTierPoints: 1000, availablePoints: 5000 });

      expect(redeemButton(fixture)).toBeNull();
    });

    it('hides the button while the points of the client are unknown', () => {
      const fixture = renderWith(CAFE_BENEFIT_FIXTURE);

      expect(redeemButton(fixture)).toBeNull();
    });

    it('cannot redeem while another benefit is being redeemed', () => {
      const fixture = renderWith(CAFE_BENEFIT_FIXTURE, { clientTierPoints: 1000, availablePoints: 300 });
      fixture.componentRef.setInput('locked', true);
      fixture.detectChanges();

      expect(redeemButton(fixture).disabled).toBe(true);
    });

    it('asks to confirm the cost and emits the answer', () => {
      const fixture = renderWith(CAFE_BENEFIT_FIXTURE, { clientTierPoints: 1000, availablePoints: 300, phase: 'confirming' });
      let confirmations = 0;
      let cancellations = 0;
      fixture.componentInstance.redeemConfirmed.subscribe(() => confirmations++);
      fixture.componentInstance.redeemCancelled.subscribe(() => cancellations++);
      const buttons = Array.from(fixture.nativeElement.querySelectorAll('button')) as HTMLButtonElement[];

      expect(textOf(fixture)).toContain('¿Canjear Capuccino por puntos por 300 pts?');
      buttons.find((button) => button.textContent?.includes('Confirmar'))?.click();
      buttons.find((button) => button.textContent?.includes('Cancelar'))?.click();

      expect(confirmations).toBe(1);
      expect(cancellations).toBe(1);
    });

    it('is busy while the redeem is in flight', () => {
      const fixture = renderWith(CAFE_BENEFIT_FIXTURE, { clientTierPoints: 1000, availablePoints: 300, phase: 'redeeming' });

      expect(redeemButton(fixture).disabled).toBe(true);
      expect(redeemButton(fixture).textContent).toContain('Canjeando');
    });
  });
});
