import { Component, input, output } from '@angular/core';
import { Icon } from '../../../../shared/components/icon/icon';
import { BenefitFormat } from '../../types/benefit-format.model';
import { benefitFormatLabel } from '../../utils/benefit-format-labels';

const COUNT_FORMAT = new Intl.NumberFormat('es-AR');

/** A request to edit a format, with the button it came from so the focus can return to it. */
export interface BenefitFormatEditRequest {
  readonly format: BenefitFormat;
  readonly trigger: HTMLElement;
}

@Component({
  imports: [Icon],
  selector: 'app-benefit-format-table',
  templateUrl: './benefit-format-table.html',
  host: { class: 'block' },
})
export class BenefitFormatTable {
  readonly formats = input.required<readonly BenefitFormat[]>();

  readonly edit = output<BenefitFormatEditRequest>();

  protected readonly formatLabel = benefitFormatLabel;

  protected formatCount(count: number): string {
    return COUNT_FORMAT.format(count);
  }

  protected onEdit(format: BenefitFormat, event: Event): void {
    this.edit.emit({ format, trigger: event.currentTarget as HTMLElement });
  }
}
