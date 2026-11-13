import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { defer, delay, map, Observable, of } from 'rxjs';
import { CartService } from '../../cart/services/cart.service';
import { MOCK_PRODUCTS } from '../../catalog/data/products.mock';
import { MOCK_PURCHASES } from '../../purchase-history/data/purchases.mock';
import { Purchase } from '../../purchase-history/model/purchase.model';
import { PurchaseDetailResponseDto, PurchaseResponseDto } from '../types/checkout.dto';
import { CheckoutSummary, ConfirmedOrder, CreatePurchaseInput } from '../types/checkout.model';
import { ApplicableCoupon, CheckoutCoupon, CouponPreview } from '../types/coupon.model';
import { buildPurchaseResponse } from '../utils/checkout.fixture';
import { toCheckoutSummary, toConfirmedOrder } from '../utils/checkout.mapper';
import { toCouponPreview } from '../utils/coupon-discount';
import { CHECKOUT_COUPON_DTOS_FIXTURE } from '../utils/coupon.fixture';
import { toCheckoutCoupon, toCheckoutCoupons } from '../utils/coupon.mapper';
import { CheckoutRepository } from './checkout.repository';

export const MOCK_LATENCY_MS = 400;

function emptyCart(): HttpErrorResponse {
  return new HttpErrorResponse({
    status: HttpStatusCode.BadRequest,
    error: 'Cart cannot be empty',
  });
}

function invalidCode(): HttpErrorResponse {
  return new HttpErrorResponse({ status: HttpStatusCode.NotFound, error: 'Invalid code' });
}

function rejectedCoupon(message: string): HttpErrorResponse {
  return new HttpErrorResponse({
    status: HttpStatusCode.BadRequest,
    error: { error: message, status: HttpStatusCode.BadRequest },
  });
}

function toHistoryPurchase(purchase: PurchaseResponseDto): Purchase {
  return {
    ...purchase,
    clientName: purchase.clientName ?? undefined,
    details: [...purchase.details],
  };
}

function toGiftDetail(orderNumber: string, preview: CouponPreview): PurchaseDetailResponseDto[] {
  const gift = preview.gift;
  if (!gift) {
    return [];
  }
  const awardedPoints = MOCK_PRODUCTS.find(
    (product) => product.externalId === gift.id,
  )?.awardedPoints;
  return [
    {
      externalId: `${orderNumber}-gift`,
      productId: gift.id,
      productName: gift.name,
      amount: 1,
      unitPrice: gift.price,
      generatedPoints: awardedPoints ?? 0,
      subtotal: gift.price,
    },
  ];
}

function withCoupon(
  purchase: PurchaseResponseDto,
  coupon: ApplicableCoupon,
  preview: CouponPreview,
): PurchaseResponseDto {
  return {
    ...purchase,
    price: preview.total,
    redemptionId: coupon.id,
    details: [...purchase.details, ...toGiftDetail(purchase.externalId, preview)],
  };
}

@Injectable()
export class MockCheckoutRepository implements CheckoutRepository {
  private readonly cart = inject(CartService);
  private readonly usedCodes = new Set<string>();
  private purchaseCount = 0;

  findCartId(cafeId: string): Observable<string> {
    return of(`mock-cart-${cafeId}`).pipe(delay(MOCK_LATENCY_MS));
  }

  findCoupons(): Observable<readonly CheckoutCoupon[]> {
    return defer(() => of(this.unusedCouponDtos())).pipe(
      delay(MOCK_LATENCY_MS),
      map(toCheckoutCoupons),
    );
  }

  createPurchase(input: CreatePurchaseInput): Observable<ConfirmedOrder> {
    return defer(() => of(this.registerPurchase(input.validationCode))).pipe(
      delay(MOCK_LATENCY_MS),
      map(toConfirmedOrder),
    );
  }

  private unusedCouponDtos() {
    return CHECKOUT_COUPON_DTOS_FIXTURE.filter(
      (dto) => dto.state && !this.usedCodes.has(dto.validationCode),
    );
  }

  private registerPurchase(validationCode?: string): PurchaseResponseDto {
    const cafe = this.cart.cafe();
    const items = this.cart.items();
    const summary = toCheckoutSummary(cafe, items);
    if (!cafe || !summary) {
      throw emptyCart();
    }

    this.purchaseCount += 1;
    const orderNumber = `purchase-mock-${String(this.purchaseCount).padStart(4, '0')}`;
    const purchase = buildPurchaseResponse(orderNumber, cafe, items, new Date());
    const confirmed = validationCode
      ? this.applyCoupon(purchase, validationCode, summary)
      : purchase;
    MOCK_PURCHASES.push(toHistoryPurchase(confirmed));
    return confirmed;
  }

  private applyCoupon(
    purchase: PurchaseResponseDto,
    validationCode: string,
    summary: CheckoutSummary,
  ): PurchaseResponseDto {
    const coupon = this.findUsableCoupon(validationCode, summary.cafeId);
    this.usedCodes.add(validationCode);
    return withCoupon(purchase, coupon, toCouponPreview(coupon, summary));
  }

  private findUsableCoupon(validationCode: string, cafeId: string): ApplicableCoupon {
    const dto = CHECKOUT_COUPON_DTOS_FIXTURE.find(
      (candidate) => candidate.validationCode === validationCode,
    );
    if (!dto) {
      throw invalidCode();
    }
    if (!dto.state || this.usedCodes.has(validationCode)) {
      throw rejectedCoupon('Code already used');
    }
    const coupon = toCheckoutCoupon(dto);
    if (coupon.cafeId !== null && coupon.cafeId !== cafeId) {
      throw rejectedCoupon('This code does not belong to this cafe');
    }
    if (coupon.benefit === null) {
      throw rejectedCoupon('This benefit type cannot be applied to a purchase');
    }
    return { ...coupon, benefit: coupon.benefit };
  }
}
