import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { FormField, email, form, required } from '@angular/forms/signals';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Icon } from '../../../../shared/components/icon/icon';
import { SESSION_EXPIRED_REASON } from '../../interceptors/auth.interceptor';
import { AuthService } from '../../services/auth.service';
import { LoginCredentials } from '../../types/auth.model';
import { ACCOUNT_CREATED_REASON, LOGIN_PATH, REGISTER_PATH, getHomeForRoles } from '../../utils/role-home';

const INVALID_CREDENTIALS_MESSAGE = 'El correo o la contraseña son incorrectos.';
const SERVER_ERROR_MESSAGE = 'No pudimos conectar con el servidor. Probá de nuevo en unos minutos.';
const NO_ROLE_MESSAGE = 'Tu usuario no tiene un rol habilitado para ingresar.';
const SESSION_EXPIRED_MESSAGE = 'Tu sesión expiró, volvé a iniciar sesión.';

const ACCOUNT_CREATED_MESSAGE = 'Tu cuenta se creó correctamente. Iniciá sesión para continuar.';

interface ReasonNotice {
  message: string;
  isSuccess: boolean;
}

function toReasonNotice(reason: string | null): ReasonNotice | null {
  if (reason === SESSION_EXPIRED_REASON) {
    return { message: SESSION_EXPIRED_MESSAGE, isSuccess: false };
  }
  if (reason === ACCOUNT_CREATED_REASON) {
    return { message: ACCOUNT_CREATED_MESSAGE, isSuccess: true };
  }
  return null;
}

@Component({
  selector: 'app-login-page',
  imports: [FormField, Icon, RouterLink],
  templateUrl: './login-page.html',
  host: { class: 'block' },
})
export class LoginPage {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly notice = toReasonNotice(inject(ActivatedRoute).snapshot.queryParamMap.get('reason'));
  readonly registerPath = REGISTER_PATH;

  readonly credentials = signal<LoginCredentials>({ email: '', password: '' });
  readonly loginForm = form(this.credentials, (field) => {
    required(field.email, { message: 'El correo electrónico es obligatorio.' });
    email(field.email, { message: 'Ingresá un correo electrónico válido.' });
    required(field.password, { message: 'La contraseña es obligatoria.' });
  });

  readonly attemptedSubmit = signal(false);
  readonly isSubmitting = signal(false);
  readonly showPassword = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly emailError = computed(() => this.loginForm.email().errors()[0]?.message ?? null);
  readonly passwordError = computed(() => this.loginForm.password().errors()[0]?.message ?? null);

  onSubmit(event: Event): void {
    event.preventDefault();
    this.attemptedSubmit.set(true);

    if (this.loginForm().invalid() || this.isSubmitting()) {
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    this.auth.login(this.credentials()).subscribe({
      next: () => this.goToRoleHome(),
      error: (error: unknown) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(this.toErrorMessage(error));
      },
    });
  }

  toggleShowPassword(): void {
    this.showPassword.update((visible) => !visible);
  }

  private goToRoleHome(): void {
    this.isSubmitting.set(false);
    const home = getHomeForRoles(this.auth.roles());
    if (home === LOGIN_PATH) {
      this.auth.logout().subscribe();
      this.errorMessage.set(NO_ROLE_MESSAGE);
      return;
    }
    this.router.navigateByUrl(home);
  }

  private toErrorMessage(error: unknown): string {
    const isRejected =
      error instanceof HttpErrorResponse &&
      (error.status === HttpStatusCode.Unauthorized || error.status === HttpStatusCode.Forbidden);
    return isRejected ? INVALID_CREDENTIALS_MESSAGE : SERVER_ERROR_MESSAGE;
  }
}
