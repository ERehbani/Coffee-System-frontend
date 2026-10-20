export type OrderStatus = 'completed' | 'cancelled' | 'refunded';

export interface OrderCafe {
  readonly id: string;
  readonly name: string;
  readonly imageUrl: string | null;
}

export interface OrderItem {
  readonly id: string;
  readonly name: string;
  readonly quantity: number;
  readonly subtotal: number;
}

export interface OrderReview {
  readonly id: string;
  readonly rating: number;
  readonly comment: string;
  readonly createdAt: Date;
}

export interface Order {
  readonly id: string;
  readonly placedAt: Date;
  readonly total: number;
  readonly status: OrderStatus;
  readonly cafe: OrderCafe;
  readonly items: readonly OrderItem[];
  readonly review: OrderReview | null;
}

export interface CreateReviewInput {
  readonly rating: number;
  readonly comment: string;
}
