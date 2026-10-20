import { Observable } from 'rxjs';
import { CreateReviewInput, Order, OrderReview } from '../types/order.model';

export abstract class OrdersRepository {
  abstract getOrders(): Observable<readonly Order[]>;
  abstract createReview(order: Order, input: CreateReviewInput): Observable<OrderReview>;
}
