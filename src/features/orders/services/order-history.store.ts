import { computed, inject, Service, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { CreateReviewInput, Order, OrderReview } from '../types/order.model';
import { canReview } from '../utils/order-review';
import { OrdersRepository } from './orders.repository';

export type OrderHistoryStatus = 'loading' | 'error' | 'ready';

@Service({ autoProvided: false })
export class OrderHistoryStore {
  private readonly repository = inject(OrdersRepository);
  private readonly resource = rxResource({ stream: () => this.repository.getOrders() });

  /** Reviews sent during this session, applied on top of the loaded orders. */
  private readonly sentReviews = signal<ReadonlyMap<string, OrderReview>>(new Map());

  readonly reviewingOrderId = signal<string | null>(null);
  readonly submittingOrderId = signal<string | null>(null);
  readonly reviewError = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);

  readonly orders = computed<readonly Order[]>(() => {
    const orders = this.resource.hasValue() ? this.resource.value() : [];
    const sent = this.sentReviews();
    return orders
      .map((order) => {
        const review = sent.get(order.id);
        return review ? { ...order, review } : order;
      })
      .sort((a, b) => b.placedAt.getTime() - a.placedAt.getTime());
  });

  readonly status = computed<OrderHistoryStatus>(() => {
    if (this.resource.isLoading() && !this.resource.hasValue()) {
      return 'loading';
    }
    if (this.resource.error()) {
      return 'error';
    }
    return this.resource.hasValue() ? 'ready' : 'loading';
  });

  openReview(orderId: string): void {
    const order = this.findOrder(orderId);
    if (!order || !canReview(order)) {
      return;
    }
    this.reviewingOrderId.set(orderId);
    this.reviewError.set(null);
    this.successMessage.set(null);
  }

  closeReview(): void {
    if (this.submittingOrderId()) {
      return;
    }
    this.reviewingOrderId.set(null);
    this.reviewError.set(null);
  }

  submitReview(orderId: string, input: CreateReviewInput): void {
    const order = this.findOrder(orderId);
    if (!order || !canReview(order) || this.submittingOrderId()) {
      return;
    }

    this.submittingOrderId.set(orderId);
    this.reviewError.set(null);

    this.repository.createReview(order, input).subscribe({
      next: (review) => {
        this.sentReviews.update((sent) => new Map(sent).set(orderId, review));
        this.submittingOrderId.set(null);
        this.reviewingOrderId.set(null);
        this.successMessage.set(`¡Gracias! Tu reseña de ${order.cafe.name} fue enviada.`);
      },
      error: () => {
        this.submittingOrderId.set(null);
        this.reviewError.set('No pudimos enviar tu reseña. Inténtalo de nuevo.');
      },
    });
  }

  dismissSuccess(): void {
    this.successMessage.set(null);
  }

  reload(): void {
    this.resource.reload();
  }

  private findOrder(orderId: string): Order | undefined {
    return this.orders().find((order) => order.id === orderId);
  }
}
