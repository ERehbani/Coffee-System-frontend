import { DatePipe } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { Icon } from '../../../../shared/components/icon/icon';
import { CategoryStoreStatus } from '../../services/admin-category.store';
import { AdminCategory } from '../../types/admin-category.model';

@Component({
  selector: 'app-category-table',
  imports: [DatePipe, Icon],
  templateUrl: './category-table.html',
  host: { class: 'block' },
})
export class CategoryTable {
  readonly categories = input.required<readonly AdminCategory[]>();
  readonly status = input.required<CategoryStoreStatus>();
  readonly isProcessing = input<boolean>(false);

  readonly editCategory = output<AdminCategory>();
  readonly toggleStatus = output<AdminCategory>();
  readonly deleteCategory = output<AdminCategory>();
  readonly createCategory = output<void>();

  protected getColorClasses(color: string): { bg: string; text: string; ring: string } {
    switch (color) {
      case 'amber':
        return { bg: 'bg-amber-100', text: 'text-amber-800', ring: 'ring-amber-200' };
      case 'rose':
        return { bg: 'bg-rose-100', text: 'text-rose-800', ring: 'ring-rose-200' };
      case 'sky':
        return { bg: 'bg-sky-100', text: 'text-sky-800', ring: 'ring-sky-200' };
      case 'emerald':
        return { bg: 'bg-emerald-100', text: 'text-emerald-800', ring: 'ring-emerald-200' };
      case 'purple':
        return { bg: 'bg-purple-100', text: 'text-purple-800', ring: 'ring-purple-200' };
      case 'orange':
        return { bg: 'bg-orange-100', text: 'text-orange-800', ring: 'ring-orange-200' };
      default:
        return { bg: 'bg-amber-100', text: 'text-primary', ring: 'ring-amber-200' };
    }
  }
}
