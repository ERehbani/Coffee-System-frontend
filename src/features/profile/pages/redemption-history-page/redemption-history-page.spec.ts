import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Observable, of, Subject, throwError } from 'rxjs';
import { ProfileRepository } from '../../services/profile.repository';
import { RedemptionHistoryStore } from '../../services/redemption-history.store';
import { UsedBenefit } from '../../types/profile.model';
import { RedemptionHistoryPage } from './redemption-history-page';

const usedBenefits: UsedBenefit[] = [
  {
    id: 'redemption-2',
    benefitName: 'Cappuccino gratis',
    cafeName: 'Cafe Central',
    redeemedAt: new Date(2026, 9, 17, 10, 30),
    usedPoints: 450,
    status: 'used',
    usedAt: new Date(2026, 9, 18, 9, 15),
  },
  {
    id: 'redemption-1',
    benefitName: 'Descuento 10% en tu pedido',
    cafeName: null,
    redeemedAt: new Date(2026, 8, 2, 18, 5),
    usedPoints: 300,
    status: 'expired',
    usedAt: null,
  },
];

describe('RedemptionHistoryPage', () => {
  let fixture: ComponentFixture<RedemptionHistoryPage>;
  let element: HTMLElement;

  async function render(getUsedBenefits: () => Observable<readonly UsedBenefit[]>) {
    await TestBed.configureTestingModule({
      imports: [RedemptionHistoryPage],
      providers: [
        provideRouter([]),
        RedemptionHistoryStore,
        { provide: ProfileRepository, useValue: { getUsedBenefits } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RedemptionHistoryPage);
    TestBed.flushEffects();
    fixture.detectChanges();
    element = fixture.nativeElement;
  }

  it('CA1: lists the used benefits with their redemption date and cafe', async () => {
    await render(() => of(usedBenefits));

    const items = element.querySelectorAll('app-used-benefit-item');
    expect(items.length).toBe(2);

    expect(items[0].textContent).toContain('Cappuccino gratis');
    expect(items[0].textContent).toContain('Cafe Central');
    expect(items[0].textContent).toContain('17 Oct 2026, 10:30');
    expect(items[0].querySelector('time')?.getAttribute('datetime')).toBe(
      usedBenefits[0].redeemedAt.toISOString(),
    );

    expect(items[1].textContent).toContain('Descuento 10% en tu pedido');
    expect(items[1].textContent).toContain('Todas las cafeterías de la red');
    expect(items[1].textContent).toContain('2 Sep 2026, 18:05');
  });

  it('shows a summary of benefits and points used', async () => {
    await render(() => of(usedBenefits));

    expect(element.textContent).toContain('2 beneficios canjeados');
    expect(element.textContent).toContain('750 pts canjeados');
  });

  it('shows an empty state when no benefits were used', async () => {
    await render(() => of([]));

    expect(element.querySelector('app-used-benefit-item')).toBeNull();
    expect(element.textContent).toContain('Todavía no usaste ningún beneficio');
  });

  it('uses the singular label for a single used benefit', async () => {
    await render(() => of([usedBenefits[0]]));

    expect(element.textContent).toContain('1 beneficio canjeado');
    expect(element.textContent).not.toMatch(/\d+ beneficios canjeados/);
  });

  it('CA2: labels each benefit as redeemed or expired', async () => {
    await render(() => of(usedBenefits));

    const statusLabels = Array.from(element.querySelectorAll('article > div:last-child > p:first-child')).map(
      (label) => label.textContent?.trim(),
    );
    expect(statusLabels).toEqual(['Canjeado', 'Vencido']);
  });

  it('CA2: shows the benefits as disabled, with the date the coupon was used', async () => {
    await render(() => of(usedBenefits));

    const cards = element.querySelectorAll('app-used-benefit-item article');
    expect(cards[0].getAttribute('data-status')).toBe('used');
    expect(cards[1].getAttribute('data-status')).toBe('expired');
    cards.forEach((card) => expect(card.classList).toContain('opacity-80'));

    expect(cards[0].textContent).toContain('Usado el');
    expect(cards[0].textContent).toContain('18 Oct 2026, 09:15');
    expect(cards[1].textContent).not.toContain('Usado el');
  });

  it('shows a loading state while the history is loading', async () => {
    const pending = new Subject<readonly UsedBenefit[]>();
    await render(() => pending);

    expect(element.querySelector('[aria-busy="true"]')).not.toBeNull();
    expect(element.textContent).toContain('Cargando tu historial');
    expect(element.querySelector('app-used-benefit-item')).toBeNull();
  });

  it('shows an error with a retry button when loading fails', async () => {
    await render(() => throwError(() => new Error('500')));

    expect(element.querySelector('[role="alert"]')?.textContent).toContain(
      'No pudimos cargar tu historial',
    );
  });

  it('fetches once on the first visit and reloads the history when the page is opened again', async () => {
    let calls = 0;
    await render(() => {
      calls++;
      return of(usedBenefits);
    });
    expect(calls).toBe(1);

    fixture = TestBed.createComponent(RedemptionHistoryPage);
    TestBed.flushEffects();
    await fixture.whenStable();

    expect(calls).toBe(2);
  });

  it('reloads the history when "Reintentar" is clicked', async () => {
    let calls = 0;
    await render(() => (++calls === 1 ? throwError(() => new Error('500')) : of(usedBenefits)));

    const retry = Array.from(element.querySelectorAll('button')).find((button) =>
      button.textContent?.includes('Reintentar'),
    );
    expect(retry).toBeDefined();
    retry!.click();
    TestBed.flushEffects();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(calls).toBe(2);
    expect(element.querySelector('[role="alert"]')).toBeNull();
    expect(element.querySelectorAll('app-used-benefit-item').length).toBe(2);
  });
});
