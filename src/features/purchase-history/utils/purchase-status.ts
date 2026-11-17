import { Purchase, PurchaseStatus } from '../model/purchase.model';

const CANCELLATIONS: readonly PurchaseStatus[] = ['CANCELLED', 'REFUNDED'];

export function isCancellation(status: PurchaseStatus): boolean {
  return CANCELLATIONS.includes(status);
}

export function canBeReviewed(purchase: Purchase): boolean {
  return !isCancellation(purchase.status) && !purchase.reviewed;
}
