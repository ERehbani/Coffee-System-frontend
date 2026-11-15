import { Component, computed, inject } from '@angular/core';
import { ThemeService } from '../../services/theme';
import { Icon } from '../icon/icon';

@Component({
  selector: 'app-theme-switch-overlay',
  imports: [Icon],
  template: `
    @if (target(); as theme) {
      <div
        role="status"
        aria-live="polite"
        class="theme-overlay fixed inset-0 z-[100] flex flex-col items-center justify-center gap-4 bg-bg/85 backdrop-blur-sm"
      >
        <span
          class="theme-overlay-icon flex size-20 items-center justify-center rounded-full bg-surface text-primary shadow-xl"
        >
          <app-icon [name]="theme === 'dark' ? 'moon' : 'sun'" [size]="40" />
        </span>
        <p class="text-sm font-semibold text-text">{{ message() }}</p>
      </div>
    }
  `,
})
export class ThemeSwitchOverlay {
  private readonly themeService = inject(ThemeService);

  protected readonly target = this.themeService.switchingTo;
  protected readonly message = computed(() =>
    this.target() === 'dark' ? 'Activando modo nocturno…' : 'Activando modo claro…',
  );
}
