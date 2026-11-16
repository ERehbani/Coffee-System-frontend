import { DecimalPipe, formatNumber } from '@angular/common';
import { Component, LOCALE_ID, OnInit, computed, inject, signal } from '@angular/core';
import { switchMap } from 'rxjs';
import { Icon } from '../../../../shared/components/icon/icon';
import { ProductService } from '../../../catalog/services/product.service';
import { ReviewCard } from '../../components/review-card/review-card';
import { CafeReviewService } from '../../services/cafe-review.service';
import { CafeReview } from '../../types/cafe-review.model';

@Component({
  selector: 'app-cafe-reviews-page',
  imports: [DecimalPipe, Icon, ReviewCard],
  templateUrl: './cafe-reviews-page.html',
  host: { class: 'block' },
})
export class CafeReviewsPage implements OnInit {
  private readonly productService = inject(ProductService);
  private readonly reviewService = inject(CafeReviewService);
  private readonly locale = inject(LOCALE_ID);

  readonly reviews = signal<CafeReview[]>([]);
  readonly status = signal<'loading' | 'ready' | 'error'>('loading');

  readonly averageRating = computed(() => {
    const list = this.reviews();
    return list.length ? list.reduce((sum, review) => sum + review.rating, 0) / list.length : 0;
  });

  readonly countLabel = computed(() => {
    const count = this.reviews().length;
    return count === 1 ? '1 reseña' : `${formatNumber(count, this.locale)} reseñas`;
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.status.set('loading');
    this.productService
      .getMyCafeId()
      .pipe(switchMap((cafeId) => this.reviewService.listByCafe(cafeId)))
      .subscribe({
        next: (reviews) => {
          this.reviews.set(reviews);
          this.status.set('ready');
        },
        error: () => this.status.set('error'),
      });
  }
}
