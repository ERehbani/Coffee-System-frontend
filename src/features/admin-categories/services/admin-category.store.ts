import { computed, inject, Injectable, signal } from '@angular/core';
import {
  AdminCategory,
  CategoryFormData,
  CategoryStatsSummary,
  CategoryStatus,
} from '../types/admin-category.model';
import { AdminCategoryRepository } from './admin-category.repository';

export type CategoryStoreStatus = 'loading' | 'ready' | 'error';

export interface ActionFeedback {
  readonly type: 'success' | 'error';
  readonly text: string;
}

export type CategorySortOption = 'name-asc' | 'name-desc' | 'products-desc' | 'recent';

@Injectable()
export class AdminCategoryStore {
  private readonly repository = inject(AdminCategoryRepository);

  readonly categories = signal<readonly AdminCategory[]>([]);
  readonly status = signal<CategoryStoreStatus>('loading');
  readonly errorMessage = signal<string | null>(null);

  readonly isProcessing = signal<boolean>(false);
  readonly actionMessage = signal<ActionFeedback | null>(null);

  readonly searchQuery = signal<string>('');
  readonly statusFilter = signal<CategoryStatus | 'all'>('all');
  readonly sortBy = signal<CategorySortOption>('name-asc');

  readonly isFormModalOpen = signal<boolean>(false);
  readonly selectedCategoryForEdit = signal<AdminCategory | null>(null);
  readonly categoryToDelete = signal<AdminCategory | null>(null);

  readonly stats = computed<CategoryStatsSummary>(() => {
    const list = this.categories();
    return {
      totalCategories: list.length,
      activeCategories: list.filter((c) => c.status === 'active').length,
      inactiveCategories: list.filter((c) => c.status === 'inactive').length,
      totalProducts: list.reduce((acc, c) => acc + c.productCount, 0),
    };
  });

  readonly filteredCategories = computed<readonly AdminCategory[]>(() => {
    const query = this.searchQuery().trim().toLowerCase();
    const status = this.statusFilter();
    const sort = this.sortBy();
    const list = this.categories();

    const filtered = list.filter((cat) => {
      if (status !== 'all' && cat.status !== status) {
        return false;
      }

      if (!query) {
        return true;
      }

      const matchesName = cat.name.toLowerCase().includes(query);
      const matchesDesc = (cat.description || '').toLowerCase().includes(query);
      const matchesId = cat.id.toLowerCase().includes(query);

      return matchesName || matchesDesc || matchesId;
    });

    return [...filtered].sort((a, b) => {
      switch (sort) {
        case 'name-asc':
          return a.name.localeCompare(b.name, 'es', { sensitivity: 'base' });
        case 'name-desc':
          return b.name.localeCompare(a.name, 'es', { sensitivity: 'base' });
        case 'products-desc':
          return b.productCount - a.productCount;
        case 'recent':
          return b.createdAt.getTime() - a.createdAt.getTime();
      }
    });
  });

  constructor() {
    this.loadCategories();
  }

  loadCategories(): void {
    this.status.set('loading');
    this.errorMessage.set(null);

    this.repository.getCategories().subscribe({
      next: (data) => {
        this.categories.set(data);
        this.status.set('ready');
      },
      error: () => {
        this.status.set('error');
        this.errorMessage.set('No se pudo cargar la lista de categorías. Por favor, reintente nuevamente.');
      },
    });
  }

  openCreateModal(): void {
    this.selectedCategoryForEdit.set(null);
    this.isFormModalOpen.set(true);
    this.actionMessage.set(null);
  }

  openEditModal(category: AdminCategory): void {
    this.selectedCategoryForEdit.set(category);
    this.isFormModalOpen.set(true);
    this.actionMessage.set(null);
  }

  closeFormModal(): void {
    this.isFormModalOpen.set(false);
    this.selectedCategoryForEdit.set(null);
  }

  openDeleteConfirm(category: AdminCategory): void {
    this.categoryToDelete.set(category);
    this.actionMessage.set(null);
  }

