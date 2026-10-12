import { Component, output } from '@angular/core';
import { Icon } from '../../../../shared/components/icon/icon';
import { IconName } from '../../../../shared/components/icon/icon-registry';

export type QuickActionId = 'redeem-points' | 'order-in-store' | 'my-coupons' | 'write-review';

interface QuickAction {
  readonly id: QuickActionId;
  readonly label: string;
  readonly icon: IconName;
}

@Component({
  imports: [Icon],
  selector: 'app-quick-actions',
  templateUrl: './quick-actions.html',
  host: { class: 'block' },
})
export class QuickActions {
  readonly actionSelected = output<QuickActionId>();

  protected readonly actions: readonly QuickAction[] = [
    { id: 'redeem-points', label: 'Canjear puntos', icon: 'gift' },
    { id: 'order-in-store', label: 'Pedir en cafetería', icon: 'cup' },
    { id: 'my-coupons', label: 'Mis cupones', icon: 'ticket' },
    { id: 'write-review', label: 'Dejar reseña', icon: 'message-square-text' },
  ];
}
