import { computed, inject, Injectable, signal } from '@angular/core';
import { map, Subscription, switchMap } from 'rxjs';
import { CartService } from '../../cart/services/cart.service';
import { CheckoutSummary, ConfirmedOrder, ServerCart } from '../types/checkout.model';
import {
  ApplicableCoupon,
  CheckoutCoupon,
  CouponPreview,
  CouponsStatus,
} from '../types/coupon.model';
import { matchesServerCart } from '../utils/cart-match';
import { CartMismatchError, toCheckoutErrorMessage } from '../utils/checkout-error';
import { toCheckoutSummary } from '../utils/checkout.mapper';
import { toCouponPreview } from '../utils/coupon-discount';
import { findApplicableCoupons } from '../utils/coupon-eligibility';
import { CheckoutRepository } from './checkout.repository';

export type CheckoutStatus = 'idle' | 'confirming' | 'confirmed';

function toMatchingCartId(summary: CheckoutSummary, cart: ServerCart): string {
  if (!matchesServerCart(summary, cart)) {
    throw new CartMismatchError();
  }
  return cart.id;
}

@Injectable()
export class CheckoutStore {
  private readonly repository = inject(CheckoutRepository);
  private readonly cart = inject(CartService);
  private couponsRequest: Subscription | null = null;

  readonly status = signal<CheckoutStatus>('idle');
  readonly errorMessage = signal<string | null>(null);
  readonly confirmedOrder = signal<ConfirmedOrder | null>(null);

  readonly couponsStatus = signal<CouponsStatus>('loading');
  private readonly coupons = signal<readonly CheckoutCoupon[]>([]);
  private readonly couponsLoadedAt = signal(new Date());
  private readonly selectedCouponId = signal<string | null>(null);

  readonly summary = computed<CheckoutSummary | null>(() =>
    toCheckoutSummary(this.cart.cafe(), this.cart.items()),
  );

  readonly applicableCoupons = computed<readonly ApplicableCoupon[]>(() => {
    const summary = this.summary();
    return summary
      ? findApplicableCoupons(this.coupons(), summary.cafeId, this.couponsLoadedAt())
      : [];
  });

  readonly selectedCoupon = computed<ApplicableCoupon | null>(
    () => this.applicableCoupons().find((coupon) => coupon.id === this.selectedCouponId()) ?? null,
  );

  readonly couponPreview = computed<CouponPreview | null>(() => {
    const summary = this.summary();
    const coupon = this.selectedCoupon();
    return summary && coupon ? toCouponPreview(coupon, summary) : null;
  });

  readonly isConfirming = computed(() => this.status() === 'confirming');

  readonly canConfirm = computed(() => this.summary() !== null && this.status() === 'idle');

  startCheckout(): void {
    this.status.set('idle');
    this.errorMessage.set(null);
    this.selectedCouponId.set(null);
    this.loadCoupons();
  }

  selectCoupon(couponId: string | null): void {
    this.selectedCouponId.set(couponId);
    this.errorMessage.set(null);
  }

  confirm(onSuccess: () => void, validationCode?: string): void {
    const summary = this.summary();
    if (!summary || this.status() !== 'idle') {
      return;
    }

    const couponCode = validationCode ?? this.selectedCoupon()?.validationCode;
    this.status.set('confirming');
    this.errorMessage.set(null);

    this.repository
      .findCart(summary.cafeId)
      .pipe(
        map((cart) => toMatchingCartId(summary, cart)),
        switchMap((cartId) =>
          this.repository.createPurchase({ cartId, validationCode: couponCode }),
        ),
      )
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

  private loadCoupons(): void {
    this.couponsRequest?.unsubscribe();
    if (!this.summary()) {
      return;
    }

    this.couponsStatus.set('loading');
    this.couponsRequest = this.repository.findCoupons().subscribe({
      next: (coupons) => {
        this.coupons.set(coupons);
        this.couponsLoadedAt.set(new Date());
        this.couponsStatus.set('ready');
      },
      error: () => {
        this.coupons.set([]);
        this.couponsStatus.set('failed');
      },
    });
  }

  private completeOrder(order: ConfirmedOrder): void {
    this.confirmedOrder.set(order);
    this.selectedCouponId.set(null);
    this.cart.clearLocal();
    this.status.set('confirmed');
  }
}
