import { Component, computed, inject, input, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Icon } from '../../../../shared/components/icon/icon';
import { CartService } from '../../../cart/services/cart.service';
import { AuthService } from '../../services/auth.service';
import { getLoginForRoles } from '../../utils/role-home';

export type LogoutButtonAppearance = 'ghost' | 'row';

const FOCUS = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary';

const APPEARANCES: Readonly<Record<LogoutButtonAppearance, string>> = {
  ghost: `cursor-pointer inline-flex items-center gap-2 rounded-md px-2.5 py-2 text-sm font-medium text-muted transition-colors hover:bg-bg hover:text-text select-none disabled:cursor-not-allowed disabled:opacity-60 ${FOCUS}`,
  // A settings-list row: the danger tint is what sets the exit action apart from its neighbours.
  row: 'list-row list-row-danger select-none disabled:cursor-not-allowed disabled:opacity-60',
};

@Component({
  selector: 'app-logout-button',
  imports: [Icon],
  templateUrl: './logout-button.html',
})
export class LogoutButton {
  private readonly auth = inject(AuthService);
  private readonly cart = inject(CartService);
  private readonly router = inject(Router);

  readonly appearance = input<LogoutButtonAppearance>('ghost');

  protected readonly isLoggingOut = signal(false);
  protected readonly buttonClass = computed(() => APPEARANCES[this.appearance()]);

  protected logout(): void {
    this.isLoggingOut.set(true);
    // logout() clears the session, so the role has to be read first
    const loginPath = getLoginForRoles(this.auth.roles());
    // The cart is kept in this browser: the next account must not find the products of this one.
    this.cart.clearLocal();
    this.auth.logout().subscribe(() => this.router.navigateByUrl(loginPath));
  }
}
