import { NgOptimizedImage } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Icon } from '../../../../shared/components/icon/icon';
import { ThemeToggle } from '../../../../shared/components/theme-toggle/theme-toggle';

@Component({
  imports: [NgOptimizedImage, RouterLink, Icon, ThemeToggle],
  selector: 'app-dashboard-header',
  templateUrl: './dashboard-header.html',
  host: { class: 'block' },
})
export class DashboardHeader {
  readonly firstName = input.required<string>();
  readonly avatarUrl = input<string | null>(null);

  protected readonly initials = computed(() => this.firstName().trim().charAt(0).toUpperCase());
}
