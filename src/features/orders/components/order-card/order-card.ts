import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, computed, input, output } from '@angular/core';
import { Icon } from '../../../../shared/components/icon/icon';
import { Purchase, ReviewFormData } from '../../model/order.model';
import { ReviewForm } from '../review-form/review-form';

@Component({
  selector: 'app-order-card',
  imports: [CurrencyPipe, DatePipe, Icon, ReviewForm],
  templateUrl: './order-card.html',
  host: { class: 'block' },
})
export class OrderCard {
  readonly order = input.required<Purchase>();
  readonly isReviewing = input(false);
  readonly isSubmitting = input(false);
  readonly reviewError = input<string | null>(null);

  readonly reviewRequested = output<void>();
  readonly reviewCancelled = output<void>();
  readonly reviewSubmitted = output<ReviewFormData>();

  isCompleted = computed(() => this.order().status === 'CONFIRMED');

  canReview = computed(() => this.isCompleted() && !this.order().reviewed);

  statusLabel = computed(() => {
    switch (this.order().status) {
      case 'CONFIRMED':
        return 'Completado';
      case 'CANCELLED':
        return 'Cancelado';
      case 'REFUNDED':
        return 'Reembolsado';
    }
  });
}
