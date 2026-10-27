import { Component, computed, input, output } from '@angular/core';
import { Icon } from '../../../../shared/components/icon/icon';
import { Cafe } from '../../../home/model/cafe.model';

@Component({
  selector: 'app-cafe-detail-modal',
  imports: [Icon],
  templateUrl: './cafe-detail-modal.html',
  styleUrl: './cafe-detail-modal.css',
  host: {
    '(document:keydown.escape)': 'onEscape()',
  },
})
export class CafeDetailModal {
  readonly cafe = input<Cafe | null>(null);
  readonly close = output<void>();

  isActive = computed(() => Boolean(this.cafe()?.state));

  onEscape(): void {
    if (this.cafe() !== null) {
      this.close.emit();
    }
  }

  onClose(): void {
    this.close.emit();
  }
}
