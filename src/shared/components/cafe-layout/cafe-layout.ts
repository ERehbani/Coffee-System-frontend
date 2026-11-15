import { Component, ElementRef, computed, inject, signal, viewChild } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { LogoutButton } from '../../../features/auth/components/logout-button/logout-button';
import { AuthService } from '../../../features/auth/services/auth.service';
import { Icon } from '../icon/icon';
import { ThemeToggle } from '../theme-toggle/theme-toggle';
import { CAFE_NAV_ITEMS } from './cafe-nav';

@Component({
  imports: [RouterLink, RouterLinkActive, RouterOutlet, Icon, LogoutButton, ThemeToggle],
  selector: 'app-cafe-layout',
  templateUrl: './cafe-layout.html',
  host: {
    class: 'block min-h-dvh bg-bg text-text',
    '(document:keydown.escape)': 'onEscape()',
  },
})
export class CafeLayout {
  private readonly auth = inject(AuthService);

  protected readonly items = CAFE_NAV_ITEMS;
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
