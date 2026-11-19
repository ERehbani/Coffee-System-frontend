import { Purchase, PurchaseStatus } from '../model/purchase.model';

const CANCELLATIONS: readonly PurchaseStatus[] = ['CANCELLED', 'REFUNDED'];

export const OPEN_ORDER_STATUSES: readonly PurchaseStatus[] = ['CONFIRMED', 'IN_PREPARATION', 'READY'];

export function isCancellation(status: PurchaseStatus): boolean {
  return CANCELLATIONS.includes(status);
}

export function canBeRefunded(status: PurchaseStatus): boolean {
  return !isCancellation(status);
}

export function canBeReviewed(purchase: Purchase): boolean {
  return !isCancellation(purchase.status) && !purchase.reviewed;
}
