import { NgOptimizedImage } from '@angular/common';
import { Component, computed, input } from '@angular/core';

@Component({
  imports: [NgOptimizedImage],
  selector: 'app-dashboard-header',
  templateUrl: './dashboard-header.html',
  host: { class: 'block' },
})
export class DashboardHeader {
  readonly firstName = input.required<string>();
  readonly avatarUrl = input<string | null>(null);

  protected readonly initials = computed(() => this.firstName().trim().charAt(0).toUpperCase());
}
