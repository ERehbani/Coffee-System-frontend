import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Icon } from '../../../../shared/components/icon/icon';
import { CategoryDeleteModal } from '../../components/category-delete-modal/category-delete-modal';
import { CategoryFormModal } from '../../components/category-form-modal/category-form-modal';
import { CategoryTable } from '../../components/category-table/category-table';
import { AdminCategoryStore, CategorySortOption } from '../../services/admin-category.store';
import { AdminCategory, CategoryFormData, CategoryStatus } from '../../types/admin-category.model';

@Component({
  selector: 'app-admin-categories-page',
  imports: [RouterLink, Icon, CategoryTable, CategoryFormModal, CategoryDeleteModal],
  templateUrl: './admin-categories-page.html',
  host: { class: 'block' },
})
export class AdminCategoriesPage {
  protected readonly store = inject(AdminCategoryStore);

  protected onSearchChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.store.setSearchQuery(input.value);
  }

  protected onStatusChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.store.setStatusFilter(select.value as CategoryStatus | 'all');
  }

  protected onSortChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.store.setSortBy(select.value as CategorySortOption);
  }

  protected onRefresh(): void {
    this.store.loadCategories();
  }

  protected onClearFilters(): void {
    this.store.resetFilters();
  }

  protected onOpenCreate(): void {
    this.store.openCreateModal();
  }

  protected onEdit(category: AdminCategory): void {
    this.store.openEditModal(category);
  }

  protected onToggleStatus(category: AdminCategory): void {
    this.store.toggleCategoryStatus(category);
  }

  protected onOpenDelete(category: AdminCategory): void {
    this.store.openDeleteConfirm(category);
  }

  protected onSaveCategory(event: { data: CategoryFormData; id?: string }): void {
    this.store.saveCategory(event.data, event.id);
  }

  protected onConfirmDelete(id: string): void {
    this.store.deleteCategory(id);
  }
}
