import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Icon } from '../../../../shared/components/icon/icon';
import { LogoutButton } from '../../../auth/components/logout-button/logout-button';
import { ManualCodeForm } from '../../components/manual-code-form/manual-code-form';
import { QrScanner } from '../../components/qr-scanner/qr-scanner';
import { ValidationResult } from '../../components/validation-result/validation-result';
import { CouponValidationStore } from '../../services/coupon-validation.store';

@Component({
  selector: 'app-coupon-validation-page',
  imports: [RouterLink, Icon, LogoutButton, QrScanner, ManualCodeForm, ValidationResult],
  templateUrl: './coupon-validation-page.html',
  providers: [CouponValidationStore],
  host: { class: 'block' },
})
export class CouponValidationPage {
  protected readonly store = inject(CouponValidationStore);

  protected onCodeReceived(code: string): void {
    this.store.validate(code);
  }

  protected onValidateAnother(): void {
    this.store.reset();
  }
}
