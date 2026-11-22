import { formatOpeningHours } from '../../../../shared/utils/opening-hours';
import { DecimalPipe } from '@angular/common';
import { Component, computed, input, output, signal } from '@angular/core';
import { Icon } from '../../../../shared/components/icon/icon';
import { Cafe } from '../../../home/model/cafe.model';

@Component({
  selector: 'app-cafe-detail-modal',
  imports: [Icon, DecimalPipe],
  templateUrl: './cafe-detail-modal.html',
  styleUrl: './cafe-detail-modal.css',
  host: {
    '(document:keydown.escape)': 'onEscape()',
  },
})
export class CafeDetailModal {
  readonly formatHours = formatOpeningHours;

  readonly cafe = input<Cafe | null>(null);
  readonly busy = input(false);
  readonly close = output<void>();
  readonly edit = output<Cafe>();
  readonly deactivate = output<Cafe>();
  readonly reactivate = output<Cafe>();

  readonly isConfirmingDeactivation = signal(false);

  isActive = computed(() => Boolean(this.cafe()?.state));

  onEscape(): void {
    if (this.cafe() !== null) {
      this.onClose();
    }
  }

  onClose(): void {
    this.isConfirmingDeactivation.set(false);
    this.close.emit();
  }

  askDeactivation(): void {
    this.isConfirmingDeactivation.set(true);
  }

  cancelDeactivation(): void {
    this.isConfirmingDeactivation.set(false);
  }

  confirmDeactivation(cafe: Cafe): void {
    this.isConfirmingDeactivation.set(false);
    this.deactivate.emit(cafe);
  }
}
