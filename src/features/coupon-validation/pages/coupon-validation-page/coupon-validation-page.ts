import { Component, computed, inject } from '@angular/core';
import { ManualCodeForm } from '../../components/manual-code-form/manual-code-form';
import { QrScanner } from '../../components/qr-scanner/qr-scanner';
import { ValidationResult } from '../../components/validation-result/validation-result';
import { CouponValidationStore } from '../../services/coupon-validation.store';

@Component({
  selector: 'app-coupon-validation-page',
  imports: [QrScanner, ManualCodeForm, ValidationResult],
  templateUrl: './coupon-validation-page.html',
  providers: [CouponValidationStore],
  host: { class: 'block' },
})
export class CouponValidationPage {
  protected readonly store = inject(CouponValidationStore);
  protected readonly isCancelling = computed(() => this.store.action() === 'cancel');

  protected onCodeReceived(code: string): void {
    this.store.process(code);
  }

  protected onValidateAnother(): void {
    this.store.reset();
  }
}
