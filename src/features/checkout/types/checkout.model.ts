export type OrderStatus = 'confirmed' | 'cancelled' | 'refunded';

export interface CheckoutLine {
  readonly productId: string;
  readonly productName: string;
  readonly quantity: number;
  readonly unitPrice: number;
  readonly subtotal: number;
}

export interface CheckoutSummary {
  readonly cafeId: string;
  readonly cafeName: string;
  readonly lines: readonly CheckoutLine[];
  readonly total: number;
}

export interface CreatePurchaseInput {
  readonly cartId: string;
  readonly validationCode?: string;
}

export interface OrderLine {
  readonly productId: string;
  readonly productName: string;
  readonly quantity: number;
  readonly unitPrice: number;
  readonly subtotal: number;
  readonly generatedPoints: number;
}

export interface ConfirmedOrder {
  readonly orderNumber: string;
  readonly date: Date;
  readonly status: OrderStatus;
  readonly total: number;
  readonly generatedPoints: number;
  readonly cafeId: string;
  readonly cafeName: string;
  readonly redemptionId: string | null;
  readonly lines: readonly OrderLine[];
}
