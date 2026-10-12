import { DecimalPipe, NgOptimizedImage } from '@angular/common';
import { Component, computed, input } from '@angular/core';
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

  protected readonly distanceLabel = computed(() => {
    const meters = this.cafe().distanceMeters;
    if (meters === null) {
      return null;
    }
    return meters < 1000 ? `A ${Math.round(meters)}m` : `A ${(meters / 1000).toFixed(1)}km`;
  });

  protected readonly reviewsLabel = computed(() => {
    const count = this.cafe().reviewCount;
    return count === 1 ? '1 reseña' : `${count} reseñas`;
  });
}
