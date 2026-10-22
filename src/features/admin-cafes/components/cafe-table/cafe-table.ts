import { Component, input, output } from '@angular/core';
import { Icon } from '../../../../shared/components/icon/icon';
import { AdminCafeStoreStatus } from '../../services/admin-cafe.store';
import { AdminCafe } from '../../types/admin-cafe.model';

@Component({
  selector: 'app-cafe-table',
  imports: [Icon],
  templateUrl: './cafe-table.html',
})
export class CafeTable {
  readonly cafes = input.required<readonly AdminCafe[]>();
  readonly status = input.required<AdminCafeStoreStatus>();

  readonly selectCafe = output<AdminCafe>();
  readonly toggleStatus = output<{ externalId: string; state: boolean }>();

  protected onRowClick(cafe: AdminCafe): void {
    this.selectCafe.emit(cafe);
  }

  protected onRowKeyDown(event: KeyboardEvent, cafe: AdminCafe): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.selectCafe.emit(cafe);
    }
  }

  protected onToggleStatusClick(event: Event, cafe: AdminCafe): void {
    event.stopPropagation();
    this.toggleStatus.emit({
      externalId: cafe.externalId,
      state: !cafe.state,
    });
  }

  protected getInitials(name: string): string {
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0].toUpperCase())
      .join('');
  }
}
