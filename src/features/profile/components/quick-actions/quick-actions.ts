import { Component, output } from '@angular/core';

export type QuickActionId = 'redeem-points' | 'order-in-store' | 'my-coupons' | 'write-review';

interface QuickAction {
  readonly id: QuickActionId;
  readonly label: string;
}

@Component({
  imports: [],
  selector: 'app-quick-actions',
  templateUrl: './quick-actions.html',
  host: { class: 'block' },
})
export class QuickActions {
  readonly actionSelected = output<QuickActionId>();

  protected readonly actions: readonly QuickAction[] = [
    { id: 'redeem-points', label: 'Canjear puntos' },
    { id: 'order-in-store', label: 'Hacer un pedido' },
    { id: 'my-coupons', label: 'Mis cupones' },
    { id: 'write-review', label: 'Mis compras y reseñas' },
  ];
}
