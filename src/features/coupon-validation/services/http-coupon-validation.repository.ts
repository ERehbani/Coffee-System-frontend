import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { RedemptionResponseDto } from '../types/coupon-validation.dto';
import { ValidatedCoupon } from '../types/coupon-validation.model';
import { toValidatedCoupon } from '../utils/coupon-validation.mapper';
import { CouponValidationRepository } from './coupon-validation.repository';

@Injectable()
export class HttpCouponValidationRepository implements CouponValidationRepository {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiBaseUrl}/redemption/validate`;

  validate(code: string): Observable<ValidatedCoupon> {
    return this.http
      .post<RedemptionResponseDto>(`${this.url}/${encodeURIComponent(code)}`, null)
      .pipe(map(toValidatedCoupon));
  }
}
