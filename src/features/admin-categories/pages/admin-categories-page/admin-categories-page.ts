import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Icon } from '../../../../shared/components/icon/icon';
import { AdminCategory } from '../../models/admin-category.model';
import { AdminCategoryService } from '../../services/admin-category.service';

@Component({
  selector: 'app-admin-categories-page',
  imports: [FormsModule, RouterLink, Icon],
  templateUrl: './admin-categories-page.html',
  host: { class: 'block' },
})
export class AdminCategoriesPage {
  protected readonly service = inject(AdminCategoryService);

  readonly isFormOpen = signal(false);
  readonly editingCategory = signal<AdminCategory | null>(null);
  readonly deletingCategory = signal<AdminCategory | null>(null);
  readonly nameInput = signal('');
  readonly touched = signal(false);

  protected isNameValid(): boolean {
    const trimmed = this.nameInput().trim();
    return trimmed.length >= 2 && trimmed.length <= 50 && /^[\p{L}\s]+$/u.test(trimmed);
  }

  protected getNameError(): string | null {
    if (!this.touched()) return null;
    const trimmed = this.nameInput().trim();
    if (!trimmed) return 'El nombre de la categoría es obligatorio.';
    if (trimmed.length < 2) return 'El nombre debe tener al menos 2 caracteres.';
    if (trimmed.length > 50) return 'El nombre no puede exceder 50 caracteres.';
    if (!/^[\p{L}\s]+$/u.test(trimmed)) return 'Solo se permiten letras y espacios.';
    return null;
  }

  protected openCreate(): void {
    this.editingCategory.set(null);
    this.nameInput.set('');
    this.touched.set(false);
    this.isFormOpen.set(true);
  }

  protected openEdit(category: AdminCategory): void {
    this.editingCategory.set(category);
    this.nameInput.set(category.name);
    this.touched.set(false);
    this.isFormOpen.set(true);
  }

  protected closeForm(): void {
    this.isFormOpen.set(false);
    this.editingCategory.set(null);
  }

  protected onSave(): void {
    this.touched.set(true);
    if (!this.isNameValid()) return;

    const name = this.nameInput().trim();
    const current = this.editingCategory();

    if (current) {
      this.service.update(current.id, name, () => this.closeForm());
    } else {
      this.service.create(name, () => this.closeForm());
    }
  }

  protected openDelete(category: AdminCategory): void {
    this.deletingCategory.set(category);
  }

  protected closeDelete(): void {
    this.deletingCategory.set(null);
  }

  protected onConfirmDelete(): void {
    const target = this.deletingCategory();
    if (target) {
      this.service.delete(target.id, () => this.closeDelete());
    }
  }

  protected onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.service.searchQuery.set(input.value);
  }
}
