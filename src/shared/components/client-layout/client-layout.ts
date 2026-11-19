import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BottomNav } from '../bottom-nav/bottom-nav';
import { ToastHost } from '../toast/toast-host';

@Component({
  imports: [RouterOutlet, BottomNav, ToastHost],
  selector: 'app-client-layout',
  templateUrl: './client-layout.html',
  host: { class: 'block min-h-dvh bg-bg text-text' },
})
export class ClientLayout {}
