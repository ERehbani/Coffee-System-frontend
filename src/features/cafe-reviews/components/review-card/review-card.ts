import { DatePipe } from '@angular/common';
import { Component, input } from '@angular/core';
import { Icon } from '../../../../shared/components/icon/icon';
import { CafeReview } from '../../types/cafe-review.model';

@Component({
  selector: 'app-review-card',
  imports: [DatePipe, Icon],
  templateUrl: './review-card.html',
  host: { class: 'block' },
})
export class ReviewCard {
  readonly review = input.required<CafeReview>();

  protected readonly stars = [1, 2, 3, 4, 5];
}
