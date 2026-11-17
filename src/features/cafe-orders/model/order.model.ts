export type OrderStatus =
  | 'CONFIRMED'
  | 'IN_PREPARATION'
  | 'READY'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REFUNDED';

export interface OrderItem {
  externalId: string;
  productId: string;
  productName: string;
  amount: number;
  unitPrice: number;
  subtotal: number;
}

export interface Order {
  externalId: string;
  date: string;
  price: number;
  status: OrderStatus;
  clientId: string;
  clientName: string | null;
  details: OrderItem[];
}

export interface OrderPage {
  content: Order[];
}
