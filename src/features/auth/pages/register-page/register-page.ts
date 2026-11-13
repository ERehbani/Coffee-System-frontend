import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { FormField, email, form, minLength, pattern, required } from '@angular/forms/signals';
import { Router, RouterLink } from '@angular/router';
import { Icon } from '../../../../shared/components/icon/icon';
import { AuthService } from '../../services/auth.service';
import { RegisterRequest } from '../../types/auth.model';
import { ACCOUNT_CREATED_REASON, LOGIN_PATH } from '../../utils/role-home';

const EMAIL_TAKEN_MESSAGE = 'Ya existe una cuenta con ese correo electrónico.';
const INVALID_DATA_MESSAGE = 'Revisá los datos ingresados e intentá de nuevo.';
const SERVER_ERROR_MESSAGE = 'No pudimos conectar con el servidor. Probá de nuevo en unos minutos.';

function toErrorMessage(error: unknown): string {
  if (!(error instanceof HttpErrorResponse)) {
    return SERVER_ERROR_MESSAGE;
  }
  if (error.status === HttpStatusCode.Conflict) {
    return EMAIL_TAKEN_MESSAGE;
  }
  if (error.status === HttpStatusCode.BadRequest) {
    return INVALID_DATA_MESSAGE;
  }
  return SERVER_ERROR_MESSAGE;
}

@Component({
  selector: 'app-register-page',
  imports: [FormField, Icon, RouterLink],
  templateUrl: './register-page.html',
  host: { class: 'block' },
})
export class RegisterPage {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly loginPath = LOGIN_PATH;

  readonly account = signal<RegisterRequest>({ name: '', email: '', password: '' });
  readonly registerForm = form(this.account, (field) => {
    required(field.name, { message: 'El nombre es obligatorio.' });
    pattern(field.name, /\S/, { message: 'El nombre es obligatorio.' });
    required(field.email, { message: 'El correo electrónico es obligatorio.' });
    email(field.email, { message: 'Ingresá un correo electrónico válido.' });
    required(field.password, { message: 'La contraseña es obligatoria.' });
    minLength(field.password, 6, { message: 'La contraseña debe tener al menos 6 caracteres.' });
    pattern(field.password, /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, {
      message: 'Debe incluir al menos una mayúscula, una minúscula y un número.',
    });
  });

  readonly attemptedSubmit = signal(false);
  readonly isSubmitting = signal(false);
  readonly showPassword = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly nameError = computed(() => this.registerForm.name().errors()[0]?.message ?? null);
  readonly emailError = computed(() => this.registerForm.email().errors()[0]?.message ?? null);
  readonly passwordError = computed(() => this.registerForm.password().errors()[0]?.message ?? null);

  onSubmit(event: Event): void {
    event.preventDefault();
    this.attemptedSubmit.set(true);

    if (this.registerForm().invalid() || this.isSubmitting()) {
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    this.auth.register(this.account()).subscribe({
      next: () => this.goToLogin(),
      error: (error: unknown) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(toErrorMessage(error));
      },
    });
  }

  toggleShowPassword(): void {
    this.showPassword.update((visible) => !visible);
  }

  private goToLogin(): void {
    this.router.navigate([LOGIN_PATH], { queryParams: { reason: ACCOUNT_CREATED_REASON } });
  }
}
