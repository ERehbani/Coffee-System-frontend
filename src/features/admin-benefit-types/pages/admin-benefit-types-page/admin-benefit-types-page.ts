import { Component, computed, inject, signal } from '@angular/core';
import { AdminPageHeader } from '../../../../shared/components/admin-page-header/admin-page-header';
import { Icon } from '../../../../shared/components/icon/icon';
import { BenefitFormatDrawer } from '../../components/benefit-format-drawer/benefit-format-drawer';
import {
  BenefitFormatEditRequest,
  BenefitFormatTable,
} from '../../components/benefit-format-table/benefit-format-table';
import { AdminBenefitFormatStore } from '../../services/benefit-format.store';

@Component({
  imports: [AdminPageHeader, Icon, BenefitFormatTable, BenefitFormatDrawer],
  selector: 'app-admin-benefit-types-page',
  templateUrl: './admin-benefit-types-page.html',
  host: { class: 'block' },
})
export class AdminBenefitTypesPage {
  protected readonly store = inject(AdminBenefitFormatStore);

  /** The button that opened the drawer; clicking does not focus a button in every browser. */
  protected readonly drawerTrigger = signal<HTMLElement | null>(null);

  /** Every format is registered already: there is nothing left for "Nuevo tipo" to add. */
  protected readonly isCatalogComplete = computed(
    () => this.store.status() === 'ready' && this.store.availableCodes().length === 0,
  );

  protected onCreate(event: Event): void {
    this.drawerTrigger.set(event.currentTarget as HTMLElement);
    this.store.openCreateDrawer();
  }

  protected onEdit({ format, trigger }: BenefitFormatEditRequest): void {
    this.drawerTrigger.set(trigger);
    this.store.openEditDrawer(format);
  }
}
