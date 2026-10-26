import { registerLocaleData } from '@angular/common';
import localeEsAr from '@angular/common/locales/es-AR';
import { LOCALE_ID } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TierBenefitView } from '../../services/tier.store';
import { TierBenefitItem } from './tier-benefit-item';

registerLocaleData(localeEsAr);

const benefit: TierBenefitView = {
  id: 'benefit-coffee',
  name: 'Café de cortesía',
  description: 'Un café de filtro a elección',
  pointsCost: 300,
  expiresAt: new Date(2026, 11, 31),
  cafeName: 'Cafe Central',
  tier: 'bronze',
  missingPoints: 0,
  phase: 'idle',
  locked: false,
  errorMessage: null,
};

describe('TierBenefitItem', () => {
  let fixture: ComponentFixture<TierBenefitItem>;
  let element: HTMLElement;
  let requested: string[];
  let confirmations: number;
  let cancellations: number;

  async function render(overrides: Partial<TierBenefitView> = {}) {
    await TestBed.configureTestingModule({
      imports: [TierBenefitItem],
      providers: [{ provide: LOCALE_ID, useValue: 'es-AR' }],
    }).compileComponents();

    fixture = TestBed.createComponent(TierBenefitItem);
    requested = [];
    confirmations = 0;
    cancellations = 0;
    fixture.componentInstance.redeemRequested.subscribe((id) => requested.push(id));
    fixture.componentInstance.redeemConfirmed.subscribe(() => confirmations++);
    fixture.componentInstance.redeemCancelled.subscribe(() => cancellations++);
    await update(overrides);
    element = fixture.nativeElement;
  }

  async function update(overrides: Partial<TierBenefitView>) {
    fixture.componentRef.setInput('benefit', { ...benefit, ...overrides });
    fixture.detectChanges();
    await fixture.whenStable();
  }

  const buttonByText = (text: string) =>
    Array.from(element.querySelectorAll('button')).find((button) =>
      button.textContent?.includes(text),
    );

  it('shows the name, description, cafe, cost and expiry date', async () => {
    await render();

    expect(element.querySelector('h3')?.textContent?.trim()).toBe('Café de cortesía');
    expect(element.textContent).toContain('Un café de filtro a elección');
    expect(element.textContent).toContain('Cafe Central');
    expect(element.querySelector('[data-testid="benefit-cost"]')?.textContent?.trim()).toBe(
      '300 pts',
    );
    expect(element.querySelector('time')?.getAttribute('datetime')).toBe('2026-12-31');
    expect(element.querySelector('time')?.textContent).toContain('31');
    expect(element.querySelector('time')?.textContent).toContain('2026');
  });

  it('formats a cost over a thousand points with the es-AR separators', async () => {
    await render({ pointsCost: 12000 });

    expect(element.querySelector('[data-testid="benefit-cost"]')?.textContent?.trim()).toBe(
      '12.000 pts',
    );
  });

  it('says it is valid in every cafe when the benefit has no cafe', async () => {
    await render({ cafeName: null });

    expect(element.textContent).toContain('Todas las cafeterías');
  });

  it('hides the expiry when the benefit never ends', async () => {
    await render({ expiresAt: null });

    expect(element.querySelector('time')).toBeNull();
  });

  describe('idle', () => {
    it('offers an enabled "Activar" button that requests the benefit', async () => {
      await render();

      const activate = buttonByText('Activar')!;
      expect(activate.disabled).toBe(false);
      expect(element.textContent).not.toContain('Te faltan');

      activate.click();

      expect(requested).toEqual(['benefit-coffee']);
    });

    it('names the benefit in the accessible label of the button', async () => {
      await render();

      expect(buttonByText('Activar')!.getAttribute('aria-label')).toBe('Activar Café de cortesía');
    });
  });

  describe('insufficient points', () => {
    it('disables the button and says how many points are missing', async () => {
      await render({ pointsCost: 1200, missingPoints: 350 });

      const activate = buttonByText('Activar')!;
      expect(activate.disabled).toBe(true);
      expect(element.textContent).toContain('Te faltan 350 pts');

      activate.click();
      expect(requested).toEqual([]);
    });

    it('links the button to the missing points message', async () => {
      await render({ missingPoints: 350 });

      const describedBy = buttonByText('Activar')!.getAttribute('aria-describedby');
      expect(describedBy).toBeTruthy();
      expect(element.querySelector(`#${describedBy}`)?.textContent).toContain('Te faltan 350 pts');
    });
  });

  it('disables the button while another benefit is being redeemed', async () => {
    await render({ locked: true });

    expect(buttonByText('Activar')!.disabled).toBe(true);
  });

  describe('confirm step', () => {
    it('asks for confirmation with the cost instead of the "Activar" button', async () => {
      await render({ phase: 'confirming' });

      expect(element.querySelector('[role="group"]')?.textContent).toContain(
        '¿Canjear Café de cortesía por 300 pts?',
      );
      expect(buttonByText('Activar')).toBeUndefined();
      expect(buttonByText('Confirmar')).toBeDefined();
      expect(buttonByText('Cancelar')).toBeDefined();
    });

    it('moves the focus to "Confirmar" when the step opens', async () => {
      await render();
      await update({ phase: 'confirming' });

      expect(document.activeElement).toBe(buttonByText('Confirmar'));
    });

    it('emits the confirmation', async () => {
      await render({ phase: 'confirming' });

      buttonByText('Confirmar')!.click();

      expect(confirmations).toBe(1);
      expect(cancellations).toBe(0);
    });

    it('emits the cancellation and gives the focus back to "Activar"', async () => {
      await render();
      await update({ phase: 'confirming' });

      buttonByText('Cancelar')!.click();
      await update({ phase: 'idle' });

      expect(cancellations).toBe(1);
      expect(confirmations).toBe(0);
      expect(document.activeElement).toBe(buttonByText('Activar'));
    });
  });

  it('disables the button and shows the progress while redeeming', async () => {
    await render({ phase: 'redeeming' });

    const progress = buttonByText('Canjeando')!;
    expect(progress.disabled).toBe(true);
    expect(progress.getAttribute('aria-busy')).toBe('true');
    expect(buttonByText('Confirmar')).toBeUndefined();
  });

  describe('error', () => {
    it('announces the error politely and focuses "Activar" so the client can try again', async () => {
      await render();
      await update({ errorMessage: 'No pudimos canjear este beneficio.' });

      const message = element.querySelector('[aria-live="polite"]');
      expect(message?.textContent).toContain('No pudimos canjear este beneficio.');
      expect(document.activeElement).toBe(buttonByText('Activar'));
    });

    it('keeps the polite live region present even without an error', async () => {
      await render();

      expect(element.querySelector('[aria-live="polite"]')).not.toBeNull();
      expect(element.querySelector('[aria-live="polite"]')?.textContent?.trim()).toBe('');
    });
  });
});
