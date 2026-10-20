import { PurchaseDto, PurchaseStatusDto, ReviewCreateRequestDto, ReviewDto } from '../types/order.dto';
import { CreateReviewInput, Order, OrderReview, OrderStatus } from '../types/order.model';

const STATUS_BY_CODE: Readonly<Record<string, OrderStatus>> = {
  CONFIRMED: 'completed',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
};

function toOrderStatus(code: PurchaseStatusDto): OrderStatus {
  const status = STATUS_BY_CODE[code.toUpperCase()];
  if (!status) {
    throw new Error(`Unknown purchase status: ${code}`);
  }
  return status;
}

function toDate(isoDate: string): Date {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid date: ${isoDate}`);
  }
  return date;
}

export function toOrderReview(dto: ReviewDto): OrderReview {
  return {
    id: dto.externalId,
    rating: dto.rating,
    comment: dto.message,
    createdAt: toDate(dto.date),
  };
}

export function toOrder(dto: PurchaseDto): Order {
  return {
    id: dto.externalId,
    placedAt: toDate(dto.date),
    total: dto.price,
    status: toOrderStatus(dto.status),
    cafe: {
      id: dto.cafe.externalId,
      name: dto.cafe.name,
      imageUrl: dto.cafe.imageUrl,
    },
    items: dto.details.map((detail) => ({
      id: detail.externalId,
      name: detail.productName,
      quantity: detail.amount,
      subtotal: detail.subtotal,
    })),
    review: dto.review ? toOrderReview(dto.review) : null,
  };
}

export function toOrders(dtos: readonly PurchaseDto[]): readonly Order[] {
  return dtos.map(toOrder);
}

export function toReviewCreateRequestDto(
  order: Order,
  input: CreateReviewInput,
): ReviewCreateRequestDto {
  return {
    cafeId: order.cafe.id,
    purchaseId: order.id,
    rating: input.rating,
    message: input.comment,
  };
}
