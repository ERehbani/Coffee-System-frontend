import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, DestroyRef, afterNextRender, computed, inject, output, signal } from '@angular/core';
import { Observable, catchError, interval, map, of, startWith, switchMap, tap } from 'rxjs';
import { Icon } from '../../../../shared/components/icon/icon';
import { backendErrorMessage } from '../../../../shared/utils/backend-error';
import { Purchase, PurchaseStatus } from '../../../purchase-history/model/purchase.model';
import { PurchaseService } from '../../../purchase-history/services/purchase.service';
import { OPEN_ORDER_STATUSES, isCancellation } from '../../../purchase-history/utils/purchase-status';

interface OrderColumn {
  readonly status: PurchaseStatus;
  readonly title: string;
  readonly empty: string;
  readonly next: PurchaseStatus;
  readonly action: string;
}

const COLUMNS: readonly OrderColumn[] = [
  { status: 'CONFIRMED', title: 'Nuevos', empty: 'No hay pedidos nuevos.', next: 'IN_PREPARATION', action: 'Aceptar' },
  {
    status: 'IN_PREPARATION',
    title: 'En preparación',
    empty: 'No hay pedidos en preparación.',
    next: 'READY',
    action: 'Marcar como listo',
  },
  {
    status: 'READY',
    title: 'Listos para retirar',
    empty: 'No hay pedidos esperando retiro.',
    next: 'DELIVERED',
    action: 'Entregado',
  },
];

export const ORDERS_REFRESH_MS = 20_000;

@Component({
  selector: 'app-orders-board',
  imports: [CurrencyPipe, DatePipe, Icon],
  templateUrl: './orders-board.html',
  host: { class: 'block' },
})
export class OrdersBoard {
  private readonly purchaseService = inject(PurchaseService);
  private readonly destroyRef = inject(DestroyRef);

  readonly changed = output<void>();

  protected readonly columns = COLUMNS;
  protected readonly orders = signal<Purchase[]>([]);
  protected readonly status = signal<'loading' | 'ready' | 'error'>('loading');
  protected readonly busyId = signal<string | null>(null);
  protected readonly confirmingCancelId = signal<string | null>(null);
  protected readonly actionError = signal<string | null>(null);
  protected readonly now = signal(Date.now());

  protected readonly ordersByStatus = computed(() => {
    const grouped: Partial<Record<PurchaseStatus, Purchase[]>> = {};
    const byDate = [...this.orders()].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    for (const order of byDate) {
      (grouped[order.status] ??= []).push(order);
    }
    return grouped;
  });

  protected readonly openCount = computed(() => this.orders().length);

  constructor() {
    afterNextRender(() => {
      const polling = interval(ORDERS_REFRESH_MS)
        .pipe(
          startWith(0),
          switchMap(() => this.fetch()),
        )
        .subscribe();
      this.destroyRef.onDestroy(() => polling.unsubscribe());
    });
  }

  refresh(): void {
    this.fetch().subscribe();
  }

  protected minutesAgo(order: Purchase): number {
    return Math.max(0, Math.floor((this.now() - new Date(order.date).getTime()) / 60_000));
  }

  protected advance(order: Purchase, next: PurchaseStatus): void {
    this.busyId.set(order.externalId);
    this.actionError.set(null);
    this.purchaseService.updateStatus(order.externalId, next).subscribe({
      next: (updated) => {
        const stillOpen = OPEN_ORDER_STATUSES.includes(updated.status);
        this.orders.update((list) =>
          stillOpen
            ? list.map((item) => (item.externalId === updated.externalId ? updated : item))
            : list.filter((item) => item.externalId !== updated.externalId),
        );
        this.busyId.set(null);
        this.confirmingCancelId.set(null);
        if (isCancellation(updated.status) || !stillOpen) {
          this.changed.emit();
        }
      },
      error: (error) => {
        this.actionError.set(backendErrorMessage(error) ?? 'No pudimos actualizar el pedido. Probá de nuevo.');
        this.busyId.set(null);
        this.refresh();
      },
    });
  }

  protected askToCancel(order: Purchase): void {
    this.actionError.set(null);
    this.confirmingCancelId.set(order.externalId);
  }

  protected keepOrder(): void {
    this.confirmingCancelId.set(null);
  }

  private fetch(): Observable<void> {
    return this.purchaseService.getOpenOrders().pipe(
      tap((orders) => {
        this.orders.set(orders);
        this.now.set(Date.now());
        this.status.set('ready');
      }),
      map(() => undefined),
      catchError(() => {
        if (this.status() !== 'ready') {
          this.status.set('error');
        }
        return of(undefined);
      }),
    );
  }
}
