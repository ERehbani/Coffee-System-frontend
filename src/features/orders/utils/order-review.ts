import { Order, OrderStatus } from '../types/order.model';

export const MIN_RATING = 1;
export const MAX_RATING = 5;
export const MAX_COMMENT_LENGTH = 500;

export const ORDER_STATUS_LABELS: Readonly<Record<OrderStatus, string>> = {
  completed: 'Completado',
  cancelled: 'Cancelado',
  refunded: 'Reembolsado',
};

/** Only completed orders without a review can be reviewed. */
export function canReview(order: Order): boolean {
  return order.status === 'completed' && order.review === null;
}
