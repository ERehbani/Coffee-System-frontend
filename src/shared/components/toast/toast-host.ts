import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Icon } from '../icon/icon';
import { ToastKind, ToastService } from './toast.service';

@Component({
  selector: 'app-toast-host',
  imports: [RouterLink, Icon],
  templateUrl: './toast-host.html',
  styleUrl: './toast-host.css',
})
export class ToastHost {
  protected readonly toastService = inject(ToastService);

  protected readonly tone: Record<ToastKind, string> = {
    success: 'border-emerald-300 bg-emerald-50 text-emerald-900',
    error: 'border-rose-300 bg-rose-50 text-rose-900',
  };
}
