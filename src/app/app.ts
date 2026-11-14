import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavigationProgress } from '../shared/components/navigation-progress/navigation-progress';

@Component({
  imports: [RouterOutlet, NavigationProgress],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {}
