import { CartCafe, CartItem } from '../../cart/model/cart.model';
import { ESPRESSO_FIXTURE, FLAT_WHITE_FIXTURE } from '../../catalog/utils/product.fixture';
import { PurchaseDetailResponseDto, PurchaseResponseDto } from '../types/checkout.dto';
import { ServerCart } from '../types/checkout.model';

export const CHECKOUT_CLIENT_ID = 'client-001';
export const CHECKOUT_CLIENT_NAME = 'Juan Pérez';

export const CHECKOUT_CAFE_FIXTURE: CartCafe = {
  externalId: 'cafe-central-001',
  name: 'Cafe Central',
};

export const CHECKOUT_ITEMS_FIXTURE: readonly CartItem[] = [
  { product: ESPRESSO_FIXTURE, quantity: 2 },
  { product: FLAT_WHITE_FIXTURE, quantity: 1 },
];

export const CHECKOUT_SERVER_CART_FIXTURE: ServerCart = {
  id: 'cart-1',
  total: 9200,
  lines: [
    { productId: ESPRESSO_FIXTURE.externalId, quantity: 2 },
    { productId: FLAT_WHITE_FIXTURE.externalId, quantity: 1 },
  ],
};

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
