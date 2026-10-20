import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, computed, input, output } from '@angular/core';
import { Icon } from '../../../../shared/components/icon/icon';
import { CreateReviewInput, Order } from '../../types/order.model';
import { canReview, MAX_RATING, ORDER_STATUS_LABELS } from '../../utils/order-review';
import { ReviewForm } from '../review-form/review-form';

@Component({
  selector: 'app-order-card',
  imports: [CurrencyPipe, DatePipe, Icon, ReviewForm],
  templateUrl: './order-card.html',
  host: { class: 'block' },
})
export class OrderCard {
  readonly order = input.required<Order>();
  readonly isReviewing = input(false);
  readonly isSubmitting = input(false);
  readonly reviewError = input<string | null>(null);

  readonly reviewRequested = output<void>();
  readonly reviewCancelled = output<void>();
  readonly reviewSubmitted = output<CreateReviewInput>();

  protected readonly stars = Array.from({ length: MAX_RATING }, (_, index) => index + 1);
  protected readonly canReview = computed(() => canReview(this.order()));
  protected readonly statusLabel = computed(() => ORDER_STATUS_LABELS[this.order().status]);
}
