import { DatePipe } from '@angular/common';
import { Component, HostListener, input, output, signal } from '@angular/core';
import { Icon } from '../../../../shared/components/icon/icon';
import { ActionFeedback } from '../../services/admin-cafe.store';
import { AdminCafe } from '../../types/admin-cafe.model';

@Component({
  selector: 'app-cafe-detail-modal',
  imports: [DatePipe, Icon],
  templateUrl: './cafe-detail-modal.html',
})
export class CafeDetailModal {
  readonly cafe = input.required<AdminCafe>();
  readonly isProcessing = input<boolean>(false);
  readonly actionMessage = input<ActionFeedback | null>(null);

  readonly toggleStatus = output<{ externalId: string; state: boolean }>();
  readonly dismissMessage = output<void>();
  readonly close = output<void>();

  readonly copiedId = signal<boolean>(false);
  readonly confirmingDeactivate = signal<boolean>(false);

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.confirmingDeactivate()) {
      this.confirmingDeactivate.set(false);
      return;
    }
    this.close.emit();
  }

  protected async onCopyId(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.cafe().externalId);
      this.copiedId.set(true);
      setTimeout(() => this.copiedId.set(false), 2000);
    } catch {
      // Fallback if clipboard API is not available
      this.copiedId.set(true);
      setTimeout(() => this.copiedId.set(false), 2000);
    }
  }

  protected onRequestDeactivate(): void {
    this.confirmingDeactivate.set(true);
  }

  protected onConfirmDeactivate(): void {
    this.confirmingDeactivate.set(false);
    this.toggleStatus.emit({ externalId: this.cafe().externalId, state: false });
  }

  protected onCancelDeactivate(): void {
    this.confirmingDeactivate.set(false);
  }

  protected onReactivate(): void {
    this.toggleStatus.emit({ externalId: this.cafe().externalId, state: true });
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
