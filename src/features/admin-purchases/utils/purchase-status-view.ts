import { PurchaseStatus } from '../../purchase-history/model/purchase.model';

export interface PurchaseStatusView {
  readonly label: string;
  readonly filterLabel: string;
  readonly badgeClass: string;
}

const PURCHASE_STATUS_VIEWS: Record<PurchaseStatus, PurchaseStatusView> = {
  CONFIRMED: {
    label: 'Confirmada',
    filterLabel: 'Confirmadas',
    badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300',
  },
  IN_PREPARATION: {
    label: 'En preparación',
    filterLabel: 'En preparación',
    badgeClass: 'bg-amber-50 text-amber-800 border-amber-300',
  },
  READY: {
    label: 'Lista para retirar',
    filterLabel: 'Listas para retirar',
    badgeClass: 'bg-sky-50 text-sky-800 border-sky-300',
  },
  DELIVERED: {
    label: 'Entregada',
    filterLabel: 'Entregadas',
    badgeClass: 'bg-teal-50 text-teal-800 border-teal-300',
  },
  CANCELLED: {
    label: 'Cancelada',
    filterLabel: 'Canceladas',
    badgeClass: 'bg-rose-50 text-rose-800 border-rose-300',
  },
  REFUNDED: {
    label: 'Reembolsada',
    filterLabel: 'Reembolsadas',
    badgeClass: 'bg-purple-50 text-purple-800 border-purple-300',
  },
};

const UNKNOWN_STATUS_BADGE = 'bg-neutral-100 text-neutral-800 border-neutral-300';

export function toPurchaseStatusView(status: PurchaseStatus): PurchaseStatusView {
  return (
    PURCHASE_STATUS_VIEWS[status] ?? {
      label: status || 'Desconocido',
      filterLabel: status,
      badgeClass: UNKNOWN_STATUS_BADGE,
    }
  );
}
