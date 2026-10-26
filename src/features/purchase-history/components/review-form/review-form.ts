import { Component, computed, input, output, signal } from '@angular/core';
import { FormField, form, max, maxLength, min, required } from '@angular/forms/signals';
import { Icon } from '../../../../shared/components/icon/icon';
import { ReviewFormData } from '../../model/purchase.model';

@Component({
  selector: 'app-review-form',
  imports: [FormField, Icon],
  templateUrl: './review-form.html',
  host: { class: 'block' },
})
export class ReviewForm {
  readonly cafeName = input.required<string>();
  readonly isSubmitting = input(false);
  readonly errorMessage = input<string | null>(null);

  readonly submitted = output<ReviewFormData>();
  readonly cancelled = output<void>();

  stars = [1, 2, 3, 4, 5];
  ratingLabels = ['Malo', 'Regular', 'Bueno', 'Muy bueno', 'Excelente'];
  maxMessageLength = 500;

  reviewModel = signal<ReviewFormData>({ rating: 0, message: '' });
  attemptedSubmit = signal(false);

  reviewForm = form(this.reviewModel, (review) => {
    min(review.rating, 1, { message: 'Elegí una calificación de 1 a 5 estrellas.' });
    max(review.rating, 5, { message: 'Elegí una calificación de 1 a 5 estrellas.' });
    required(review.message, { message: 'Escribí un comentario sobre tu experiencia.' });
    maxLength(review.message, this.maxMessageLength, {
      message: `El comentario no puede superar los ${this.maxMessageLength} caracteres.`,
    });
  });

  ratingLabel = computed(() => this.ratingLabels[this.reviewModel().rating - 1] ?? '');

  messageLength = computed(() => this.reviewModel().message.length);

  ratingError = computed(() => this.reviewForm.rating().errors()[0]?.message ?? null);

  messageError = computed(() => this.reviewForm.message().errors()[0]?.message ?? null);

  setRating(star: number): void {
    this.reviewModel.update((review) => ({ ...review, rating: star }));
  }

  onSubmit(event: Event): void {
    event.preventDefault();
    this.attemptedSubmit.set(true);

    if (this.reviewForm().invalid() || this.isSubmitting()) {
      return;
    }

    this.submitted.emit({
      rating: this.reviewModel().rating,
      message: this.reviewModel().message.trim(),
    });
  }
}
