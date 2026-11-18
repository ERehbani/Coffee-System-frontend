import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { FormField, email, form, required } from '@angular/forms/signals';
import { ActivatedRoute, Router } from '@angular/router';
import { Icon } from '../../../../shared/components/icon/icon';
import { AuthPanel, AuthShell, CLIENT_PANEL } from '../../components/auth-shell/auth-shell';
import { SESSION_EXPIRED_REASON } from '../../interceptors/auth.interceptor';
import { AuthService } from '../../services/auth.service';
import { LoginCredentials, UserRole } from '../../types/auth.model';
import { ACCOUNT_CREATED_REASON, LOGIN_PATH, REGISTER_PATH, getHomeForRoles } from '../../utils/role-home';

const INVALID_CREDENTIALS_MESSAGE = 'El correo o la contraseña son incorrectos.';
const SERVER_ERROR_MESSAGE = 'No pudimos conectar con el servidor. Probá de nuevo en unos minutos.';
const NO_ROLE_MESSAGE = 'Tu usuario no tiene un rol habilitado para ingresar.';
const SESSION_EXPIRED_MESSAGE = 'Tu sesión expiró, volvé a iniciar sesión.';

const ACCOUNT_CREATED_MESSAGE = 'Tu cuenta se creó correctamente. Iniciá sesión para continuar.';

interface Audience {
  panel: AuthPanel;
  role: UserRole;
  wrongRoleMessage: string;
}

const WRONG_ROLE_HINT = 'Ingresá desde el acceso de tu tipo de cuenta.';

const CLIENT_AUDIENCE: Audience = {
  panel: CLIENT_PANEL,
  role: 'ROLE_CLIENTE',
  wrongRoleMessage: `Esta cuenta no es de cliente. ${WRONG_ROLE_HINT}`,
};

const AUDIENCES: Partial<Record<string, Audience>> = {
  cafe: {
    panel: {
      image: '/auth/coffee-panel.jpg',
      tagline: 'Gestioná tus productos, promociones y pedidos desde un solo lugar.',
      title: ['Fidelizá', 'a tus clientes'],
      fullScreen: true,
    },
    role: 'ROLE_CAFETERIA',
    wrongRoleMessage: `Esta cuenta no es de una cafetería. ${WRONG_ROLE_HINT}`,
  },
  superadmin: {
    panel: {
      image: '/auth/cafe-superadmin.jpg',
      tagline: 'Gestioná cafeterías, usuarios, niveles y beneficios de la plataforma.',
      title: ['Panel de', 'administración'],
      fullScreen: true,
    },
    role: 'ROLE_SUPERADMIN',
    wrongRoleMessage: `Esta cuenta no es de administración. ${WRONG_ROLE_HINT}`,
  },
};

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
  imports: [AuthShell, FormField, Icon],
  templateUrl: './login-page.html',
  host: { class: 'block' },
})
export class LoginPage {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  private readonly route = inject(ActivatedRoute).snapshot;

  readonly notice = toReasonNotice(this.route.queryParamMap.get('reason'));
  // Route data `audience` picks the panel and the only role admitted; without it (the client login) the register link stays.
  private readonly audience = AUDIENCES[this.route.data['audience']] ?? CLIENT_AUDIENCE;
  readonly panel = this.audience.panel;
  readonly registerPath = this.audience === CLIENT_AUDIENCE ? REGISTER_PATH : undefined;

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
    const isOwnRole = this.auth.hasRole(this.audience.role);
    const rejection = home === LOGIN_PATH ? NO_ROLE_MESSAGE : isOwnRole ? null : this.audience.wrongRoleMessage;
    if (rejection) {
      this.auth.logout().subscribe();
      this.errorMessage.set(rejection);
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
