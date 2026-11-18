import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ThemeToggle } from '../../../../shared/components/theme-toggle/theme-toggle';

/** Two-panel frame shared by login and register: photo on the left, the projected form on the right. */
@Component({
  selector: 'app-auth-shell',
  imports: [RouterLink, ThemeToggle],
  templateUrl: './auth-shell.html',
  host: { class: 'block' },
})
export class AuthShell {
  readonly heading = input.required<string>();
  readonly linkLabel = input.required<string>();
  readonly linkPath = input.required<string>();

  protected readonly year = new Date().getFullYear();
}
