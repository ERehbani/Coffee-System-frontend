import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { Icon } from '../../../../shared/components/icon/icon';
import { AdminClient, CLIENT_STATUS_LABELS } from '../../types/admin-client.model';

@Component({
  selector: 'app-client-detail-modal',
  imports: [DatePipe, DecimalPipe, Icon],
  templateUrl: './client-detail-modal.html',
  host: { '(document:keydown.escape)': 'close.emit()' },
})
export class ClientDetailModal {
  readonly client = input.required<AdminClient>();

  readonly close = output<void>();

  protected readonly statusLabels = CLIENT_STATUS_LABELS;
}
