import { DecimalPipe, NgOptimizedImage } from '@angular/common';
import { Component, computed, input, output } from '@angular/core';
import { Icon } from '../../../../shared/components/icon/icon';
import { FeaturedBenefit } from '../../types/profile.model';

@Component({
  imports: [DecimalPipe, NgOptimizedImage, Icon],
  selector: 'app-featured-benefit-card',
  templateUrl: './featured-benefit-card.html',
  host: { class: 'block h-full' },
})
export class FeaturedBenefitCard {
  readonly benefit = input.required<FeaturedBenefit>();
  readonly availablePoints = input.required<number>();
  readonly redeem = output<string>();

  protected readonly missingPoints = computed(() =>
    Math.max(this.benefit().pointsCost - this.availablePoints(), 0),
  );
  protected readonly canRedeem = computed(() => this.missingPoints() === 0);
  protected readonly hintId = computed(() => `benefit-hint-${this.benefit().id}`);
}
