import { Purchase, PurchaseStatus } from '../model/purchase.model';

const CANCELLATIONS: readonly PurchaseStatus[] = ['CANCELLED', 'REFUNDED'];

/** Mirrors the backend: a cancelled or refunded purchase is no longer a valid sale. */
export function isCancellation(status: PurchaseStatus): boolean {
  return CANCELLATIONS.includes(status);
}

/** The backend accepts one review per purchase in any status but a cancellation. */
export function canBeReviewed(purchase: Purchase): boolean {
  return !isCancellation(purchase.status) && !purchase.reviewed;
}
