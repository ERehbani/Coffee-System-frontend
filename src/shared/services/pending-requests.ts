import { Injectable, computed, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class PendingRequests {
  private readonly count = signal(0);

  readonly hasPending = computed(() => this.count() > 0);

  start(): void {
    this.count.update((count) => count + 1);
  }

  finish(): void {
    this.count.update((count) => Math.max(0, count - 1));
  }
}
