import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Icon } from '../../../../shared/components/icon/icon';
import { GlobalBenefitFormModal } from '../../components/global-benefit-form-modal/global-benefit-form-modal';
import { GlobalBenefitTable } from '../../components/global-benefit-table/global-benefit-table';
import { GlobalBenefitStore } from '../../services/global-benefit.store';

@Component({
  selector: 'app-admin-global-benefits-page',
  standalone: true,
  imports: [CommonModule, Icon, GlobalBenefitTable, GlobalBenefitFormModal],
  templateUrl: './admin-global-benefits-page.html',
  host: { class: 'block' },
})
export class AdminGlobalBenefitsPage {
  protected readonly store = inject(GlobalBenefitStore);
}
