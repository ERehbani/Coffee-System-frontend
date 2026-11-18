export type PurchaseStatus = 'CONFIRMED' | 'IN_PREPARATION' | 'READY' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED';

export const OPEN_ORDER_STATUSES: readonly PurchaseStatus[] = ['CONFIRMED', 'IN_PREPARATION', 'READY'];

const LABELS: Record<PurchaseStatus, string> = {
  CONFIRMED: 'Recibido',
  IN_PREPARATION: 'En preparación',
  READY: 'Listo para retirar',
  DELIVERED: 'Entregado',
  CANCELLED: 'Cancelado',
  REFUNDED: 'Reembolsado',
};

const BADGE_CLASSES: Record<PurchaseStatus, string> = {
  CONFIRMED: 'bg-blue-50 text-blue-800',
  IN_PREPARATION: 'bg-amber-50 text-amber-800',
  READY: 'bg-emerald-50 text-emerald-800',
  DELIVERED: 'bg-border text-muted',
  CANCELLED: 'bg-rose-50 text-rose-800',
  REFUNDED: 'bg-purple-50 text-purple-800',
};

function known(status: string | null | undefined): status is PurchaseStatus {
  return !!status && status in LABELS;
}

export function purchaseStatusLabel(status: string | null | undefined): string {
  return known(status) ? LABELS[status] : (status ?? 'Desconocido');
}

export function purchaseStatusBadgeClass(status: string | null | undefined): string {
  return known(status) ? BADGE_CLASSES[status] : 'bg-border text-muted';
}

export function isCancelledPurchase(status: string | null | undefined): boolean {
  return status === 'CANCELLED' || status === 'REFUNDED';
}
