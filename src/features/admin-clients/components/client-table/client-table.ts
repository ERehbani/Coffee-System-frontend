import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { AdminClientStoreStatus } from '../../services/admin-client.store';
import { AdminClient, CLIENT_STATUS_LABELS } from '../../types/admin-client.model';

@Component({
  selector: 'app-client-table',
  imports: [DatePipe, DecimalPipe],
  templateUrl: './client-table.html',
})
export class ClientTable {
  readonly clients = input.required<readonly AdminClient[]>();
  readonly status = input<AdminClientStoreStatus>('ready');

  readonly selectClient = output<AdminClient>();

  protected readonly skeletonRows = [1, 2, 3, 4, 5];
  protected readonly statusLabels = CLIENT_STATUS_LABELS;

  protected onRowKeyDown(event: KeyboardEvent, client: AdminClient): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.selectClient.emit(client);
    }
  }
}
