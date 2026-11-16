import { CurrencyPipe, DatePipe } from '@angular/common';
import {
  afterNextRender,
  Component,
  computed,
  ElementRef,
  input,
  output,
  viewChild,
} from '@angular/core';
import { Icon } from '../../../../shared/components/icon/icon';
import { benefitFormatLabel } from '../../../admin-benefit-types/utils/benefit-format-labels';
import { ValidationOutcome } from '../../types/coupon-validation.model';
import { toRewardLabel } from '../../utils/coupon-reward';

@Component({
  selector: 'app-validation-result',
  imports: [CurrencyPipe, DatePipe, Icon],
  templateUrl: './validation-result.html',
  host: { class: 'block' },
})
export class ValidationResult {
  readonly outcome = input.required<ValidationOutcome>();
  readonly next = output<void>();

  private readonly heading = viewChild<ElementRef<HTMLElement>>('heading');

  protected readonly coupon = computed(() => {
    const outcome = this.outcome();
    return outcome.kind === 'valid' ? outcome.coupon : null;
  });
  protected readonly reward = computed(() => {
    const coupon = this.coupon();
    return coupon ? toRewardLabel(coupon) : null;
  });
  protected readonly benefitTypeLabel = computed(() => {
    const benefitType = this.coupon()?.benefitType;
    return benefitType ? benefitFormatLabel(benefitType) : null;
  });
  protected readonly rejectionMessage = computed(() => {
    const outcome = this.outcome();
    return outcome.kind === 'rejected' ? outcome.message : null;
  });

  constructor() {
    afterNextRender(() => this.heading()?.nativeElement.focus());
  }
}
