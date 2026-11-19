import { computed, inject, Injectable, signal } from '@angular/core';
import { CouponAction, ValidationOutcome } from '../types/coupon-validation.model';
import { toCancellationFailure } from '../utils/coupon-cancellation-error';
import { toValidationFailure } from '../utils/coupon-validation-error';
import { CouponValidationRepository } from './coupon-validation.repository';

export type ValidationStatus = 'idle' | 'validating' | 'done';

@Injectable()
export class CouponValidationStore {
  private readonly repository = inject(CouponValidationRepository);

  readonly status = signal<ValidationStatus>('idle');
  readonly outcome = signal<ValidationOutcome | null>(null);
  readonly action = signal<CouponAction>('deliver');
  readonly canValidate = computed(() => this.status() === 'idle');

  chooseAction(action: CouponAction): void {
    if (this.canValidate()) {
      this.action.set(action);
    }
  }

  process(rawCode: string): void {
    if (this.action() === 'cancel') {
      this.cancel(rawCode);
    } else {
      this.validate(rawCode);
    }
  }

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

  cancel(rawCode: string): void {
    const code = rawCode.trim();
    if (!code || !this.canValidate()) {
      return;
    }

    this.status.set('validating');
    this.repository.cancel(code).subscribe({
      next: (cancelled) => this.finish({ kind: 'cancelled', code, ...cancelled }),
      error: (error: unknown) => this.finish({ ...toCancellationFailure(error), code }),
    });
  }

  reset(): void {
    if (this.status() !== 'done') {
      return;
    }
    this.outcome.set(null);
    this.action.set('deliver');
    this.status.set('idle');
  }

  private finish(outcome: ValidationOutcome): void {
    this.outcome.set(outcome);
    this.status.set('done');
  }
}
