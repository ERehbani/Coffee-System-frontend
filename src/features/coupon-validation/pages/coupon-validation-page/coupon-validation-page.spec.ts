import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, Subject } from 'rxjs';
import { QrScanner, SCAN_INTERVAL_MS } from '../../components/qr-scanner/qr-scanner';
import { CameraAccess } from '../../services/camera-access';
import { CouponValidationRepository } from '../../services/coupon-validation.repository';
import { QrFrameReader } from '../../services/qr-frame-reader';
import { ValidatedCoupon } from '../../types/coupon-validation.model';
import { CameraError } from '../../utils/camera-failure';
import { CouponValidationPage } from './coupon-validation-page';

const coupon: ValidatedCoupon = {
  id: 'redemption-1',
  code: 'code-1',
  benefitName: '15% off en tu pedido',
  description: null,
  conditions: [],
  benefitType: 'CODIGO_DESCUENTO',
  discountPercentage: 15,
  productName: null,
  productPrice: null,
  usedAt: null,
};

describe('CouponValidationPage', () => {
  let element: HTMLElement;
  let validate: ReturnType<typeof vi.fn>;
  let start: ReturnType<typeof vi.fn>;
  let stopSession: ReturnType<typeof vi.fn>;
  let read: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval'] });
    validate = vi.fn().mockReturnValue(of(coupon));
    stopSession = vi.fn();
    start = vi.fn().mockResolvedValue({ stop: stopSession });
    read = vi.fn().mockReturnValue(null);
    TestBed.configureTestingModule({
      imports: [CouponValidationPage],
      providers: [
        provideRouter([]),
        { provide: CouponValidationRepository, useValue: { validate } },
        { provide: CameraAccess, useValue: { start } },
      ],
    });
    TestBed.overrideComponent(QrScanner, {
      set: { providers: [{ provide: QrFrameReader, useValue: { read } }] },
    });
  });

  afterEach(() => vi.useRealTimers());

  async function render(): Promise<ComponentFixture<CouponValidationPage>> {
    const fixture = TestBed.createComponent(CouponValidationPage);
    element = fixture.nativeElement;
    await settle(fixture);
    return fixture;
  }

  async function settle(fixture: ComponentFixture<CouponValidationPage>): Promise<void> {
    fixture.detectChanges();
    await fixture.whenStable();
    await new Promise((resolve) => setTimeout(resolve));
    fixture.detectChanges();
    await fixture.whenStable();
  }

  const button = (text: string) =>
    Array.from(element.querySelectorAll('button')).find((item) => item.textContent?.includes(text));
  const codeInput = () => element.querySelector<HTMLInputElement>('#validation-code')!;
  const result = () => element.querySelector('[data-outcome]');
  const nextFrame = () => vi.advanceTimersByTime(SCAN_INTERVAL_MS);

  async function click(fixture: ComponentFixture<CouponValidationPage>, text: string) {
    button(text)?.click();
    await settle(fixture);
  }

  async function typeAndSubmit(fixture: ComponentFixture<CouponValidationPage>, code: string) {
    codeInput().value = code;
    codeInput().dispatchEvent(new Event('input'));
    await settle(fixture);
    await click(fixture, 'Validar código');
  }

  it('links back to the cafe panel and lets the cafe log out', async () => {
    await render();

    const back = Array.from(element.querySelectorAll('a')).find((link) =>
      link.textContent?.includes('Panel del comercio'),
    );
    expect(element.querySelector('h1')?.textContent?.trim()).toBe('Validar cupones');
    expect(back?.getAttribute('href')).toBe('/cafe/profile');
    expect(element.querySelector('app-logout-button')).not.toBeNull();
  });

  it('warns that validating a coupon uses it up', async () => {
    await render();

    expect(element.textContent).toContain('Validar un cupón lo marca como usado');
  });

  it('validates a typed code and shows the result', async () => {
    const fixture = await render();

    await typeAndSubmit(fixture, ' code-1 ');

    expect(validate).toHaveBeenCalledExactlyOnceWith('code-1');
    expect(result()?.getAttribute('data-outcome')).toBe('valid');
    expect(element.textContent).toContain('15% de descuento');
    expect(codeInput().disabled).toBe(true);
  });

  it('shows the validation in progress and blocks a second one', async () => {
    validate.mockReturnValue(new Subject<ValidatedCoupon>());
    const fixture = await render();

    await typeAndSubmit(fixture, 'code-1');
    await click(fixture, 'Validar código');

    expect(element.querySelector('[role="status"]')?.textContent).toContain('Validando cupón...');
    expect(codeInput().disabled).toBe(true);
    expect(validate).toHaveBeenCalledOnce();
  });

  it('validates a scanned code once, turns the camera off and waits for the cafe', async () => {
    const fixture = await render();
    await click(fixture, 'Activar cámara');
    read.mockReturnValue('code-1');

    nextFrame();
    await settle(fixture);
    nextFrame();
    nextFrame();

    expect(validate).toHaveBeenCalledExactlyOnceWith('code-1');
    expect(result()?.getAttribute('data-outcome')).toBe('valid');
    expect(stopSession).toHaveBeenCalledOnce();
    expect(read).toHaveBeenCalledOnce();
    expect(element.textContent).toContain('Escaneo en pausa');
  });

  it('scans the next coupon only when the cafe asks for it', async () => {
    const fixture = await render();
    await click(fixture, 'Activar cámara');
    read.mockReturnValueOnce('code-1').mockReturnValue(null);
    nextFrame();
    await settle(fixture);

    await click(fixture, 'Validar otro cupón');

    expect(result()).toBeNull();
    expect(start).toHaveBeenCalledTimes(2);
    expect(codeInput().disabled).toBe(false);
    expect(element.textContent).toContain('Buscando un código QR...');
  });

  it('keeps the manual code working when the camera is not available', async () => {
    start.mockRejectedValue(new CameraError('denied'));
    const fixture = await render();
    await click(fixture, 'Activar cámara');

    expect(element.querySelector('[role="alert"]')?.textContent).toContain(
      'No tenemos permiso para usar la cámara.',
    );

    await typeAndSubmit(fixture, 'code-1');

    expect(validate).toHaveBeenCalledExactlyOnceWith('code-1');
    expect(result()?.getAttribute('data-outcome')).toBe('valid');
  });

  it('turns the camera off when the cafe leaves the page', async () => {
    const fixture = await render();
    await click(fixture, 'Activar cámara');

    fixture.destroy();
    nextFrame();

    expect(stopSession).toHaveBeenCalledOnce();
    expect(read).not.toHaveBeenCalled();
  });

  it('opens without the result of a previous visit', async () => {
    const firstVisit = await render();
    await typeAndSubmit(firstVisit, 'code-1');
    firstVisit.destroy();

    await render();

    expect(result()).toBeNull();
    expect(codeInput().disabled).toBe(false);
  });
});
