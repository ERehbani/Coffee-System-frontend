import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { hoursOfToday } from '../../../../shared/utils/opening-hours';
import { HttpCafeProfileRepository } from '../../../cafe-profile/services/http-cafe-profile.repository';
import { CafeProfile } from '../../../cafe-profile/types/cafe-profile.model';
import { OrdersBoard } from '../../components/orders-board/orders-board';

@Component({
  selector: 'app-cafe-dashboard-page',
  imports: [OrdersBoard],
  templateUrl: './cafe-dashboard-page.html',
  host: { class: 'block' },
})
export class CafeDashboardPage implements OnInit {
  private readonly profileRepository = inject(HttpCafeProfileRepository);

  readonly profile = signal<CafeProfile | null>(null);
  readonly status = signal<'loading' | 'ready' | 'error'>('loading');

  readonly todayHours = computed(() => hoursOfToday(this.profile()?.openingHours));

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.status.set('loading');
    this.profileRepository.getProfile().subscribe({
      next: (profile) => {
        this.profile.set(profile);
        this.status.set('ready');
      },
      error: () => this.status.set('error'),
    });
  }
}
