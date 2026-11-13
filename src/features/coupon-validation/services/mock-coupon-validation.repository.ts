import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable, timer } from 'rxjs';
import { RedemptionResponseDto } from '../types/coupon-validation.dto';
import { ValidatedCoupon } from '../types/coupon-validation.model';
import { COUPON_VALIDATION_FIXTURE, MOCK_CAFE_ID } from '../utils/coupon-validation.fixture';
import { toValidatedCoupon } from '../utils/coupon-validation.mapper';
import { CouponValidationRepository } from './coupon-validation.repository';

export const MOCK_LATENCY_MS = 400;

function notFound(message: string): HttpErrorResponse {
  return new HttpErrorResponse({ status: 404, error: message });
}

function badRequest(message: string): HttpErrorResponse {
  return new HttpErrorResponse({ status: 400, error: { error: message, status: 400 } });
}

@Injectable()
export class MockCouponValidationRepository implements CouponValidationRepository {
  private redemptions: readonly RedemptionResponseDto[] = COUPON_VALIDATION_FIXTURE;

  validate(code: string): Observable<ValidatedCoupon> {
    return timer(MOCK_LATENCY_MS).pipe(map(() => toValidatedCoupon(this.consume(code))));
  }

  private consume(code: string): RedemptionResponseDto {
    const redemption = this.redemptions.find((item) => item.validationCode === code);
    if (!redemption) {
      throw notFound('Redemption not found');
    }
    if (!redemption.state) {
      throw badRequest('This code has already been used');
    }
    if (redemption.cafeId === null) {
      throw badRequest('Only admin can validate global benefits');
    }
    if (redemption.cafeId !== MOCK_CAFE_ID) {
      throw badRequest('This redemption does not belong to your cafe');
    }
    const used = { ...redemption, state: false, usedDate: new Date().toISOString() };
    this.redemptions = this.redemptions.map((item) => (item === redemption ? used : item));
    return used;
  }
}
