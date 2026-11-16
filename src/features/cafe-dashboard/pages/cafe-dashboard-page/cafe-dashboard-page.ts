import { CurrencyPipe, DecimalPipe, NgTemplateOutlet } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { Icon } from '../../../../shared/components/icon/icon';
import { IconName } from '../../../../shared/components/icon/icon-registry';
import { hoursOfToday } from '../../../../shared/utils/opening-hours';
import { HttpCafeProfileRepository } from '../../../cafe-profile/services/http-cafe-profile.repository';
import { CafeProfile } from '../../../cafe-profile/types/cafe-profile.model';
import { CafeDashboardService } from '../../services/cafe-dashboard.service';
import { CafeDashboard } from '../../types/cafe-dashboard.model';

interface StatCard {
  readonly label: string;
  readonly value: number;
  readonly icon: IconName;
  readonly link: string | null;
}

@Component({
  selector: 'app-cafe-dashboard-page',
  imports: [CurrencyPipe, DecimalPipe, NgTemplateOutlet, Icon, RouterLink],
  templateUrl: './cafe-dashboard-page.html',
  host: { class: 'block' },
})
export class CafeDashboardPage implements OnInit {
  private readonly dashboardService = inject(CafeDashboardService);
  private readonly profileRepository = inject(HttpCafeProfileRepository);

  readonly profile = signal<CafeProfile | null>(null);
  readonly dashboard = signal<CafeDashboard | null>(null);
  readonly status = signal<'loading' | 'ready' | 'error'>('loading');

  readonly todayHours = computed(() => hoursOfToday(this.profile()?.openingHours));

  readonly cards = computed<StatCard[]>(() => {
    const data = this.dashboard();
    if (!data) {
      return [];
    }
    return [
      { label: 'Productos a la venta', value: data.activeProducts, icon: 'coffee', link: '/cafe/products' },
      { label: 'Agotados hoy', value: data.soldOutProducts, icon: 'clock', link: '/cafe/products' },
      { label: 'Beneficios activos', value: data.activeBenefits, icon: 'ticket', link: '/cafe/benefits' },
      { label: 'Cupones validados hoy', value: data.redemptionsToday, icon: 'scan-qr-code', link: '/cafe/validate' },
      { label: 'Compras de hoy', value: data.purchasesToday, icon: 'shopping-bag', link: null },
      { label: 'Puntos otorgados hoy', value: data.pointsAwardedToday, icon: 'star', link: null },
    ];
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.status.set('loading');
    forkJoin({
      profile: this.profileRepository.getProfile(),
      dashboard: this.dashboardService.getMine(),
    }).subscribe({
      next: ({ profile, dashboard }) => {
        this.profile.set(profile);
        this.dashboard.set(dashboard);
        this.status.set('ready');
      },
      error: () => this.status.set('error'),
    });
  }
}
