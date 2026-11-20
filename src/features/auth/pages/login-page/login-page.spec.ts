import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Data, Router, convertToParamMap, provideRouter } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { ThemeService } from '../../../../shared/services/theme';
import { AuthService } from '../../services/auth.service';
import { LoginPage } from './login-page';

describe('LoginPage', () => {
  const loginUrl = `${environment.apiBaseUrl}/auth/login`;
  let fixture: ComponentFixture<LoginPage>;
  let element: HTMLElement;
  let http: HttpTestingController;
  let router: Router;

  async function setup(queryParams: Record<string, string> = {}, data: Data = {}): Promise<void> {
    await TestBed.configureTestingModule({
      imports: [LoginPage],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { queryParamMap: convertToParamMap(queryParams), data } },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginPage);
    element = fixture.nativeElement;
    http = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
    fixture.detectChanges();
  }

  afterEach(() => {
    TestBed.inject(ThemeService).theme.set('light');
  });

  function type(selector: string, value: string): void {
    const input = element.querySelector<HTMLInputElement>(selector)!;
    input.value = value;
    input.dispatchEvent(new Event('input'));
  }

  function submit(): void {
    element.querySelector('form')!.dispatchEvent(new Event('submit'));
    fixture.detectChanges();
  }

  function fillAndSubmit(email: string, password: string): void {
    type('#login-email', email);
    type('#login-password', password);
    submit();
  }

  afterEach(() => http.verify());

  it('shows the errors and does not call the back when the form is empty', async () => {
    await setup();

    submit();

    expect(element.textContent).toContain('El correo electrónico es obligatorio.');
    expect(element.textContent).toContain('La contraseña es obligatoria.');
    http.expectNone(loginUrl);
  });

  it('shows an error when the email is not valid', async () => {
    await setup();

    fillAndSubmit('not-an-email', 'Secret123');

    expect(element.textContent).toContain('Ingresá un correo electrónico válido.');
    http.expectNone(loginUrl);
  });

  const pages = [
    {
      name: 'client',
      data: {},
      role: 'ROLE_CLIENTE',
      home: '/home',
      otherRole: 'ROLE_CAFETERIA',
      message: 'Esta cuenta no es de cliente. Ingresá desde el acceso de tu tipo de cuenta.',
    },
    {
      name: 'cafe',
      data: { audience: 'cafe' },
      role: 'ROLE_CAFETERIA',
      home: '/cafe/dashboard',
      otherRole: 'ROLE_CLIENTE',
      message: 'Esta cuenta no es de una cafetería. Ingresá desde el acceso de tu tipo de cuenta.',
    },
    {
      name: 'superadmin',
      data: { audience: 'superadmin' },
      role: 'ROLE_SUPERADMIN',
      home: '/admin',
      otherRole: 'ROLE_CLIENTE',
      message: 'Esta cuenta no es de administración. Ingresá desde el acceso de tu tipo de cuenta.',
    },
  ];

  for (const page of pages) {
    it(`logs in and goes to the home of the role on the ${page.name} login`, async () => {
      await setup({}, page.data);

      fillAndSubmit('user@test.com', 'Secret123');
      const req = http.expectOne(loginUrl);
      expect(req.request.body).toEqual({ email: 'user@test.com', password: 'Secret123' });
      req.flush({ email: 'user@test.com', roles: [page.role] });

      expect(router.navigateByUrl).toHaveBeenCalledWith(page.home);
    });

    it(`closes the session and shows a message when the account is not of the ${page.name} login`, async () => {
      await setup({}, page.data);

      fillAndSubmit('user@test.com', 'Secret123');
      http.expectOne(loginUrl).flush({ email: 'user@test.com', roles: [page.otherRole], token: 'stored-token' });
      http.expectOne(`${environment.apiBaseUrl}/auth/logout`).flush(null);
      fixture.detectChanges();

      expect(element.querySelector('[role="alert"]')?.textContent).toContain(page.message);
      expect(TestBed.inject(AuthService).isAuthenticated()).toBe(false);
      expect(TestBed.inject(AuthService).getToken()).toBeNull();
      expect(localStorage.getItem('auth_token')).toBeNull();
      expect(router.navigateByUrl).not.toHaveBeenCalled();
      expect(element.querySelector<HTMLButtonElement>('button[type="submit"]')!.disabled).toBe(false);
    });
  }

  it('closes the session and shows a message when the user has no known role', async () => {
    await setup();

    fillAndSubmit('raro@test.com', 'Secret123');
    http.expectOne(loginUrl).flush({ email: 'raro@test.com', roles: ['READ_PRODUCTS'] });
    http.expectOne(`${environment.apiBaseUrl}/auth/logout`).flush(null);
    fixture.detectChanges();

    expect(element.querySelector('[role="alert"]')?.textContent).toContain(
      'Tu usuario no tiene un rol habilitado para ingresar.',
    );
    expect(router.navigateByUrl).not.toHaveBeenCalled();
  });

  it('shows invalid credentials when the back answers 401', async () => {
    await setup();

    fillAndSubmit('admin@test.com', 'wrong');
    http.expectOne(loginUrl).flush(null, { status: 401, statusText: 'Unauthorized' });
    fixture.detectChanges();

    expect(element.querySelector('[role="alert"]')?.textContent).toContain(
      'El correo o la contraseña son incorrectos.',
    );
    expect(router.navigateByUrl).not.toHaveBeenCalled();
  });

  it('shows invalid credentials when the back answers 403', async () => {
    await setup();

    fillAndSubmit('admin@test.com', 'wrong');
    http.expectOne(loginUrl).flush(null, { status: 403, statusText: 'Forbidden' });
    fixture.detectChanges();

    expect(element.textContent).toContain('El correo o la contraseña son incorrectos.');
  });

  it('shows a server error when the back is not available', async () => {
    await setup();

    fillAndSubmit('admin@test.com', 'Secret123');
    http.expectOne(loginUrl).flush(null, { status: 500, statusText: 'Server Error' });
    fixture.detectChanges();

    expect(element.textContent).toContain('No pudimos conectar con el servidor.');
  });

  it('disables the button while the login is in progress', async () => {
    await setup();

    fillAndSubmit('admin@test.com', 'Secret123');
    const button = element.querySelector<HTMLButtonElement>('button[type="submit"]')!;

    expect(button.disabled).toBe(true);
    expect(button.textContent).toContain('Iniciando sesión...');
    http.expectOne(loginUrl).flush({ email: 'user@test.com', roles: ['ROLE_CLIENTE'] });
  });

  it('shows the reason when the session expired', async () => {
    await setup({ reason: 'expired' });

    expect(element.querySelector('[role="status"]')?.textContent).toContain('Tu sesión expiró');
  });

  it('shows a success notice when the account was just created', async () => {
    await setup({ reason: 'registered' });

    const notice = element.querySelector('[role="status"]');

    expect(notice?.textContent).toContain('Tu cuenta se creó correctamente.');
    expect(notice?.classList).toContain('notice-success');
  });

  it('links to the register page', async () => {
    await setup();

    expect(element.querySelector('a[href="/register"]')?.textContent).toContain('Crear cuenta');
  });

  const photo = () => element.querySelector('img')!.getAttribute('src');

  it('uses the client photo by default', async () => {
    await setup();

    expect(photo()).toBe('/auth/coffee-panel.jpg');
  });

  it('does not offer to create an account on the cafe login', async () => {
    await setup({}, { audience: 'cafe' });

    expect(element.querySelector('a[href="/register"]')).toBeNull();
    expect(element.textContent).toContain('Fidelizá');
  });

  it('shows the superadmin photo and no register link on the superadmin login', async () => {
    await setup({}, { audience: 'superadmin' });

    expect(photo()).toBe('/auth/cafe-superadmin.jpg');
    expect(element.querySelector('a[href="/register"]')).toBeNull();
  });

  it('falls back to the client login for an audience it does not know', async () => {
    await setup({}, { audience: 'otro' });

    expect(photo()).toBe('/auth/coffee-panel.jpg');
    expect(element.querySelector('a[href="/register"]')).not.toBeNull();
  });

  it('ignores a reason it does not know', async () => {
    await setup({ reason: 'Tu cuenta fue suspendida, escribí a soporte.' });

    expect(element.querySelector('[role="status"]')).toBeNull();
    expect(element.textContent).not.toContain('suspendida');
  });

  it('toggles the password visibility', async () => {
    await setup();
    const password = element.querySelector<HTMLInputElement>('#login-password')!;

    element.querySelector<HTMLButtonElement>('button[aria-label="Mostrar contraseña"]')!.click();
    fixture.detectChanges();

    expect(password.type).toBe('text');
  });

  it('switches between the light and the night theme', async () => {
    await setup();
    const theme = TestBed.inject(ThemeService);
    const toggle = element.querySelector<HTMLButtonElement>('button[aria-label="Activar modo nocturno"]')!;

    toggle.click();
    fixture.detectChanges();

    expect(theme.theme()).toBe('dark');
    expect(element.querySelector('button[aria-label="Activar modo claro"]')).not.toBeNull();
  });
});
