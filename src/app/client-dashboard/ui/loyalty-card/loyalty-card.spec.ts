import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoyaltyStatus } from '../../domain/client-dashboard.model';
import { calculateLoyaltyProgress } from '../../domain/loyalty-progress';
import { LoyaltyCard } from './loyalty-card';

describe('LoyaltyCard', () => {
  const silver: LoyaltyStatus = {
    tier: 'silver',
    availablePoints: 850,
    lifetimePoints: 1420,
    nextTier: 'gold',
    nextTierThreshold: 3000,
  };
  let fixture: ComponentFixture<LoyaltyCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoyaltyCard],
    }).compileComponents();
    fixture = TestBed.createComponent(LoyaltyCard);
  });

  async function render(loyalty: LoyaltyStatus): Promise<HTMLElement> {
    fixture.componentRef.setInput('loyalty', loyalty);
    fixture.componentRef.setInput('progress', calculateLoyaltyProgress(loyalty));
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  const text = (element: Element) => element.textContent?.replace(/\s+/g, ' ').trim() ?? '';

  it('renders the tier, the points balance and the progress towards the next tier', async () => {
    const host = await render(silver);
    const content = text(host);

    expect(content).toContain('Nivel PLATA');
    expect(content).toContain('850 pts disponibles');
    expect(content).toContain('1,420 pts acumulados en total');
    expect(content).toContain('Próximo nivel: ORO');
    expect(content).toContain('1,420 / 3,000 pts');
    expect(content).toContain('47.3% completado');
    expect(content).toContain('Faltan 1,580 pts para ORO');
  });

  it('exposes the progress as an accessible progress bar', async () => {
    const host = await render(silver);
    const progressbar = host.querySelector('[role="progressbar"]');

    expect(progressbar?.getAttribute('aria-valuenow')).toBe('47.3');
    expect(progressbar?.getAttribute('aria-valuemin')).toBe('0');
    expect(progressbar?.getAttribute('aria-valuemax')).toBe('100');
    expect(progressbar?.getAttribute('aria-label')).toBe('Progreso hacia el nivel ORO');
  });

  it('shows the maximum tier message instead of the progress bar', async () => {
    const host = await render({
      ...silver,
      tier: 'diamond',
      nextTier: null,
      nextTierThreshold: null,
    });

    expect(text(host)).toContain('Nivel máximo alcanzado');
    expect(host.querySelector('[role="progressbar"]')).toBeNull();
  });

  it('emits when the client wants to scan a QR or view the membership card', async () => {
    const host = await render(silver);
    const scanQr = vi.fn();
    const viewCard = vi.fn();
    fixture.componentInstance.scanQr.subscribe(scanQr);
    fixture.componentInstance.viewCard.subscribe(viewCard);
    const [scanButton, cardButton] = Array.from(host.querySelectorAll('button'));

    scanButton.click();
    cardButton.click();

    expect(text(scanButton)).toBe('Escanear QR');
    expect(text(cardButton)).toBe('Ver mi carnet');
    expect(scanQr).toHaveBeenCalledTimes(1);
    expect(viewCard).toHaveBeenCalledTimes(1);
  });
});
