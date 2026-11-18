import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';

export type ToastKind = 'success' | 'error';

export interface ToastAction {
  readonly label: string;
  readonly route: string;
}

export interface Toast {
  readonly id: number;
  readonly kind: ToastKind;
  readonly message: string;
  readonly action?: ToastAction;
}

export const TOAST_DURATION_MS: Record<ToastKind, number> = { success: 4000, error: 6000 };

@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly visible = signal<readonly Toast[]>([]);
  private nextId = 0;

  readonly toasts = this.visible.asReadonly();

  success(message: string, action?: ToastAction): void {
    this.show({ kind: 'success', message, action });
  }

  error(message: string): void {
    this.show({ kind: 'error', message });
  }

  dismiss(id: number): void {
    this.visible.update((toasts) => toasts.filter((toast) => toast.id !== id));
  }

  private show(toast: Omit<Toast, 'id'>): void {
    const id = this.nextId++;
    this.visible.update((toasts) => [...toasts, { ...toast, id }]);
    // No one is there to read it on the server, and a pending timer would hold the render.
    if (this.isBrowser) {
      setTimeout(() => this.dismiss(id), TOAST_DURATION_MS[toast.kind]);
    }
  }
}
