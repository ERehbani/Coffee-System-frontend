import { DecimalPipe, NgOptimizedImage } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { Icon } from '../../../../shared/components/icon/icon';

@Component({
  imports: [DecimalPipe, NgOptimizedImage, Icon],
  selector: 'app-dashboard-header',
  templateUrl: './dashboard-header.html',
  host: { class: 'block' },
})
export class DashboardHeader {
  readonly firstName = input.required<string>();
  readonly avatarUrl = input<string | null>(null);
  readonly availablePoints = input.required<number>();

  protected readonly initials = computed(() => this.firstName().trim().charAt(0).toUpperCase());
}
