import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { Subject, of, throwError } from 'rxjs';
import { ToastService } from '../../../../shared/components/toast/toast.service';
import { ProfileRepository } from '../../../profile/services/profile.repository';
import { RedeemedBenefit } from '../../../profile/types/profile.model';
import { AvailableBenefit } from '../../model/available-benefit.model';
import { AvailableBenefitService } from '../../services/available-benefit.service';
import { CAFE_BENEFIT_FIXTURE, GLOBAL_BENEFIT_FIXTURE } from '../../utils/available-benefit.fixture';
import { BenefitDetail } from './benefit-detail';

describe('BenefitDetail', () => {
  const redeemed: RedeemedBenefit = {
    id: 'redemption-1',
    validationCode: 'ABC123',
    benefitName: CAFE_BENEFIT_FIXTURE.name,
    cafeName: null,
    usedPoints: 300,
    redeemedAt: new Date(2026, 10, 17),
  };
  let findLoaded: ReturnType<typeof vi.fn>;
  let getById: ReturnType<typeof vi.fn>;
  let getTierDetail: ReturnType<typeof vi.fn>;
  let redeemBenefit: ReturnType<typeof vi.fn>;

  function render(): ComponentFixture<BenefitDetail> {
    const fixture = TestBed.createComponent(BenefitDetail);
    fixture.detectChanges();
    return fixture;
  }

  function textOf(fixture: ComponentFixture<BenefitDetail>): string {
    return fixture.nativeElement.textContent.replace(/\s+/g, ' ');
  }

  function openWith(benefit: AvailableBenefit, clientTierPoints = 1000, availablePoints = 300): ComponentFixture<BenefitDetail> {
    findLoaded.mockReturnValue(benefit);
    getById.mockReturnValue(of(benefit));
    getTierDetail.mockReturnValue(of({ currentTierThreshold: clientTierPoints, availablePoints }));
    return render();
  }

  const redeemButton = (fixture: ComponentFixture<BenefitDetail>) =>
    fixture.nativeElement.querySelector('button') as HTMLButtonElement;

  const click = (fixture: ComponentFixture<BenefitDetail>, text: string) => {
    const button = (Array.from(fixture.nativeElement.querySelectorAll('button')) as HTMLButtonElement[]).find(
      (candidate) => candidate.textContent?.includes(text),
    );
    button?.click();
    fixture.detectChanges();
  };

  beforeEach(async () => {
    findLoaded = vi.fn(() => CAFE_BENEFIT_FIXTURE);
    getById = vi.fn(() => of(CAFE_BENEFIT_FIXTURE));
    getTierDetail = vi.fn(() => of({ currentTierThreshold: 1000, availablePoints: 300 }));
    redeemBenefit = vi.fn(() => of(redeemed));
    await TestBed.configureTestingModule({
      imports: [BenefitDetail],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ id: 'benefit-capuccino' }) } } },
        { provide: AvailableBenefitService, useValue: { findLoaded, getById } },
        { provide: ProfileRepository, useValue: { getTierDetail, redeemBenefit } },
      ],
    }).compileComponents();
  });

  it('shows the title, the description and the requirements as tags', () => {
    const text = textOf(render());

    expect(text).toContain('Capuccino por puntos');
    expect(text).toContain('Cafe Central');
    expect(text).toContain('Cambiá tus puntos por un capuccino');
    expect(text).toContain('300 pts');
    expect(text).toContain('Nivel PLATA');
    expect(text).toContain('desde 1,000 pts acumulados');
    expect(text).toContain('Vence el 31/12/2026');
    expect(text).toContain('Válido de lunes a viernes');
  });

  it('shows the product the benefit gives', () => {
    const tags = Array.from(render().nativeElement.querySelectorAll('li')) as HTMLElement[];

    expect(tags.some((tag) => tag.textContent?.trim() === 'Capuccino')).toBe(true);
  });

  it('says that a global benefit works in every cafe', () => {
    expect(textOf(openWith(GLOBAL_BENEFIT_FIXTURE))).toContain('Todas las cafeterías');
  });

  describe('redeeming the benefit', () => {
    it('states the cost and redeems only after the client confirms', () => {
      const fixture = render();

      click(fixture, 'Canjear');

      expect(textOf(fixture)).toContain('¿Canjear Capuccino por puntos por 300 pts?');
      expect(redeemBenefit).not.toHaveBeenCalled();

      click(fixture, 'Confirmar');

      expect(redeemBenefit).toHaveBeenCalledExactlyOnceWith('benefit-capuccino');
    });

    it('tells the client the coupon is in "Mis cupones" and refreshes the points and the benefit', () => {
      const success = vi.spyOn(TestBed.inject(ToastService), 'success');
      const fixture = render();
      click(fixture, 'Canjear');

      click(fixture, 'Confirmar');

      expect(success).toHaveBeenCalledWith(
        '¡Canjeaste Capuccino por puntos por 300 pts! Tu cupón ya está en Mis cupones.',
        { label: 'Ver mis cupones', route: '/profile/coupons' },
      );
      expect(getTierDetail).toHaveBeenCalledTimes(2);
      expect(getById).toHaveBeenCalledTimes(2);
      expect(fixture.componentInstance.isLoading()).toBe(false);
    });

    it('does not redeem when the client cancels the confirmation', () => {
      const fixture = render();
      click(fixture, 'Canjear');

      click(fixture, 'Cancelar');

      expect(redeemBenefit).not.toHaveBeenCalled();
      expect(textOf(fixture)).not.toContain('¿Canjear');
    });

    it('shows the reason of the backend in a toast when the redeem is rejected', () => {
      const error = vi.spyOn(TestBed.inject(ToastService), 'error');
      redeemBenefit.mockReturnValue(
        throwError(
          () => new HttpErrorResponse({ status: 422, error: { detail: 'El cliente no tiene puntos suficientes' } }),
        ),
      );
      const fixture = render();
      click(fixture, 'Canjear');

      click(fixture, 'Confirmar');

      expect(error).toHaveBeenCalledWith('No tenés puntos suficientes para este beneficio.');
    });

    it('is busy while the redeem is in flight', () => {
      redeemBenefit.mockReturnValue(new Subject<RedeemedBenefit>());
      const fixture = render();
      click(fixture, 'Canjear');

      click(fixture, 'Confirmar');

      expect(redeemButton(fixture).disabled).toBe(true);
      expect(redeemButton(fixture).textContent).toContain('Canjeando');
    });

    it('enables the button when the client can redeem the benefit', () => {
      expect(redeemButton(render()).disabled).toBe(false);
    });

    it('disables the button and says how many points are missing', () => {
      const fixture = openWith(CAFE_BENEFIT_FIXTURE, 1000, 120);

      expect(redeemButton(fixture).disabled).toBe(true);
      expect(textOf(fixture)).toContain('Te faltan 180 pts');
    });

    it('disables the button and says which level unlocks the benefit', () => {
      const fixture = openWith(CAFE_BENEFIT_FIXTURE, 0, 5000);

      expect(redeemButton(fixture).disabled).toBe(true);
      expect(textOf(fixture)).toContain('Disponible desde Plata');
    });

    it('disables the button of a sold out benefit', () => {
      const fixture = openWith({ ...CAFE_BENEFIT_FIXTURE, soldOut: true }, 1000, 5000);

      expect(redeemButton(fixture).disabled).toBe(true);
      expect(textOf(fixture)).toContain('Este beneficio ya no tiene canjes disponibles.');
    });

    it('disables the button while the points of the client are unknown', () => {
      getTierDetail.mockReturnValue(new Subject());
      const fixture = render();

      expect(redeemButton(fixture).disabled).toBe(true);
    });
  });
});
