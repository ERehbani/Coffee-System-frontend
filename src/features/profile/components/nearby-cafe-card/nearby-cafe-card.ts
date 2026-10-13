import { DecimalPipe, NgOptimizedImage, formatNumber } from '@angular/common';
import { Component, LOCALE_ID, computed, inject, input } from '@angular/core';
import { Icon } from '../../../../shared/components/icon/icon';
import { NearbyCafe } from '../../types/profile.model';

@Component({
  imports: [DecimalPipe, NgOptimizedImage, Icon],
  selector: 'app-nearby-cafe-card',
  templateUrl: './nearby-cafe-card.html',
  host: { class: 'block' },
})
export class NearbyCafeCard {
  readonly cafe = input.required<NearbyCafe>();

  private readonly locale = inject(LOCALE_ID);

  protected readonly distanceLabel = computed(() => {
    const meters = this.cafe().distanceMeters;
    if (meters === null) {
      return null;
    }
    return meters < 1000
      ? `A ${formatNumber(meters, this.locale, '1.0-0')} m`
      : `A ${formatNumber(meters / 1000, this.locale, '1.0-1')} km`;
  });

  protected readonly reviewsLabel = computed(() => {
    const count = this.cafe().reviewCount;
    return count === 1 ? '1 reseña' : `${formatNumber(count, this.locale)} reseñas`;
  });
}
