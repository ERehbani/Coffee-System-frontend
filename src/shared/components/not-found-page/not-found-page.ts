import { Location } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../features/auth/services/auth.service';
import { getHomeForRoles } from '../../../features/auth/utils/role-home';

@Component({
  selector: 'app-not-found-page',
  imports: [RouterLink],
  templateUrl: './not-found-page.html',
  host: { class: 'block' },
})
export class NotFoundPage {
  private readonly auth = inject(AuthService);
  private readonly location = inject(Location);

  protected readonly path = inject(Router).url;
  protected readonly homeLink = computed(() => getHomeForRoles(this.auth.roles()));
  protected readonly homeLabel = computed(() =>
    this.auth.isAuthenticated() ? 'Ir al inicio' : 'Iniciar sesión',
  );

  constructor() {
    this.auth.loadSession().subscribe();
  }

  protected goBack(): void {
    this.location.back();
  }
}
