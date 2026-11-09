import { Component, ElementRef, computed, inject, signal, viewChild } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { LogoutButton } from '../../../features/auth/components/logout-button/logout-button';
import { AuthService } from '../../../features/auth/services/auth.service';
import { Icon } from '../icon/icon';
import { ADMIN_NAV_ITEMS } from './admin-nav';

@Component({
  imports: [RouterLink, RouterLinkActive, RouterOutlet, Icon, LogoutButton],
  selector: 'app-admin-layout',
  templateUrl: './admin-layout.html',
  host: {
    class: 'block min-h-dvh bg-bg text-text',
    '(document:keydown.escape)': 'onEscape()',
  },
})
export class AdminLayout {
  private readonly auth = inject(AuthService);

  protected readonly items = ADMIN_NAV_ITEMS;
  protected readonly menuOpen = signal(false);
  protected readonly canOpenClientApp = computed(() => this.auth.hasRole('ROLE_CLIENTE'));

  private readonly menuButton = viewChild.required<ElementRef<HTMLButtonElement>>('menuButton');

  protected toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }

  protected closeMenu(): void {
    this.menuOpen.set(false);
  }

  protected onEscape(): void {
    if (!this.menuOpen()) {
      return;
    }
    this.closeMenu();
    this.menuButton().nativeElement.focus();
  }
}
