import { Component, afterNextRender, computed, inject, input, signal } from '@angular/core';
import { ThemeService } from '../../services/theme';
import { Icon } from '../icon/icon';

export type ThemeToggleAppearance = 'plain' | 'card' | 'pill';

const FOCUS = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary';

const APPEARANCES: Readonly<Record<ThemeToggleAppearance, string>> = {
  plain: 'size-9 rounded-lg text-muted hover:bg-bg hover:text-text',
  card: 'size-11 rounded-2xl border border-border bg-surface text-primary shadow-xs hover:border-primary hover:bg-accent-light/40',
  pill: 'size-8 rounded-full border border-border bg-surface text-muted shadow-2xs hover:border-primary hover:text-text',
};

@Component({
  selector: 'app-theme-toggle',
  imports: [Icon],
  template: `
    <button
      type="button"
      (click)="theme.toggle()"
      [attr.aria-label]="label()"
      [attr.aria-pressed]="isDark()"
      [title]="label()"
      [class]="buttonClass()"
    >
      <app-icon [name]="isDark() ? 'sun' : 'moon'" [size]="iconSize()" />
    </button>
  `,
})
export class ThemeToggle {
  readonly appearance = input<ThemeToggleAppearance>('plain');

  protected readonly theme = inject(ThemeService);
  private readonly rendered = signal(false);

  protected readonly isDark = computed(() => this.theme.theme() === 'dark');
  protected readonly label = computed(() => (this.isDark() ? 'Activar modo claro' : 'Activar modo nocturno'));
  protected readonly iconSize = computed(() => (this.appearance() === 'card' ? 20 : this.appearance() === 'pill' ? 15 : 18));
  protected readonly buttonClass = computed(() => {
    const transition = this.rendered() ? 'transition-colors' : '';
    return `inline-flex cursor-pointer items-center justify-center ${transition} ${FOCUS} ${APPEARANCES[this.appearance()]}`;
  });

  constructor() {
    afterNextRender(() => this.rendered.set(true));
  }
}
