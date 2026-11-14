import { Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { PendingRequests } from '../../services/pending-requests';

@Component({
  selector: 'app-navigation-progress',
  templateUrl: './navigation-progress.html',
  styleUrl: './navigation-progress.css',
})
export class NavigationProgress {
  private readonly router = inject(Router);
  private readonly pendingRequests = inject(PendingRequests);

  readonly isLoading = computed(
    () => this.router.currentNavigation() !== null || this.pendingRequests.hasPending(),
  );
}
