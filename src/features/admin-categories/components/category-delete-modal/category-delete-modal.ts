import { Component, HostListener, input, output } from '@angular/core';
import { Icon } from '../../../../shared/components/icon/icon';
import { AdminCategory } from '../../types/admin-category.model';

@Component({
  selector: 'app-category-delete-modal',
  imports: [Icon],
  templateUrl: './category-delete-modal.html',
})
export class CategoryDeleteModal {
  readonly category = input.required<AdminCategory>();
  readonly isProcessing = input<boolean>(false);

  readonly confirmDelete = output<string>();
  readonly close = output<void>();

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (!this.isProcessing()) {
      this.close.emit();
    }
  }

  protected onConfirm(): void {
    if (!this.isProcessing()) {
      this.confirmDelete.emit(this.category().id);
    }
  }
}
