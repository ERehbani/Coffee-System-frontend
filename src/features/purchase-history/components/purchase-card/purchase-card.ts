import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, computed, input, output } from '@angular/core';
import { Icon } from '../../../../shared/components/icon/icon';
import { Purchase, ReviewFormData } from '../../model/purchase.model';
import { ReviewForm } from '../review-form/review-form';

@Component({
  selector: 'app-purchase-card',
  imports: [CurrencyPipe, DatePipe, Icon, ReviewForm],
  templateUrl: './purchase-card.html',
  host: { class: 'block' },
})
export class PurchaseCard {
  readonly purchase = input.required<Purchase>();
  readonly isReviewing = input(false);
  readonly isSubmitting = input(false);
  readonly reviewError = input<string | null>(null);

  readonly reviewRequested = output<void>();
  readonly reviewCancelled = output<void>();
  readonly reviewSubmitted = output<ReviewFormData>();

  earnedPoints = computed(() => {
    return this.purchase().details.reduce((total, detail) => total + detail.generatedPoints, 0);
  });

  canReview = computed(() => this.purchase().status === 'CONFIRMED' && !this.purchase().reviewed);
}
