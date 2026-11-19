import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Icon } from '../../../../shared/components/icon/icon';
import { AuthService } from '../../services/auth.service';
import { getLoginForRoles } from '../../utils/role-home';

@Component({
  selector: 'app-logout-button',
  imports: [Icon],
  templateUrl: './logout-button.html',
})
export class LogoutButton {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly isLoggingOut = signal(false);

  protected logout(): void {
    this.isLoggingOut.set(true);
    // logout() clears the session, so the role has to be read first
    const loginPath = getLoginForRoles(this.auth.roles());
    this.auth.logout().subscribe(() => this.router.navigateByUrl(loginPath));
  }
}
