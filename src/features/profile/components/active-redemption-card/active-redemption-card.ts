import {
  Component,
  computed,
  DestroyRef,
  DOCUMENT,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { Icon } from '../../../../shared/components/icon/icon';
import { ActiveRedemptionView } from '../../services/profile.store';
import { toExpiryLabel } from '../../utils/redemption-expiry';

type CopyState = 'idle' | 'copied' | 'failed';

const COPY_FEEDBACK_MS = 3000;

@Component({
  imports: [Icon],
  selector: 'app-active-redemption-card',
  templateUrl: './active-redemption-card.html',
  host: { class: 'block' },
})
export class ActiveRedemptionCard {
  private readonly document = inject(DOCUMENT);
  private feedbackTimer: ReturnType<typeof setTimeout> | undefined;

  readonly redemption = input.required<ActiveRedemptionView>();
  readonly showQr = output<string>();

  protected readonly copyState = signal<CopyState>('idle');
  protected readonly titleId = computed(() => `redemption-${this.redemption().id}`);
  protected readonly expiryLabel = computed(() => toExpiryLabel(this.redemption().daysUntilExpiry));
  protected readonly copyMessage = computed(() => {
    switch (this.copyState()) {
      case 'copied':
        return 'Código copiado';
      case 'failed':
        return 'No se pudo copiar el código';
      default:
        return '';
    }
  });

  constructor() {
    inject(DestroyRef).onDestroy(() => clearTimeout(this.feedbackTimer));
  }

  protected async copyCode(): Promise<void> {
    const clipboard = this.document.defaultView?.navigator.clipboard;
    if (!clipboard) {
      this.showCopyFeedback('failed');
      return;
    }
    try {
      await clipboard.writeText(this.redemption().code);
      this.showCopyFeedback('copied');
    } catch {
      this.showCopyFeedback('failed');
    }
  }

  private showCopyFeedback(state: CopyState): void {
    this.copyState.set(state);
    clearTimeout(this.feedbackTimer);
    this.feedbackTimer = setTimeout(() => this.copyState.set('idle'), COPY_FEEDBACK_MS);
  }
}
