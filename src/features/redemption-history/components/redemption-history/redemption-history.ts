import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Icon } from '../../../../shared/components/icon/icon';
import { Redemption } from '../../../redemption-detail/model/redemption.model';
import { RedemptionService } from '../../../redemption-detail/services/redemption.service';

@Component({
  selector: 'app-redemption-history',
  imports: [DatePipe, DecimalPipe, RouterLink, Icon],
  templateUrl: './redemption-history.html',
  styleUrl: './redemption-history.css',
  host: { class: 'block' },
})
export class RedemptionHistory implements OnInit {
  private redemptionService = inject(RedemptionService);

  redemptions = signal<Redemption[]>([]);
  isLoading = signal(true);
  hasError = signal(false);

  usedCount = computed(() => this.redemptions().length);

  totalUsedPoints = computed(() => {
    return this.redemptions().reduce((total, redemption) => total + redemption.usedPoints, 0);
  });

  ngOnInit(): void {
    this.loadRedemptions();
  }

  loadRedemptions(): void {
    this.isLoading.set(true);
    this.hasError.set(false);

    this.redemptionService.getUsedRedemptions().subscribe({
      next: (data) => {
        this.redemptions.set(this.sortNewestFirst(data));
        this.isLoading.set(false);
      },
      error: () => {
        this.hasError.set(true);
        this.isLoading.set(false);
      },
    });
  }

  getCafeLabel(cafeName: string | null): string {
    if (!cafeName || cafeName === 'Global') {
      return 'Todas las cafeterías';
    }
    return cafeName;
  }

  private sortNewestFirst(redemptions: Redemption[]): Redemption[] {
    const time = (redemption: Redemption) => new Date(redemption.usedDate ?? redemption.date).getTime();
    return [...redemptions].sort((a, b) => time(b) - time(a));
  }
}
