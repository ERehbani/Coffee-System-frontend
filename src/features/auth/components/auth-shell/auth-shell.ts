import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ThemeToggle } from '../../../../shared/components/theme-toggle/theme-toggle';

export interface AuthPanel {
  image: string;
  tagline: string;
  title: readonly string[];
  fullScreen: boolean;
}

export const CLIENT_PANEL: AuthPanel = {
  image: '/auth/coffee-panel.jpg',
  tagline: 'Sumá puntos en tus cafeterías favoritas y canjealos por beneficios.',
  title: ['Cada café', 'suma puntos'],
  fullScreen: false,
};

/** Two-panel frame shared by login and register: photo on the left, the projected form on the right. */
@Component({
  selector: 'app-auth-shell',
  imports: [RouterLink, ThemeToggle],
  templateUrl: './auth-shell.html',
  host: { class: 'block' },
})
export class AuthShell {
  readonly heading = input.required<string>();
  readonly linkLabel = input<string>();
  readonly linkPath = input<string>();
  readonly panel = input<AuthPanel>(CLIENT_PANEL);

  protected readonly year = new Date().getFullYear();
}
