import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ReviewResponseDto } from '../types/cafe-review.dto';
import { CafeReview } from '../types/cafe-review.model';
import { toCafeReviews } from '../utils/cafe-review.mapper';

@Injectable({ providedIn: 'root' })
export class CafeReviewService {
  private readonly http = inject(HttpClient);
  private readonly reviewsUrl = `${environment.apiBaseUrl}/reviews/cafe`;

  listByCafe(cafeId: string): Observable<CafeReview[]> {
    return this.http.get<ReviewResponseDto[]>(`${this.reviewsUrl}/${cafeId}`).pipe(map(toCafeReviews));
  }
}
