import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { FormField, form, minLength, pattern, required } from '@angular/forms/signals';
import { Icon } from '../../../../shared/components/icon/icon';
import { backendErrorMessage } from '../../../../shared/utils/backend-error';
import { AuthService } from '../../services/auth.service';

interface PasswordChange {
  currentPassword: string;
  newPassword: string;
  confirmation: string;
}

const EMPTY_PASSWORDS: PasswordChange = { currentPassword: '', newPassword: '', confirmation: '' };
const PASSWORD_RULE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/;

export const PASSWORD_CHANGED_MESSAGE =
  'Listo, cambiaste tu contraseña. La próxima vez que inicies sesión usá la nueva.';
export const SESSION_EXPIRED_MESSAGE =
  'Tu sesión expiró. Volvé a iniciar sesión para cambiar la contraseña.';
export const SERVER_ERROR_MESSAGE =
  'No pudimos cambiar la contraseña. Probá de nuevo en unos minutos.';

const STATUSES_WITH_SPANISH_DETAIL: readonly number[] = [
  HttpStatusCode.BadRequest,
  HttpStatusCode.UnprocessableEntity,
];

function toErrorMessage(error: unknown): string {
  if (!(error instanceof HttpErrorResponse)) {
    return SERVER_ERROR_MESSAGE;
  }
  if (error.status === HttpStatusCode.Unauthorized) {
    return SESSION_EXPIRED_MESSAGE;
  }
  if (STATUSES_WITH_SPANISH_DETAIL.includes(error.status)) {
    return backendErrorMessage(error) ?? SERVER_ERROR_MESSAGE;
  }
  return SERVER_ERROR_MESSAGE;
}

@Component({
  selector: 'app-change-password-page',
  imports: [FormField, Icon],
  templateUrl: './change-password-page.html',
  host: { class: 'block' },
})
export class ChangePasswordPage {
  private readonly auth = inject(AuthService);

  readonly passwords = signal<PasswordChange>({ ...EMPTY_PASSWORDS });
  readonly passwordForm = form(this.passwords, (field) => {
    required(field.currentPassword, { message: 'Ingresá tu contraseña actual.' });
    required(field.newPassword, { message: 'Ingresá la contraseña nueva.' });
    minLength(field.newPassword, 6, {
      message: 'La contraseña nueva debe tener al menos 6 caracteres.',
    });
    pattern(field.newPassword, PASSWORD_RULE, {
      message: 'Debe incluir al menos una mayúscula, una minúscula y un número.',
    });
    required(field.confirmation, { message: 'Repetí la contraseña nueva.' });
  });

  readonly attemptedSubmit = signal(false);
  readonly isSubmitting = signal(false);
  readonly showPasswords = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);

  readonly currentPasswordError = computed(
    () => this.passwordForm.currentPassword().errors()[0]?.message ?? null,
  );
  readonly newPasswordError = computed(
    () => this.passwordForm.newPassword().errors()[0]?.message ?? null,
  );
  readonly confirmationError = computed(() => {
    const formError = this.passwordForm.confirmation().errors()[0]?.message;
    if (formError) {
      return formError;
    }
    const { newPassword, confirmation } = this.passwords();
    return newPassword === confirmation ? null : 'Las contraseñas no coinciden.';
  });

  onSubmit(event: Event): void {
    event.preventDefault();
    this.attemptedSubmit.set(true);

    if (this.passwordForm().invalid() || this.confirmationError() || this.isSubmitting()) {
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    const { currentPassword, newPassword } = this.passwords();
    this.auth.changePassword({ currentPassword, newPassword }).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.attemptedSubmit.set(false);
        this.passwords.set({ ...EMPTY_PASSWORDS });
        this.successMessage.set(PASSWORD_CHANGED_MESSAGE);
      },
      error: (error: unknown) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(toErrorMessage(error));
      },
    });
  }

  toggleShowPasswords(): void {
    this.showPasswords.update((visible) => !visible);
  }
}
