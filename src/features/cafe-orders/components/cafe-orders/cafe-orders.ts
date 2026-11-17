import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { Icon } from '../../../../shared/components/icon/icon';
import { Order } from '../../model/order.model';
import { OrderService } from '../../services/order.service';
import { OrderCard } from '../order-card/order-card';

const REFRESH_INTERVAL_MS = 30000;

@Component({
  selector: 'app-cafe-orders',
  imports: [Icon, OrderCard],
  templateUrl: './cafe-orders.html',
  styleUrl: './cafe-orders.css',
  host: { class: 'block' },
})
export class CafeOrders implements OnInit, OnDestroy {
  private readonly orderService = inject(OrderService);
  private refreshTimer: ReturnType<typeof setInterval> | undefined;

  orders = signal<Order[]>([]);
  isLoading = signal(true);
  hasError = signal(false);
  filterState = signal<'incoming' | 'preparing'>('incoming');
  takingOrderId = signal<string | null>(null);
  actionMessage = signal('');

  sortedOrders = computed(() => {
    return [...this.orders()].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );
  });

  incomingOrders = computed(() => {
    return this.sortedOrders().filter((order) => order.status === 'CONFIRMED');
  });

  preparingOrders = computed(() => {
    return this.sortedOrders().filter((order) => order.status === 'IN_PREPARATION');
  });

  visibleOrders = computed(() => {
    return this.filterState() === 'incoming' ? this.incomingOrders() : this.preparingOrders();
  });

  ngOnInit(): void {
    this.loadOrders();
    this.refreshTimer = setInterval(() => this.refreshOrders(), REFRESH_INTERVAL_MS);
  }

  ngOnDestroy(): void {
    clearInterval(this.refreshTimer);
  }

  loadOrders(): void {
    this.isLoading.set(true);
    this.hasError.set(false);

    this.orderService.getActiveOrders().subscribe({
      next: (page) => {
        this.orders.set(page.content);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('error loading orders:', error);
        this.hasError.set(true);
        this.isLoading.set(false);
      },
    });
  }

  refreshOrders(): void {
    this.orderService.getActiveOrders().subscribe({
      next: (page) => {
        this.orders.set(page.content);
        this.hasError.set(false);
      },
      error: (error) => {
        console.error('error refreshing orders:', error);
      },
    });
  }

  takeOrder(order: Order): void {
    this.takingOrderId.set(order.externalId);
    this.actionMessage.set('');

    this.orderService.takeOrder(order.externalId).subscribe({
      next: (updatedOrder) => {
        this.orders.update((list) =>
          list.map((item) => (item.externalId === updatedOrder.externalId ? updatedOrder : item)),
        );
        this.takingOrderId.set(null);
      },
      error: (error: HttpErrorResponse) => {
        if (error.status === 409) {
          this.actionMessage.set('Este pedido ya fue tomado o cancelado.');
          this.refreshOrders();
        } else {
          this.actionMessage.set('No pudimos tomar el pedido. Intentalo de nuevo.');
        }
        this.takingOrderId.set(null);
      },
    });
  }

  setFilterState(state: 'incoming' | 'preparing'): void {
    this.filterState.set(state);
  }

  clearActionMessage(): void {
    this.actionMessage.set('');
  }
}
