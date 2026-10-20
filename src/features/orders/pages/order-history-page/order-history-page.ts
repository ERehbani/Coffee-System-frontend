import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Icon } from '../../../../shared/components/icon/icon';
import { OrderCard } from '../../components/order-card/order-card';
import { OrderHistoryStore } from '../../services/order-history.store';

@Component({
  imports: [RouterLink, Icon, OrderCard],
  selector: 'app-order-history-page',
  templateUrl: './order-history-page.html',
  host: { class: 'block' },
})
export class OrderHistoryPage {
  protected readonly store = inject(OrderHistoryStore);
}
