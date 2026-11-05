import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap, provideRouter } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { clearTestSession, createTestToken } from '../../utils/auth.fixture';
import { LoginPage } from './login-page';

describe('LoginPage', () => {
  const loginUrl = `${environment.apiBaseUrl}/auth/login`;
  let fixture: ComponentFixture<LoginPage>;
  let element: HTMLElement;
  let http: HttpTestingController;
  let router: Router;

  async function setup(queryParams: Record<string, string> = {}): Promise<void> {
    await TestBed.configureTestingModule({
      imports: [LoginPage],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ActivatedRoute, useValue: { snapshot: { queryParamMap: convertToParamMap(queryParams) } } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginPage);
    element = fixture.nativeElement;
    http = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
    fixture.detectChanges();
  }

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

  afterEach(() => {
    http.verify();
    clearTestSession();
  });

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

  it('logs in and goes to the page of the role', async () => {
    await setup();

    fillAndSubmit('admin@test.com', 'Secret123');
    const req = http.expectOne(loginUrl);
    expect(req.request.body).toEqual({ email: 'admin@test.com', password: 'Secret123' });
    req.flush({ token: createTestToken({ roles: ['ROLE_SUPERADMIN'] }) });

    expect(router.navigateByUrl).toHaveBeenCalledWith('/admin');
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
    http.expectOne(loginUrl).flush({ token: createTestToken() });
  });

  it('shows the reason when the session expired', async () => {
    await setup({ reason: 'Tu sesión expiró, volvé a iniciar sesión.' });

    expect(element.querySelector('[role="status"]')?.textContent).toContain('Tu sesión expiró');
  });

  it('toggles the password visibility', async () => {
    await setup();
    const password = element.querySelector<HTMLInputElement>('#login-password')!;

    element.querySelector<HTMLButtonElement>('button[aria-label="Mostrar contraseña"]')!.click();
    fixture.detectChanges();

    expect(password.type).toBe('text');
  });
});
