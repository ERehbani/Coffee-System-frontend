import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, computed, input, output } from '@angular/core';
import { Purchase, ReviewFormData } from '../../model/purchase.model';
import {
  isCancelledPurchase,
  purchaseStatusBadgeClass,
  purchaseStatusLabel,
} from '../../utils/purchase-status';
import { ReviewForm } from '../review-form/review-form';

@Component({
  selector: 'app-purchase-card',
  imports: [CurrencyPipe, DatePipe, ReviewForm],
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

  statusLabel = computed(() => purchaseStatusLabel(this.purchase().status));
  statusClass = computed(() => purchaseStatusBadgeClass(this.purchase().status));
  isCancelled = computed(() => isCancelledPurchase(this.purchase().status));

  canReview = computed(() => !this.isCancelled() && !this.purchase().reviewed);
}
