import { DatePipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Icon } from '../../../../shared/components/icon/icon';
import { QrCode } from '../../../../shared/components/qr-code/qr-code';
import { calendarDaysUntil } from '../../../profile/utils/loyalty-progress';
import { toExpiryLabel } from '../../../profile/utils/redemption-expiry';
import { Redemption } from '../../model/redemption.model';
import { RedemptionService } from '../../services/redemption.service';

@Component({
  selector: 'app-redemption-detail',
  imports: [DatePipe, RouterLink, Icon, QrCode],
  templateUrl: './redemption-detail.html',
  styleUrl: './redemption-detail.css',
  host: { class: 'block' },
})
export class RedemptionDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private redemptionService = inject(RedemptionService);

  redemption = signal<Redemption | null>(null);
  isLoading = signal(true);
  hasError = signal(false);

  isReadyToUse = computed(() => this.redemption()?.state === true);

  cafeLabel = computed(() => {
    const cafeName = this.redemption()?.cafeName;
    if (!cafeName || cafeName === 'Global') {
      return 'Válido en todas las cafeterías';
    }
    return `Válido en ${cafeName}`;
  });

  conditions = computed(() => {
    const text = this.redemption()?.conditions ?? '';
    return text
      .split('\n')
      .map((condition) => condition.trim())
      .filter((condition) => condition !== '');
  });

  expiryDate = computed(() => {
    const expiresAt = this.redemption()?.expiresAt;
    if (!expiresAt) {
      return null;
    }
    return new Date(`${expiresAt}T00:00:00`);
  });

  expiryLabel = computed(() => {
    const expiryDate = this.expiryDate();
    if (!expiryDate) {
      return '';
    }
    return toExpiryLabel(calendarDaysUntil(expiryDate, new Date()));
  });

  ngOnInit(): void {
    this.loadRedemption();
  }

  loadRedemption(): void {
    const externalId = this.route.snapshot.paramMap.get('id');
    if (!externalId) {
      this.isLoading.set(false);
      return;
    }

    this.isLoading.set(true);
    this.hasError.set(false);

    this.redemptionService.getById(externalId).subscribe({
      next: (data) => {
        this.redemption.set(data ?? null);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('error loading redemption:', error);
        this.hasError.set(true);
        this.isLoading.set(false);
      },
    });
  }
}
