import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CameraAccess, CameraSession } from '../../services/camera-access';
import { QrFrameReader } from '../../services/qr-frame-reader';
import { CameraError } from '../../utils/camera-failure';
import { QrScanner, SCAN_INTERVAL_MS } from './qr-scanner';

describe('QrScanner', () => {
  let fixture: ComponentFixture<QrScanner>;
  let element: HTMLElement;
  let start: ReturnType<typeof vi.fn>;
  let stopSession: ReturnType<typeof vi.fn<() => void>>;
  let read: ReturnType<typeof vi.fn>;
  let scans: string[];

  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval'] });
    stopSession = vi.fn<() => void>();
    start = vi.fn().mockResolvedValue({ stop: stopSession });
    read = vi.fn().mockReturnValue(null);
  });

  afterEach(() => vi.useRealTimers());

  async function render(enabled = true): Promise<void> {
    TestBed.configureTestingModule({
      imports: [QrScanner],
      providers: [{ provide: CameraAccess, useValue: { start } }],
    });
    TestBed.overrideComponent(QrScanner, {
      set: { providers: [{ provide: QrFrameReader, useValue: { read } }] },
    });
    fixture = TestBed.createComponent(QrScanner);
    fixture.componentRef.setInput('enabled', enabled);
    scans = [];
    fixture.componentInstance.scanned.subscribe((code) => scans.push(code));
    element = fixture.nativeElement;
    await settle();
  }

  const flushPromises = () => new Promise((resolve) => setTimeout(resolve));

  async function settle(): Promise<void> {
    fixture.detectChanges();
    await fixture.whenStable();
    await flushPromises();
    fixture.detectChanges();
    await fixture.whenStable();
  }

  const button = (text: string) =>
    Array.from(element.querySelectorAll('button')).find((item) => item.textContent?.includes(text));

  async function click(text: string): Promise<void> {
    button(text)?.click();
    await settle();
  }

  async function setEnabled(enabled: boolean): Promise<void> {
    fixture.componentRef.setInput('enabled', enabled);
    await settle();
  }

  const nextFrame = () => vi.advanceTimersByTime(SCAN_INTERVAL_MS);
  const video = () => element.querySelector('video');

  it('waits for the cafe to turn the camera on', async () => {
    await render();

    expect(start).not.toHaveBeenCalled();
    expect(button('Activar cámara')).toBeDefined();
    expect(element.textContent).toContain('Encendé la cámara para leer el QR del cupón.');
  });

  it('starts the camera on its video and looks for a QR', async () => {
    await render();

    await click('Activar cámara');

    expect(start).toHaveBeenCalledExactlyOnceWith(video());
    expect(element.textContent).toContain('Buscando un código QR...');
    expect(button('Apagar cámara')).toBeDefined();
  });

  it('shows that the camera is starting until it is ready', async () => {
    start.mockReturnValue(new Promise<CameraSession>(() => undefined));
    await render();

    await click('Activar cámara');

    expect(element.textContent).toContain('Encendiendo la cámara...');
  });

  it('emits the decoded code once and stops reading frames', async () => {
    await render();
    await click('Activar cámara');
    read.mockReturnValueOnce(null).mockReturnValue('code-1');

    nextFrame();
    expect(scans).toEqual([]);

    nextFrame();
    nextFrame();
    nextFrame();

    expect(scans).toEqual(['code-1']);
    expect(read).toHaveBeenCalledTimes(2);
    expect(read).toHaveBeenCalledWith(video());
  });

  it('turns the camera off and stops scanning while it is disabled', async () => {
    await render();
    await click('Activar cámara');

    await setEnabled(false);
    nextFrame();

    expect(stopSession).toHaveBeenCalledOnce();
    expect(read).not.toHaveBeenCalled();
    expect(element.textContent).toContain('Escaneo en pausa');
  });

  it('turns the camera back on when it is enabled again', async () => {
    await render();
    await click('Activar cámara');
    await setEnabled(false);

    await setEnabled(true);

    expect(start).toHaveBeenCalledTimes(2);
    expect(element.textContent).toContain('Buscando un código QR...');
  });

  it('does not start the camera while it is disabled', async () => {
    await render(false);

    await click('Activar cámara');

    expect(start).not.toHaveBeenCalled();
    expect(element.textContent).toContain('Escaneo en pausa');
  });

  it('turns the camera off with its button', async () => {
    await render();
    await click('Activar cámara');

    await click('Apagar cámara');
    nextFrame();

    expect(stopSession).toHaveBeenCalledOnce();
    expect(read).not.toHaveBeenCalled();
    expect(button('Activar cámara')).toBeDefined();
  });

  it('turns the camera off and stops scanning when it is destroyed', async () => {
    await render();
    await click('Activar cámara');

    fixture.destroy();
    nextFrame();

    expect(stopSession).toHaveBeenCalledOnce();
    expect(read).not.toHaveBeenCalled();
  });

  it('stops a camera that finishes starting after scanning was disabled', async () => {
    let resolveStart: (session: CameraSession) => void = () => undefined;
    start.mockReturnValue(new Promise<CameraSession>((resolve) => (resolveStart = resolve)));
    await render();
    await click('Activar cámara');

    await setEnabled(false);
    resolveStart({ stop: stopSession });
    await settle();
    nextFrame();

    expect(stopSession).toHaveBeenCalledOnce();
    expect(read).not.toHaveBeenCalled();
  });

  it('stops a camera that finishes starting after the scanner was destroyed', async () => {
    let resolveStart: (session: CameraSession) => void = () => undefined;
    start.mockReturnValue(new Promise<CameraSession>((resolve) => (resolveStart = resolve)));
    await render();
    await click('Activar cámara');

    fixture.destroy();
    resolveStart({ stop: stopSession });
    await flushPromises();

    expect(stopSession).toHaveBeenCalledOnce();
  });

  it('waits for a pending start before starting the camera again', async () => {
    const pendingStarts: ((session: CameraSession) => void)[] = [];
    start.mockImplementation(
      () => new Promise<CameraSession>((resolve) => pendingStarts.push(resolve)),
    );
    const stopFirstSession = vi.fn<() => void>();
    await render();
    await click('Activar cámara');
    await setEnabled(false);
    await setEnabled(true);

    expect(start).toHaveBeenCalledOnce();

    pendingStarts[0]({ stop: stopFirstSession });
    await settle();

    expect(stopFirstSession).toHaveBeenCalledOnce();
    expect(start).toHaveBeenCalledTimes(2);

    pendingStarts[1]({ stop: stopSession });
    await settle();

    expect(stopSession).not.toHaveBeenCalled();
    expect(element.textContent).toContain('Buscando un código QR...');
  });

  it('explains a denied permission and lets the cafe try again', async () => {
    start.mockRejectedValueOnce(new CameraError('denied'));
    await render();

    await click('Activar cámara');

    const alert = element.querySelector('[role="alert"]');
    expect(alert?.textContent).toContain('No tenemos permiso para usar la cámara.');
    expect(alert?.textContent).toContain('podés escribir el código a mano');

    await click('Reintentar');

    expect(start).toHaveBeenCalledTimes(2);
    expect(element.querySelector('[role="alert"]')).toBeNull();
    expect(element.textContent).toContain('Buscando un código QR...');
  });

  it('explains a missing camera', async () => {
    start.mockRejectedValue(new CameraError('not-found'));
    await render();

    await click('Activar cámara');

    expect(element.querySelector('[role="alert"]')?.textContent).toContain(
      'No encontramos ninguna cámara en este dispositivo.',
    );
  });

  it('does not offer a retry when the page is not secure', async () => {
    start.mockRejectedValue(new CameraError('insecure'));
    await render();

    await click('Activar cámara');

    expect(element.querySelector('[role="alert"]')?.textContent).toContain('https');
    expect(button('Reintentar')).toBeUndefined();
  });

  it('explains an unexpected camera error', async () => {
    start.mockRejectedValue(new Error('boom'));
    await render();

    await click('Activar cámara');

    expect(element.querySelector('[role="alert"]')?.textContent).toContain(
      'No pudimos encender la cámara.',
    );
  });
});
