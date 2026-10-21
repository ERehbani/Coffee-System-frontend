import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { Icon } from '../../../../shared/components/icon/icon';
import { AdminClientStore } from '../../services/admin-client.store';
import {
  toAuthProviderLabel,
  toInitials,
  toStatusLabel,
  toTierLabel,
} from '../../utils/admin-user.labels';

@Component({
  selector: 'app-admin-client-detail-page',
  imports: [DatePipe, DecimalPipe, RouterLink, Icon],
  templateUrl: './admin-client-detail-page.html',
  host: { class: 'block' },
})
export class AdminClientDetailPage {
  protected readonly store = inject(AdminClientStore);

  private readonly clientId = toSignal(
    inject(ActivatedRoute).paramMap.pipe(map((params) => params.get('id'))),
    { initialValue: null },
  );

  protected readonly client = computed(() => this.store.findClient(this.clientId()));

  protected readonly toStatusLabel = toStatusLabel;
  protected readonly toTierLabel = toTierLabel;
  protected readonly toAuthProviderLabel = toAuthProviderLabel;
  protected readonly toInitials = toInitials;
}
