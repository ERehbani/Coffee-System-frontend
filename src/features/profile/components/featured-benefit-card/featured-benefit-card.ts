import { DecimalPipe, NgOptimizedImage } from '@angular/common';
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
import { RouterLink } from '@angular/router';
import { Icon } from '../../../../shared/components/icon/icon';
import { FeaturedBenefit } from '../../types/profile.model';

export type FeaturedBenefitPhase = 'idle' | 'confirming' | 'redeeming';

@Component({
  imports: [DecimalPipe, NgOptimizedImage, RouterLink, Icon],
  selector: 'app-featured-benefit-card',
  templateUrl: './featured-benefit-card.html',
  host: { class: 'block' },
})
export class FeaturedBenefitCard {
  private readonly injector = inject(Injector);

  readonly benefit = input.required<FeaturedBenefit>();
  readonly availablePoints = input.required<number>();
  readonly phase = input<FeaturedBenefitPhase>('idle');
  /** Otro beneficio se está canjeando: se espera a que termine antes de pedir uno nuevo. */
  readonly locked = input(false);
  readonly redeem = output<string>();
  readonly redeemConfirmed = output<void>();
  readonly redeemCancelled = output<void>();

  private readonly redeemButton = viewChild<ElementRef<HTMLButtonElement>>('redeemButton');
  private readonly confirmButton = viewChild<ElementRef<HTMLButtonElement>>('confirmButton');

  constructor() {
    afterRenderEffect(() => {
      if (this.phase() === 'confirming') {
        this.confirmButton()?.nativeElement.focus();
      }
    });
  }

  protected readonly missingPoints = computed(() =>
    Math.max(this.benefit().pointsCost - this.availablePoints(), 0),
  );
  protected readonly canRedeem = computed(() => this.missingPoints() === 0);
  protected readonly confirmId = computed(() => `benefit-confirm-${this.benefit().id}`);

  protected cancel(): void {
    this.redeemCancelled.emit();
    afterNextRender(() => this.redeemButton()?.nativeElement.focus(), { injector: this.injector });
  }
}
