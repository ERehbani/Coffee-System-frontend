import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActiveRedemptionView } from '../../application/client-dashboard.store';
import { ActiveRedemptionCard } from './active-redemption-card';

describe('ActiveRedemptionCard', () => {
  const welcomeDiscount: ActiveRedemptionView = {
    id: 'redemption-001',
    title: 'Descuento 15% bienvenida',
    description: 'Válido en cualquier sucursal adherida',
    code: 'VLD-8492-C0FF',
    expiresAt: new Date(2026, 9, 17),
    daysUntilExpiry: 5,
  };
  let fixture: ComponentFixture<ActiveRedemptionCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActiveRedemptionCard],
    }).compileComponents();
    fixture = TestBed.createComponent(ActiveRedemptionCard);
  });

  async function render(redemption: ActiveRedemptionView): Promise<HTMLElement> {
    fixture.componentRef.setInput('redemption', redemption);
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  const text = (element: Element) => element.textContent?.replace(/\s+/g, ' ').trim() ?? '';
  const buttonByName = (host: HTMLElement, name: string) =>
    host.querySelector<HTMLButtonElement>(`button[aria-label="${name}"]`);

  it('shows the redemption status, title, code and expiry', async () => {
    const host = await render(welcomeDiscount);

    expect(text(host)).toContain('Listo para canje');
    expect(host.querySelector('h3')?.textContent).toContain('Descuento 15% bienvenida');
    expect(host.querySelector('code')?.textContent?.trim()).toBe('VLD-8492-C0FF');
    expect(text(host)).toContain('Expira en 5 días');
  });

  it.each([
    [0, 'Expira hoy'],
    [1, 'Expira en 1 día'],
  ])('words an expiry of %i days as "%s"', async (daysUntilExpiry, label) => {
    const host = await render({ ...welcomeDiscount, daysUntilExpiry });

    expect(text(host)).toContain(label);
  });

  it('emits the redemption id when the QR code is requested', async () => {
    const host = await render(welcomeDiscount);
    const showQr = vi.fn();
    fixture.componentInstance.showQr.subscribe(showQr);

    buttonByName(host, 'Mostrar código QR')?.click();

    expect(showQr).toHaveBeenCalledWith('redemption-001');
  });

  describe('copying the code', () => {
    afterEach(() => {
      Reflect.deleteProperty(navigator, 'clipboard');
    });

    it('writes the code to the clipboard and announces it', async () => {
      const writeText = vi.fn().mockResolvedValue(undefined);
      Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
      const host = await render(welcomeDiscount);

      buttonByName(host, 'Copiar código')?.click();

      expect(writeText).toHaveBeenCalledWith('VLD-8492-C0FF');
      const liveRegion = host.querySelector('[aria-live="polite"]');
      await vi.waitFor(() => expect(liveRegion?.textContent).toContain('Código copiado'));
    });

    it('announces a failure when the clipboard is unavailable', async () => {
      const host = await render(welcomeDiscount);

      buttonByName(host, 'Copiar código')?.click();

      const liveRegion = host.querySelector('[aria-live="polite"]');
      await vi.waitFor(() =>
        expect(liveRegion?.textContent).toContain('No se pudo copiar el código'),
      );
    });
  });
});
