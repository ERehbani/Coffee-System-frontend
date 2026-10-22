import { Component, inject } from '@angular/core';
import { AdminPageHeader } from '../../../../shared/components/admin-page-header/admin-page-header';
import { Icon } from '../../../../shared/components/icon/icon';
import { CafeDetailModal } from '../../components/cafe-detail-modal/cafe-detail-modal';
import { CafeRegisterModal } from '../../components/cafe-register-modal/cafe-register-modal';
import { CafeTable } from '../../components/cafe-table/cafe-table';
import { AdminCafeStore } from '../../services/admin-cafe.store';
import { CreateCafeInput } from '../../types/admin-cafe.model';

@Component({
  selector: 'app-admin-cafes-page',
  imports: [Icon, AdminPageHeader, CafeTable, CafeDetailModal, CafeRegisterModal],
  templateUrl: './admin-cafes-page.html',
  host: { class: 'block' },
})
export class AdminCafesPage {
  protected readonly store = inject(AdminCafeStore);

  protected onSearchChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.store.setSearchQuery(input.value);
  }

  protected onStateChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.store.setStateFilter(select.value as 'all' | 'active' | 'inactive');
  }

  protected onToggleStatus(event: { externalId: string; state: boolean }): void {
    this.store.updateCafeStatus(event.externalId, event.state);
  }

  protected onRegister(request: CreateCafeInput): void {
    this.store.registerCafe(request);
  }

  protected onRefresh(): void {
    this.store.loadCafes();
  }

  protected onClearFilters(): void {
    this.store.resetFilters();
  }
}
