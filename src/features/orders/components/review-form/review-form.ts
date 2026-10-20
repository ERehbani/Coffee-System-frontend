import { Component, computed, input, output, signal } from '@angular/core';
import { Icon } from '../../../../shared/components/icon/icon';
import { CreateReviewInput } from '../../types/order.model';
import { MAX_COMMENT_LENGTH, MAX_RATING, MIN_RATING } from '../../utils/order-review';

const RATING_LABELS = ['Malo', 'Regular', 'Bueno', 'Muy bueno', 'Excelente'] as const;

@Component({
  selector: 'app-review-form',
  imports: [Icon],
  templateUrl: './review-form.html',
  host: { class: 'block' },
})
export class ReviewForm {
  readonly orderId = input.required<string>();
  readonly cafeName = input.required<string>();
  readonly isSubmitting = input(false);
  readonly errorMessage = input<string | null>(null);

  readonly submitted = output<CreateReviewInput>();
  readonly cancelled = output<void>();

  readonly rating = signal(0);
  readonly comment = signal('');
  readonly attemptedSubmit = signal(false);

  protected readonly stars = Array.from({ length: MAX_RATING }, (_, index) => index + 1);
  protected readonly maxCommentLength = MAX_COMMENT_LENGTH;
  protected readonly commentId = computed(() => `review-comment-${this.orderId()}`);
  protected readonly ratingLabel = computed(() => RATING_LABELS[this.rating() - 1] ?? null);

  readonly ratingError = computed(() =>
    this.rating() < MIN_RATING ? 'Elige una calificación de 1 a 5 estrellas.' : null,
  );

  onSubmit(event: Event): void {
    event.preventDefault();
    this.attemptedSubmit.set(true);
    if (this.ratingError() || this.isSubmitting()) {
      return;
    }
    this.submitted.emit({
      rating: this.rating(),
      comment: this.comment().trim().slice(0, MAX_COMMENT_LENGTH),
    });
  }
}
