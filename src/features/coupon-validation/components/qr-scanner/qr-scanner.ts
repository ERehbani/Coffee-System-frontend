import {
  afterRenderEffect,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { Icon } from '../../../../shared/components/icon/icon';
import { CameraAccess, CameraSession } from '../../services/camera-access';
import { QrFrameReader } from '../../services/qr-frame-reader';
import {
  CameraFailure,
  cameraFailureMessage,
  canRetryCamera,
  toCameraFailure,
} from '../../utils/camera-failure';

export const SCAN_INTERVAL_MS = 200;

type ScannerView = 'idle' | 'starting' | 'scanning' | 'paused' | 'failed';

@Component({
  selector: 'app-qr-scanner',
  imports: [Icon],
  templateUrl: './qr-scanner.html',
  providers: [QrFrameReader],
  host: { class: 'block' },
})
export class QrScanner {
  private readonly camera = inject(CameraAccess);
  private readonly frameReader = inject(QrFrameReader);
  private readonly video = viewChild.required<ElementRef<HTMLVideoElement>>('video');

  readonly enabled = input(true);
  readonly scanned = output<string>();

  private readonly wantsCamera = signal(false);
  private readonly isStreaming = signal(false);
  private readonly failure = signal<CameraFailure | null>(null);
  private readonly shouldScan = computed(() => this.enabled() && this.wantsCamera());

  protected readonly view = computed<ScannerView>(() => {
    if (this.failure()) {
      return 'failed';
    }
    if (!this.wantsCamera()) {
      return 'idle';
    }
    if (!this.enabled()) {
      return 'paused';
    }
    return this.isStreaming() ? 'scanning' : 'starting';
  });
  protected readonly failureMessage = computed(() => {
    const failure = this.failure();
    return failure ? cameraFailureMessage(failure) : '';
  });
  protected readonly canRetry = computed(() => {
    const failure = this.failure();
    return failure !== null && canRetryCamera(failure);
  });

  private attempt = 0;
  private lastStart: Promise<void> = Promise.resolve();
  private session: CameraSession | null = null;
  private scanLoop: ReturnType<typeof setInterval> | undefined;

  constructor() {
    afterRenderEffect(() => {
      if (this.shouldScan()) {
        this.open();
      } else {
        this.close();
      }
    });
    inject(DestroyRef).onDestroy(() => this.close());
  }

  protected turnOn(): void {
    this.failure.set(null);
    this.wantsCamera.set(true);
  }

  protected turnOff(): void {
    this.wantsCamera.set(false);
  }

  private open(): void {
    const attempt = ++this.attempt;
    this.lastStart = this.lastStart.then(() => this.startCamera(attempt));
  }

  private async startCamera(attempt: number): Promise<void> {
    if (attempt !== this.attempt) {
      return;
    }
    try {
      const session = await this.camera.start(this.video().nativeElement);
      if (attempt !== this.attempt) {
        session.stop();
        return;
      }
      this.session = session;
      this.isStreaming.set(true);
      this.scanLoop = setInterval(() => this.scanFrame(), SCAN_INTERVAL_MS);
    } catch (error) {
      if (attempt === this.attempt) {
        this.fail(error);
      }
    }
  }

  private scanFrame(): void {
    const code = this.frameReader.read(this.video().nativeElement);
    if (code) {
      this.stopScanLoop();
      this.scanned.emit(code);
    }
  }

  private fail(error: unknown): void {
    this.failure.set(toCameraFailure(error));
    this.wantsCamera.set(false);
  }

  private close(): void {
    this.attempt++;
    this.stopScanLoop();
    this.session?.stop();
    this.session = null;
    this.isStreaming.set(false);
  }

  private stopScanLoop(): void {
    clearInterval(this.scanLoop);
    this.scanLoop = undefined;
  }
}