  closeDeleteConfirm(): void {
    this.categoryToDelete.set(null);
  }

  saveCategory(data: CategoryFormData, id?: string, onSuccess?: () => void): void {
    this.isProcessing.set(true);
    this.actionMessage.set(null);

    if (id) {
      // Update existing
      this.repository.updateCategory(id, data).subscribe({
        next: (updatedCategory) => {
          this.categories.update((prev) =>
            prev.map((c) => (c.id === id ? updatedCategory : c)),
          );
          this.isProcessing.set(false);
          this.closeFormModal();
          this.actionMessage.set({
            type: 'success',
            text: `¡Categoría "${updatedCategory.name}" actualizada con éxito!`,
          });
          onSuccess?.();
        },
        error: (err) => {
          this.isProcessing.set(false);
          this.actionMessage.set({
            type: 'error',
            text: err?.message || 'Error al actualizar la categoría. Verifique los datos.',
          });
        },
      });
    } else {
      // Create new
      this.repository.createCategory(data).subscribe({
        next: (newCategory) => {
          this.categories.update((prev) => [newCategory, ...prev]);
          this.isProcessing.set(false);
          this.closeFormModal();
          this.actionMessage.set({
            type: 'success',
            text: `¡Categoría "${newCategory.name}" creada exitosamente!`,
          });
          onSuccess?.();
        },
        error: (err) => {
          this.isProcessing.set(false);
          this.actionMessage.set({
            type: 'error',
            text: err?.message || 'Error al crear la categoría. Verifique que no exista duplicada.',
          });
        },
      });
    }
  }

  toggleCategoryStatus(category: AdminCategory): void {
    const nextStatus: CategoryStatus = category.status === 'active' ? 'inactive' : 'active';
    this.isProcessing.set(true);

    const formData: CategoryFormData = {
      name: category.name,
      description: category.description || '',
      icon: category.icon,
      color: category.color,
      status: nextStatus,
    };

    this.repository.updateCategory(category.id, formData).subscribe({
      next: (updated) => {
        this.categories.update((prev) =>
          prev.map((c) => (c.id === category.id ? updated : c)),
        );
        this.isProcessing.set(false);
        const actionLabel = nextStatus === 'active' ? 'activada' : 'desactivada';
        this.actionMessage.set({
          type: 'success',
          text: `Categoría "${updated.name}" ${actionLabel} correctamente.`,
        });
      },
      error: (err) => {
        this.isProcessing.set(false);
        this.actionMessage.set({
          type: 'error',
          text: err?.message || 'No se pudo cambiar el estado de la categoría.',
        });
      },
    });
  }

  deleteCategory(id: string, onSuccess?: () => void): void {
    this.isProcessing.set(true);
    this.actionMessage.set(null);

    const targetCategory = this.categories().find((c) => c.id === id);
    const categoryName = targetCategory?.name || 'Categoría';

    this.repository.deleteCategory(id).subscribe({
      next: () => {
        this.categories.update((prev) => prev.filter((c) => c.id !== id));
        this.isProcessing.set(false);
        this.closeDeleteConfirm();
        this.actionMessage.set({
          type: 'success',
          text: `¡Categoría "${categoryName}" eliminada correctamente del sistema!`,
        });
        onSuccess?.();
      },
      error: (err) => {
        this.isProcessing.set(false);
        this.actionMessage.set({
          type: 'error',
          text: err?.message || 'Ocurrió un error al intentar eliminar la categoría.',
        });
      },
    });
  }

  dismissActionMessage(): void {
    this.actionMessage.set(null);
  }

  setSearchQuery(query: string): void {
    this.searchQuery.set(query);
  }

  setStatusFilter(status: CategoryStatus | 'all'): void {
    this.statusFilter.set(status);
  }

  setSortBy(sort: CategorySortOption): void {
    this.sortBy.set(sort);
  }

  resetFilters(): void {
    this.searchQuery.set('');
    this.statusFilter.set('all');
    this.sortBy.set('name-asc');
  }
}
