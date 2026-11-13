import { CartCafe, CartItem } from '../../cart/model/cart.model';
import { MOCK_PRODUCTS } from '../../catalog/data/products.mock';
import { PurchaseDetailResponseDto, PurchaseResponseDto } from '../types/checkout.dto';

export const CHECKOUT_CLIENT_ID = 'client-001';
export const CHECKOUT_CLIENT_NAME = 'Juan Pérez';

export const CHECKOUT_CAFE_FIXTURE: CartCafe = {
  externalId: 'cafe-central-001',
  name: 'Cafe Central',
};

export const CHECKOUT_ITEMS_FIXTURE: readonly CartItem[] = [
  { product: MOCK_PRODUCTS[0], quantity: 2 },
  { product: MOCK_PRODUCTS[1], quantity: 1 },
];

function toDetail(orderNumber: string, item: CartItem, index: number): PurchaseDetailResponseDto {
  return {
    externalId: `${orderNumber}-detail-${index + 1}`,
    productId: item.product.externalId,
    productName: item.product.name,
    amount: item.quantity,
    unitPrice: item.product.price,
    generatedPoints: (item.product.awardedPoints ?? 0) * item.quantity,
    subtotal: item.product.price * item.quantity,
  };
}

export function buildPurchaseResponse(
  orderNumber: string,
  cafe: CartCafe,
  items: readonly CartItem[],
  date: Date,
): PurchaseResponseDto {
  const details = items.map((item, index) => toDetail(orderNumber, item, index));
  return {
    externalId: orderNumber,
    date: date.toISOString(),
    price: details.reduce((total, detail) => total + detail.subtotal, 0),
    status: 'CONFIRMED',
    clientId: CHECKOUT_CLIENT_ID,
    clientName: CHECKOUT_CLIENT_NAME,
    cafeId: cafe.externalId,
    cafeName: cafe.name,
    redemptionId: null,
    details,
    reviewed: false,
  };
}
