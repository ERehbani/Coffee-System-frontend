import { DatePipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { Icon } from '../../../../shared/components/icon/icon';
import { QrCode } from '../../../../shared/components/qr-code/qr-code';
import { ProfileStore } from '../../services/profile.store';
import { toExpiryLabel } from '../../utils/redemption-expiry';

@Component({
  imports: [DatePipe, RouterLink, Icon, QrCode],
  selector: 'app-redemption-detail-page',
  templateUrl: './redemption-detail-page.html',
  host: { class: 'block' },
})
export class RedemptionDetailPage {
  protected readonly store = inject(ProfileStore);

  private readonly redemptionId = toSignal(
    inject(ActivatedRoute).paramMap.pipe(map((params) => params.get('id'))),
    { initialValue: null },
  );

  protected readonly redemption = computed(
    () => this.store.activeRedemptions().find(({ id }) => id === this.redemptionId()) ?? null,
  );

  protected readonly expiryLabel = computed(() => {
    const redemption = this.redemption();
    return redemption?.daysUntilExpiry == null ? '' : toExpiryLabel(redemption.daysUntilExpiry);
  });
}
