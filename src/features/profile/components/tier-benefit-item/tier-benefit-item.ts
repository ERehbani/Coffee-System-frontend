import { DatePipe, DecimalPipe } from '@angular/common';
import {
  afterNextRender,
  afterRenderEffect,
  Component,
  computed,
  ElementRef,
  inject,
  Injector,
  input,
  output,
  viewChild,
} from '@angular/core';
import { Icon } from '../../../../shared/components/icon/icon';
import { TierBenefitView } from '../../services/tier.store';

@Component({
  imports: [DatePipe, DecimalPipe, Icon],
  selector: 'app-tier-benefit-item',
  templateUrl: './tier-benefit-item.html',
  host: { class: 'block' },
})
export class TierBenefitItem {
  private readonly injector = inject(Injector);

  readonly benefit = input.required<TierBenefitView>();
  /** Emits the benefit id when the client asks to activate it. */
  readonly redeemRequested = output<string>();
  readonly redeemConfirmed = output<void>();
  readonly redeemCancelled = output<void>();

  private readonly activateButton = viewChild<ElementRef<HTMLButtonElement>>('activateButton');
  private readonly confirmButton = viewChild<ElementRef<HTMLButtonElement>>('confirmButton');

  protected readonly titleId = computed(() => `tier-benefit-${this.benefit().id}`);
  protected readonly confirmId = computed(() => `tier-benefit-confirm-${this.benefit().id}`);
  protected readonly missingId = computed(() => `tier-benefit-missing-${this.benefit().id}`);
  protected readonly isActivationBlocked = computed(() => {
    const { missingPoints, locked } = this.benefit();
    return missingPoints > 0 || locked;
  });

  constructor() {
    // The confirm step replaces the "Activar" button, so the focus follows it.
    afterRenderEffect(() => {
      if (this.benefit().phase === 'confirming') {
        this.confirmButton()?.nativeElement.focus();
      }
    });
    // A failed redemption leaves the client on the same benefit, ready to try again.
    afterRenderEffect(() => {
      if (this.benefit().errorMessage) {
        this.activateButton()?.nativeElement.focus();
      }
    });
  }

  protected cancel(): void {
    this.redeemCancelled.emit();
    afterNextRender(() => this.activateButton()?.nativeElement.focus(), {
      injector: this.injector,
    });
  }
}
