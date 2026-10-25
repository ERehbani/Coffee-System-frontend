import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Icon } from '../../../../shared/components/icon/icon';
import { Purchase, ReviewFormData } from '../../model/order.model';
import { OrderService } from '../../services/order.service';
import { OrderCard } from '../order-card/order-card';

@Component({
  selector: 'app-order-history',
  imports: [RouterLink, Icon, OrderCard],
  templateUrl: './order-history.html',
  host: { class: 'block' },
})
export class OrderHistory implements OnInit {
  private orderService = inject(OrderService);

  orders = signal<Purchase[]>([]);
  isLoading = signal(true);
  hasError = signal(false);
  reviewingOrderId = signal<string | null>(null);
  isSubmitting = signal(false);
  reviewError = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  sortedOrders = computed(() => {
    return [...this.orders()].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  });

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.isLoading.set(true);
    this.hasError.set(false);

    this.orderService.getMyOrders().subscribe({
      next: (data) => {
        this.orders.set(data);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('error loading orders:', error);
        this.hasError.set(true);
        this.isLoading.set(false);
      },
    });
  }

  openReview(orderId: string): void {
    this.reviewingOrderId.set(orderId);
    this.reviewError.set(null);
    this.successMessage.set(null);
  }

  closeReview(): void {
    this.reviewingOrderId.set(null);
    this.reviewError.set(null);
  }

  submitReview(order: Purchase, data: ReviewFormData): void {
    this.isSubmitting.set(true);
    this.reviewError.set(null);

    this.orderService
      .createReview({
        cafeId: order.cafeId,
        purchaseId: order.externalId,
        rating: data.rating,
        message: data.message,
      })
      .subscribe({
        next: () => {
          this.orders.update((list) =>
            list.map((o) => (o.externalId === order.externalId ? { ...o, reviewed: true } : o))
          );
          this.isSubmitting.set(false);
          this.reviewingOrderId.set(null);
          this.successMessage.set(`¡Gracias! Tu reseña de ${order.cafeName} fue enviada.`);
        },
        error: (error) => {
          console.error('error sending review:', error);
          this.isSubmitting.set(false);
          this.reviewError.set('No pudimos enviar tu reseña. Intentá de nuevo.');
        },
      });
  }

  dismissSuccess(): void {
    this.successMessage.set(null);
  }
}
