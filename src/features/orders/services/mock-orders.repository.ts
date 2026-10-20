import { Service } from '@angular/core';
import { defer, delay, map, Observable, of, throwError } from 'rxjs';
import { PurchaseDto, ReviewDto } from '../types/order.dto';
import { CreateReviewInput, Order, OrderReview } from '../types/order.model';
import { buildPurchaseHistoryFixture } from '../utils/order.fixture';
import { toOrderReview, toOrders } from '../utils/order.mapper';
import { OrdersRepository } from './orders.repository';

const MOCK_LATENCY_MS = 400;

@Service({ autoProvided: false })
export class MockOrdersRepository implements OrdersRepository {
  private purchases: PurchaseDto[] = buildPurchaseHistoryFixture(new Date());

  getOrders(): Observable<readonly Order[]> {
    return defer(() => of(this.purchases)).pipe(delay(MOCK_LATENCY_MS), map(toOrders));
  }

  createReview(order: Order, input: CreateReviewInput): Observable<OrderReview> {
    return defer(() => {
      const purchase = this.purchases.find((candidate) => candidate.externalId === order.id);
      if (!purchase || purchase.status !== 'CONFIRMED' || purchase.review) {
        return throwError(() => new Error('This purchase cannot be reviewed'));
      }

      const review: ReviewDto = {
        externalId: `review-${order.id}`,
        rating: input.rating,
        message: input.comment,
        date: new Date().toISOString(),
      };
      this.purchases = this.purchases.map((candidate) =>
        candidate === purchase ? { ...candidate, review } : candidate,
      );
      return of(review);
    }).pipe(delay(MOCK_LATENCY_MS), map(toOrderReview));
  }
}
