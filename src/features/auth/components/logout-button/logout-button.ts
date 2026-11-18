import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LOGIN_PATH } from '../../utils/role-home';

@Component({
  selector: 'app-logout-button',
  imports: [],
  templateUrl: './logout-button.html',
})
export class LogoutButton {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly isLoggingOut = signal(false);

  protected logout(): void {
    this.isLoggingOut.set(true);
    this.auth.logout().subscribe(() => this.router.navigateByUrl(LOGIN_PATH));
  }
}
