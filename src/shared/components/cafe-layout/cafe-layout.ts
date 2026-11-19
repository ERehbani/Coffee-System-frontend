import { Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { LogoutButton } from '../../../features/auth/components/logout-button/logout-button';
import { HttpCafeProfileRepository } from '../../../features/cafe-profile/services/http-cafe-profile.repository';
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
  protected readonly items = CAFE_NAV_ITEMS;
  protected readonly menuOpen = signal(false);
  // The name is not editable by the cafe itself, so reading it once per session is enough.
  protected readonly cafeName = toSignal(
    inject(HttpCafeProfileRepository)
      .getProfile()
      .pipe(
        map((profile) => profile.name),
        catchError(() => of(null)),
      ),
    { initialValue: null },
  );

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
