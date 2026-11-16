import { computed, inject, Injectable, signal } from '@angular/core';
import { ValidationOutcome } from '../types/coupon-validation.model';
import { toValidationFailure } from '../utils/coupon-validation-error';
import { CouponValidationRepository } from './coupon-validation.repository';

export type ValidationStatus = 'idle' | 'validating' | 'done';

@Injectable()
export class CouponValidationStore {
  private readonly repository = inject(CouponValidationRepository);

  readonly status = signal<ValidationStatus>('idle');
  readonly outcome = signal<ValidationOutcome | null>(null);
  readonly canValidate = computed(() => this.status() === 'idle');

  validate(rawCode: string): void {
    const code = rawCode.trim();
    if (!code || !this.canValidate()) {
      return;
    }

    this.status.set('validating');
    this.repository.validate(code).subscribe({
      next: (coupon) => this.finish({ kind: 'valid', code, coupon }),
      error: (error: unknown) => this.finish({ ...toValidationFailure(error), code }),
    });
  }

  reset(): void {
    if (this.status() !== 'done') {
      return;
    }
    this.outcome.set(null);
    this.status.set('idle');
  }

  private finish(outcome: ValidationOutcome): void {
    this.outcome.set(outcome);
    this.status.set('done');
  }
}
