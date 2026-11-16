import { OrderStatus } from '../types/checkout.model';

const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  confirmed: 'Confirmada',
  cancelled: 'Cancelada',
  refunded: 'Reembolsada',
};

export function toOrderStatusLabel(status: OrderStatus): string {
  return ORDER_STATUS_LABELS[status];
}
