import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { Observable, of, Subject, throwError } from 'rxjs';
import { ValidatedCoupon } from '../types/coupon-validation.model';
import { VALIDATION_ERROR_MESSAGE } from '../utils/coupon-validation-error';
import { CouponValidationRepository } from './coupon-validation.repository';
import { CouponValidationStore } from './coupon-validation.store';

const coupon: ValidatedCoupon = {
  id: 'redemption-1',
  code: 'code-1',
  benefitName: '2x1 en medialunas',
  description: null,
  conditions: [],
  benefitType: 'DOS_POR_UNO',
  discountPercentage: null,
  productName: 'Medialuna',
  productPrice: 1200,
  usedAt: '2026-11-13T11:42:07',
};

describe('CouponValidationStore', () => {
  let validate: ReturnType<typeof vi.fn>;

  function create(response: Observable<ValidatedCoupon> = of(coupon)) {
    validate = vi.fn().mockReturnValue(response);
    TestBed.configureTestingModule({
      providers: [
        CouponValidationStore,
        { provide: CouponValidationRepository, useValue: { validate } },
      ],
    });
    return TestBed.inject(CouponValidationStore);
  }

  const failWith = (error: HttpErrorResponse) => throwError(() => error);

  it('starts ready to validate, without a result', () => {
    const store = create();

    expect(store.status()).toBe('idle');
    expect(store.canValidate()).toBe(true);
    expect(store.outcome()).toBeNull();
  });

  it('validates the trimmed code and shows the valid coupon', () => {
    const store = create();

    store.validate('  code-1  ');

    expect(validate).toHaveBeenCalledWith('code-1');
    expect(store.status()).toBe('done');
    expect(store.outcome()).toEqual({ kind: 'valid', code: 'code-1', coupon });
  });

  it('ignores an empty code', () => {
    const store = create();

    store.validate('   ');

    expect(validate).not.toHaveBeenCalled();
    expect(store.status()).toBe('idle');
  });

  it('does not validate another code while one is in progress', () => {
    const response = new Subject<ValidatedCoupon>();
    const store = create(response);

    store.validate('code-1');
    store.validate('code-1');
    store.validate('code-2');

    expect(store.status()).toBe('validating');
    expect(store.canValidate()).toBe(false);
    expect(validate).toHaveBeenCalledOnce();

    response.next(coupon);
    expect(store.status()).toBe('done');
  });

  it('does not validate another code while a result is on screen', () => {
    const store = create();
    store.validate('code-1');

    store.validate('code-1');
    store.validate('code-2');

    expect(validate).toHaveBeenCalledOnce();
    expect(store.outcome()?.code).toBe('code-1');
  });

  it('validates again only after the cafe asks for the next coupon', () => {
    const store = create();
    store.validate('code-1');

    store.reset();

    expect(store.status()).toBe('idle');
    expect(store.outcome()).toBeNull();

    store.validate('code-2');
    expect(validate).toHaveBeenCalledTimes(2);
    expect(validate).toHaveBeenLastCalledWith('code-2');
  });

  it('cannot be reset while a validation is in progress', () => {
    const store = create(new Subject<ValidatedCoupon>());
    store.validate('code-1');

    store.reset();

    expect(store.status()).toBe('validating');
  });

  it('shows a used coupon', () => {
    const store = create(
      failWith(
        new HttpErrorResponse({
          status: 400,
          error: { error: 'This code has already been used', status: 400 },
        }),
      ),
    );

    store.validate('code-1');

    expect(store.outcome()).toEqual({ kind: 'used', code: 'code-1' });
  });

  it('shows a missing coupon', () => {
    const store = create(
      failWith(new HttpErrorResponse({ status: 404, error: 'Redemption not found' })),
    );

    store.validate('code-1');

    expect(store.outcome()).toEqual({ kind: 'not-found', code: 'code-1' });
  });

  it('shows any other rejection with its own message', () => {
    const store = create(
      failWith(
        new HttpErrorResponse({
          status: 400,
          error: { error: 'This redemption does not belong to your cafe', status: 400 },
        }),
      ),
    );

    store.validate('code-1');

    expect(store.outcome()).toEqual({
      kind: 'rejected',
      code: 'code-1',
      message: 'Este cupón es de otra cafetería, no se puede canjear en este local.',
    });
  });

  it('shows the generic message for an unexpected failure', () => {
    const store = create(throwError(() => new Error('boom')));

    store.validate('code-1');

    expect(store.status()).toBe('done');
    expect(store.outcome()).toEqual({
      kind: 'rejected',
      code: 'code-1',
      message: VALIDATION_ERROR_MESSAGE,
    });
  });
});
