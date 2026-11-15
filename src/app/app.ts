import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavigationProgress } from '../shared/components/navigation-progress/navigation-progress';
import { ThemeSwitchOverlay } from '../shared/components/theme-switch-overlay/theme-switch-overlay';
import { ThemeService } from '../shared/services/theme';

@Component({
  imports: [RouterOutlet, NavigationProgress, ThemeSwitchOverlay],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  private readonly theme = inject(ThemeService);
}
