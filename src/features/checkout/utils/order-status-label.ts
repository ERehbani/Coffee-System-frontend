import { OrderStatus } from '../types/checkout.model';

const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  confirmed: 'Confirmada',
  cancelled: 'Cancelada',
  refunded: 'Reembolsada',
  'in-preparation': 'En preparación',
  ready: 'Lista para retirar',
  delivered: 'Entregada',
};

export function toOrderStatusLabel(status: OrderStatus): string {
  return ORDER_STATUS_LABELS[status];
}
