import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, computed, input, output } from '@angular/core';
import { Icon } from '../../../../shared/components/icon/icon';
import { Order } from '../../model/order.model';

@Component({
  selector: 'app-order-card',
  imports: [CurrencyPipe, DatePipe, Icon],
  templateUrl: './order-card.html',
  styleUrl: './order-card.css',
  host: { class: 'block' },
})
export class OrderCard {
  readonly order = input.required<Order>();
  readonly isTaking = input(false);
  readonly take = output<Order>();

  readonly orderCode = computed(() => this.order().externalId.slice(0, 8).toUpperCase());
  readonly clientName = computed(() => this.order().clientName ?? 'Cliente sin nombre');
  readonly isIncoming = computed(() => this.order().status === 'CONFIRMED');
  readonly totalItems = computed(() =>
    this.order().details.reduce((total, item) => total + item.amount, 0),
  );

  onTake(): void {
    this.take.emit(this.order());
  }
}
