import { HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom, Observable } from 'rxjs';
import { MOCK_VALIDATION_CODES } from '../utils/coupon-validation.fixture';
import { toValidationFailure } from '../utils/coupon-validation-error';
import {
  MOCK_LATENCY_MS,
  MockCouponValidationRepository,
} from './mock-coupon-validation.repository';

describe('MockCouponValidationRepository', () => {
  let repository: MockCouponValidationRepository;

  beforeEach(() => {
    vi.useFakeTimers();
    repository = new MockCouponValidationRepository();
  });

  afterEach(() => vi.useRealTimers());

  function settle<T>(source: Observable<T>): Promise<T> {
    const result = firstValueFrom(source);
    vi.advanceTimersByTime(MOCK_LATENCY_MS);
    return result;
  }

  async function failure(source: Observable<unknown>): Promise<HttpErrorResponse> {
    const error = await settle(source).catch((caught: unknown) => caught);
    expect(error).toBeInstanceOf(HttpErrorResponse);
    return error as HttpErrorResponse;
  }

  it('validates a coupon of the signed-in cafe and marks it as used', async () => {
    const coupon = await settle(repository.validate(MOCK_VALIDATION_CODES.discount));

    expect(coupon.code).toBe(MOCK_VALIDATION_CODES.discount);
    expect(coupon.benefitType).toBe('CODIGO_DESCUENTO');
    expect(coupon.discountPercentage).toBe(15);
    expect(coupon.usedAt).not.toBeNull();

    const second = await failure(repository.validate(MOCK_VALIDATION_CODES.discount));
    expect(second.status).toBe(400);
    expect(second.error).toEqual({ error: 'This code has already been used', status: 400 });
  });

  it('has a valid sample coupon for every benefit type', async () => {
    const codes = [
      MOCK_VALIDATION_CODES.discount,
      MOCK_VALIDATION_CODES.twoForOne,
      MOCK_VALIDATION_CODES.productForPoints,
      MOCK_VALIDATION_CODES.memberFreeProduct,
    ];
    const types: (string | null)[] = [];
    for (const code of codes) {
      types.push((await settle(repository.validate(code))).benefitType);
    }

    expect(types).toEqual([
      'CODIGO_DESCUENTO',
      'DOS_POR_UNO',
      'PRODUCTO_POR_PUNTOS',
      'PRODUCTO_GRATIS_SOCIO',
    ]);
  });

  it('answers the sample codes with the same errors as the backend', async () => {
    const used = await failure(repository.validate(MOCK_VALIDATION_CODES.used));
    const otherCafe = await failure(repository.validate(MOCK_VALIDATION_CODES.otherCafe));
    const global = await failure(repository.validate(MOCK_VALIDATION_CODES.global));
    const missing = await failure(repository.validate('00000000-0000-4000-8000-000000000000'));

    expect(used.error.error).toBe('This code has already been used');
    expect(otherCafe.status).toBe(400);
    expect(otherCafe.error.error).toBe('This redemption does not belong to your cafe');
    expect(global.status).toBe(400);
    expect(global.error.error).toBe('Only admin can validate global benefits');
    expect(missing.status).toBe(404);
    expect(missing.error).toBe('Redemption not found');
  });

  it('gives each sample code the outcome the cafe will see', async () => {
    const kindOf = async (code: string) =>
      toValidationFailure(await failure(repository.validate(code))).kind;

    expect(await kindOf(MOCK_VALIDATION_CODES.used)).toBe('used');
    expect(await kindOf('unknown-code')).toBe('not-found');
    expect(await kindOf(MOCK_VALIDATION_CODES.otherCafe)).toBe('rejected');
    expect(await kindOf(MOCK_VALIDATION_CODES.global)).toBe('rejected');
  });

  it('answers after the simulated latency', () => {
    const emitted = vi.fn();
    repository.validate(MOCK_VALIDATION_CODES.twoForOne).subscribe(emitted);

    vi.advanceTimersByTime(MOCK_LATENCY_MS - 1);
    expect(emitted).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(emitted).toHaveBeenCalledOnce();
  });
});
