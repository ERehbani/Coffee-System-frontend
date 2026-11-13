import { computed, inject, Injectable, signal } from '@angular/core';
import { switchMap } from 'rxjs';
import { CartService } from '../../cart/services/cart.service';
import { CheckoutSummary, ConfirmedOrder } from '../types/checkout.model';
import { toCheckoutErrorMessage } from '../utils/checkout-error';
import { toCheckoutSummary } from '../utils/checkout.mapper';
import { CheckoutRepository } from './checkout.repository';

export type CheckoutStatus = 'idle' | 'confirming' | 'confirmed';

@Injectable()
export class CheckoutStore {
  private readonly repository = inject(CheckoutRepository);
  private readonly cart = inject(CartService);

  readonly status = signal<CheckoutStatus>('idle');
  readonly errorMessage = signal<string | null>(null);
  readonly confirmedOrder = signal<ConfirmedOrder | null>(null);

  readonly summary = computed<CheckoutSummary | null>(() =>
    toCheckoutSummary(this.cart.cafe(), this.cart.items()),
  );

  readonly isConfirming = computed(() => this.status() === 'confirming');

  readonly canConfirm = computed(() => this.summary() !== null && this.status() === 'idle');

  startCheckout(): void {
    this.status.set('idle');
    this.errorMessage.set(null);
  }

  confirm(onSuccess: () => void, validationCode?: string): void {
    const summary = this.summary();
    if (!summary || this.status() !== 'idle') {
      return;
    }

    this.status.set('confirming');
    this.errorMessage.set(null);

    this.repository
      .findCartId(summary.cafeId)
      .pipe(switchMap((cartId) => this.repository.createPurchase({ cartId, validationCode })))
      .subscribe({
        next: (order) => {
          this.completeOrder(order);
          onSuccess();
        },
        error: (error: unknown) => {
          this.status.set('idle');
          this.errorMessage.set(toCheckoutErrorMessage(error));
        },
      });
  }

  private completeOrder(order: ConfirmedOrder): void {
    this.confirmedOrder.set(order);
    this.cart.clearLocal();
    this.status.set('confirmed');
  }
}
