import { CartCafe, CartItem } from '../../cart/model/cart.model';
import {
  CreatePurchaseRequestDto,
  PurchaseDetailResponseDto,
  PurchaseResponseDto,
  PurchaseStatusDto,
} from '../types/checkout.dto';
import {
  CheckoutLine,
  CheckoutSummary,
  ConfirmedOrder,
  CreatePurchaseInput,
  OrderLine,
  OrderStatus,
} from '../types/checkout.model';

const ORDER_STATUS_BY_DTO: Record<PurchaseStatusDto, OrderStatus> = {
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
};

function toCheckoutLine(item: CartItem): CheckoutLine {
  return {
    productId: item.product.externalId,
    productName: item.product.name,
    quantity: item.quantity,
    unitPrice: item.product.price,
    subtotal: item.product.price * item.quantity,
  };
}

export function toCheckoutSummary(
  cafe: CartCafe | null,
  items: readonly CartItem[],
): CheckoutSummary | null {
  if (!cafe || items.length === 0) {
    return null;
  }

  const lines = items.map(toCheckoutLine);
  return {
    cafeId: cafe.externalId,
    cafeName: cafe.name,
    lines,
    total: lines.reduce((total, line) => total + line.subtotal, 0),
  };
}

export function toCreatePurchaseRequestDto(input: CreatePurchaseInput): CreatePurchaseRequestDto {
  const validationCode = input.validationCode?.trim();
  if (!validationCode) {
    return { cartId: input.cartId };
  }
  return { cartId: input.cartId, validationCode };
}

function toOrderLine(dto: PurchaseDetailResponseDto): OrderLine {
  return {
    productId: dto.productId,
    productName: dto.productName,
    quantity: dto.amount,
    unitPrice: dto.unitPrice,
    subtotal: dto.subtotal,
    generatedPoints: dto.generatedPoints,
  };
}

export function toConfirmedOrder(dto: PurchaseResponseDto): ConfirmedOrder {
  const lines = dto.details.map(toOrderLine);
  return {
    orderNumber: dto.externalId,
    date: new Date(dto.date),
    status: ORDER_STATUS_BY_DTO[dto.status],
    total: dto.price,
    generatedPoints: lines.reduce((total, line) => total + line.generatedPoints, 0),
    cafeId: dto.cafeId,
    cafeName: dto.cafeName,
    redemptionId: dto.redemptionId,
    lines,
  };
}
