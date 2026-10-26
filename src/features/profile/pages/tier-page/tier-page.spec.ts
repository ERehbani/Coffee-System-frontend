import { registerLocaleData } from '@angular/common';
import localeEsAr from '@angular/common/locales/es-AR';
import { LOCALE_ID } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Observable, of, Subject, throwError } from 'rxjs';
import type { Mock } from 'vitest';
import { ProfileRepository } from '../../services/profile.repository';
import { TierStore } from '../../services/tier.store';
import { RedeemedBenefit, TierBenefit, TierDetail } from '../../types/profile.model';
import { buildTierDetailFixture } from '../../utils/profile.fixture';
import { toTierDetail } from '../../utils/profile.mapper';
import { TierPage } from './tier-page';

registerLocaleData(localeEsAr);

const coffee: TierBenefit = {
  id: 'benefit-coffee',
  name: 'Café de cortesía',
  description: 'Un café de filtro a elección',
  pointsCost: 300,
  expiresAt: null,
  cafeName: null,
  tier: 'bronze',
};

const mug: TierBenefit = {
  id: 'benefit-mug',
  name: 'Taza de edición limitada',
  description: 'Taza de cerámica con el diseño de la temporada',
  pointsCost: 1200,
  expiresAt: new Date(2026, 11, 31),
  cafeName: 'Cafe Central',
  tier: 'silver',
};

const redeemed: RedeemedBenefit = {
  id: 'redemption-9',
  validationCode: 'VLD-0009-MOCK',
  benefitName: coffee.name,
  cafeName: null,
  usedPoints: 300,
  redeemedAt: new Date(2026, 9, 26, 9, 30),
};

describe('TierPage', () => {
  let fixture: ComponentFixture<TierPage>;
  let element: HTMLElement;
  let points: number;
  let benefits: Observable<readonly TierBenefit[]>;
  let redeemBenefit: Mock<(id: string) => Observable<RedeemedBenefit>>;
  let getTierBenefits: Mock<() => Observable<readonly TierBenefit[]>>;
  let getTierDetail: Mock<() => Observable<TierDetail>>;

  async function render() {
    await TestBed.configureTestingModule({
      imports: [TierPage],
      providers: [
        provideRouter([]),
        TierStore,
        { provide: LOCALE_ID, useValue: 'es-AR' },
        {
          provide: ProfileRepository,
          useValue: { getTierDetail, getTierBenefits, redeemBenefit },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TierPage);
    TestBed.flushEffects();
    fixture.detectChanges();
    element = fixture.nativeElement;
  }

  /** Lets the resources and the queued renders settle after an interaction. */
  async function settle() {
    TestBed.flushEffects();
    await fixture.whenStable();
    fixture.detectChanges();
    await fixture.whenStable();
  }

  const buttonByText = (text: string, root: ParentNode = element) =>
    Array.from(root.querySelectorAll('button')).find((button) =>
      button.textContent?.includes(text),
    );

  const itemByName = (name: string) =>
    Array.from(element.querySelectorAll('app-tier-benefit-item')).find((item) =>
      item.querySelector('h3')?.textContent?.includes(name),
    )!;

  const benefitsSection = () =>
    element.querySelector('section[aria-labelledby="tier-benefits-heading"]')!;

  beforeEach(() => {
    points = 850;
    benefits = of([coffee, mug]);
    getTierDetail = vi.fn(() =>
      of(toTierDetail({ ...buildTierDetailFixture(), availablePoints: points })),
    );
    getTierBenefits = vi.fn(() => benefits);
    redeemBenefit = vi.fn(() => {
      points -= 300;
      return of(redeemed);
    });
  });

  describe('section', () => {
    it('shows "Beneficios de tu nivel" under the tier hero and before the levels', async () => {
      await render();

      const hero = element.querySelector('section[aria-label="Tu nivel actual"]')!;
      const levels = element.querySelector('section[aria-labelledby="tier-levels-heading"]')!;
      expect(benefitsSection().querySelector('h2')?.textContent).toContain(
        'Beneficios de tu nivel',
      );
      expect(
        hero.compareDocumentPosition(benefitsSection()) & Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();
      expect(
        benefitsSection().compareDocumentPosition(levels) & Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();
    });

    it('lists the benefits of the level with the available points', async () => {
      points = 1850;
      await render();

      const items = element.querySelectorAll('app-tier-benefit-item');
      expect(items.length).toBe(2);
      expect(items[0].textContent).toContain('Café de cortesía');
      expect(items[0].textContent).toContain('Todas las cafeterías');
      expect(items[1].textContent).toContain('Taza de edición limitada');
      expect(items[1].textContent).toContain('Cafe Central');
      expect(items[1].textContent).toContain('1.200 pts');
      expect(benefitsSection().textContent).toContain('Tienes 1.850 pts disponibles');
    });

    it('keeps the "Niveles y beneficios" section', async () => {
      await render();

      expect(element.querySelector('#tier-levels-heading')?.textContent).toContain(
        'Niveles y beneficios',
      );
      expect(element.querySelectorAll('app-tier-level-item').length).toBe(4);
    });
  });

  describe('states', () => {
    it('shows a loading state while the benefits load', async () => {
      benefits = new Subject<readonly TierBenefit[]>();
      await render();

      expect(benefitsSection().querySelector('[aria-busy="true"]')).not.toBeNull();
      expect(benefitsSection().textContent).toContain('Cargando tus beneficios');
      expect(element.querySelector('app-tier-benefit-item')).toBeNull();
      // The rest of the page does not wait for the benefits.
      expect(element.querySelectorAll('app-tier-level-item').length).toBe(4);
    });

    it('shows an error with "Reintentar" when the benefits fail, and retries', async () => {
      let calls = 0;
      getTierBenefits = vi.fn(() =>
        ++calls === 1 ? throwError(() => new Error('500')) : of([coffee]),
      );
      await render();

      expect(benefitsSection().querySelector('[role="alert"]')?.textContent).toContain(
        'No pudimos cargar tus beneficios',
      );
      expect(element.querySelectorAll('app-tier-level-item').length).toBe(4);

      buttonByText('Reintentar', benefitsSection())!.click();
      await settle();

      expect(calls).toBe(2);
      expect(benefitsSection().querySelector('[role="alert"]')).toBeNull();
      expect(element.querySelectorAll('app-tier-benefit-item').length).toBe(1);
    });

    it('shows an empty state when the level has no benefits', async () => {
      benefits = of([]);
      await render();

      expect(benefitsSection().textContent).toContain(
        'Todavía no hay beneficios disponibles para tu nivel.',
      );
      expect(element.querySelector('app-tier-benefit-item')).toBeNull();
    });

    it('disables a benefit the client cannot afford and says how many points are missing', async () => {
      await render();

      const unaffordable = itemByName('Taza de edición limitada');
      expect(unaffordable.textContent).toContain('Te faltan 350 pts');
      expect(buttonByText('Activar', unaffordable)!.disabled).toBe(true);
      expect(buttonByText('Activar', itemByName('Café de cortesía'))!.disabled).toBe(false);
    });
  });

  describe('activation', () => {
    it('asks for confirmation before spending points, and cancelling spends nothing', async () => {
      await render();

      buttonByText('Activar', itemByName('Café de cortesía'))!.click();
      await settle();

      expect(itemByName('Café de cortesía').textContent).toContain(
        '¿Canjear Café de cortesía por 300 pts?',
      );
      expect(redeemBenefit).not.toHaveBeenCalled();

      buttonByText('Cancelar')!.click();
      await settle();

      expect(element.textContent).not.toContain('¿Canjear');
      expect(redeemBenefit).not.toHaveBeenCalled();
    });

    it('redeems after the confirmation and shows the code with a link to the coupon', async () => {
      await render();
      buttonByText('Activar', itemByName('Café de cortesía'))!.click();
      await settle();

      buttonByText('Confirmar')!.click();
      await settle();

      expect(redeemBenefit).toHaveBeenCalledExactlyOnceWith('benefit-coffee');
      const success = element.querySelector('[data-testid="redeem-success"]')!;
      expect(success.textContent).toContain('Café de cortesía');
      expect(success.querySelector('[data-testid="redeem-code"]')?.textContent?.trim()).toBe(
        'VLD-0009-MOCK',
      );
      const link = success.querySelector('a')!;
      expect(link.textContent?.trim()).toBe('Ver cupón');
      expect(link.getAttribute('href')).toBe('/profile/redemptions/redemption-9');
    });

    it('announces the success politely and moves the focus to it', async () => {
      await render();
      buttonByText('Activar', itemByName('Café de cortesía'))!.click();
      await settle();
      buttonByText('Confirmar')!.click();
      await settle();

      const success = element.querySelector('[data-testid="redeem-success"]')!;
      expect(success.closest('[aria-live="polite"]')).not.toBeNull();
      expect(document.activeElement).toBe(success);
    });

    it('refreshes the available points and the missing points after redeeming', async () => {
      await render();
      expect(benefitsSection().textContent).toContain('Tienes 850 pts disponibles');
      buttonByText('Activar', itemByName('Café de cortesía'))!.click();
      await settle();

      buttonByText('Confirmar')!.click();
      await settle();

      expect(benefitsSection().textContent).toContain('Tienes 550 pts disponibles');
      expect(itemByName('Taza de edición limitada').textContent).toContain('Te faltan 650 pts');
      expect(getTierDetail).toHaveBeenCalledTimes(2);
      expect(getTierBenefits).toHaveBeenCalledTimes(2);
    });

    it('disables every button while the redemption is in progress', async () => {
      const pending = new Subject<RedeemedBenefit>();
      redeemBenefit = vi.fn(() => pending);
      points = 5000;
      await render();
      buttonByText('Activar', itemByName('Café de cortesía'))!.click();
      await settle();

      buttonByText('Confirmar')!.click();
      await settle();

      expect(buttonByText('Canjeando', itemByName('Café de cortesía'))!.disabled).toBe(true);
      expect(buttonByText('Activar', itemByName('Taza de edición limitada'))!.disabled).toBe(true);
      expect(element.querySelector('[data-testid="redeem-success"]')).toBeNull();
    });

    it('shows an error on the benefit and keeps the points when the redemption fails', async () => {
      redeemBenefit = vi.fn(() => throwError(() => new Error('400')));
      await render();
      buttonByText('Activar', itemByName('Café de cortesía'))!.click();
      await settle();

      buttonByText('Confirmar')!.click();
      await settle();

      expect(itemByName('Café de cortesía').textContent).toContain('No pudimos canjear');
      expect(itemByName('Taza de edición limitada').textContent).not.toContain(
        'No pudimos canjear',
      );
      expect(element.querySelector('[data-testid="redeem-success"]')).toBeNull();
      expect(benefitsSection().textContent).toContain('Tienes 850 pts disponibles');
      expect(buttonByText('Activar', itemByName('Café de cortesía'))!.disabled).toBe(false);
    });

    it('closes the success message', async () => {
      await render();
      buttonByText('Activar', itemByName('Café de cortesía'))!.click();
      await settle();
      buttonByText('Confirmar')!.click();
      await settle();

      buttonByText('Cerrar')!.click();
      await settle();

      expect(element.querySelector('[data-testid="redeem-success"]')).toBeNull();
    });
  });
});
