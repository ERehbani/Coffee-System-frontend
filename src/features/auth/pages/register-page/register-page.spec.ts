import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { RegisterPage } from './register-page';

describe('RegisterPage', () => {
  const registerUrl = `${environment.apiBaseUrl}/auth/register`;
  let fixture: ComponentFixture<RegisterPage>;
  let element: HTMLElement;
  let http: HttpTestingController;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterPage],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterPage);
    element = fixture.nativeElement;
    http = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);
    fixture.detectChanges();
  });

  afterEach(() => http.verify());

  function type(selector: string, value: string): void {
    const input = element.querySelector<HTMLInputElement>(selector)!;
    input.value = value;
    input.dispatchEvent(new Event('input'));
  }

  function submit(): void {
    element.querySelector('form')!.dispatchEvent(new Event('submit'));
    fixture.detectChanges();
  }

  function fillAndSubmit(name: string, email: string, password: string): void {
    type('#register-name', name);
    type('#register-email', email);
    type('#register-password', password);
    submit();
  }

  it('shows the errors and does not call the back when the form is empty', () => {
    submit();

    expect(element.textContent).toContain('El nombre es obligatorio.');
    expect(element.textContent).toContain('El correo electrónico es obligatorio.');
    expect(element.textContent).toContain('La contraseña es obligatoria.');
    http.expectNone(registerUrl);
  });

  it('does not show errors before the first submit', () => {
    type('#register-email', 'not-an-email');
    fixture.detectChanges();

    expect(element.querySelector('[role="alert"]')).toBeNull();
  });

  it('rejects a name with only spaces', () => {
    fillAndSubmit('   ', 'ana@test.com', 'Secret123');

    expect(element.textContent).toContain('El nombre es obligatorio.');
    http.expectNone(registerUrl);
  });

  it('shows an error when the email is not valid', () => {
    fillAndSubmit('Ana', 'not-an-email', 'Secret123');

    expect(element.textContent).toContain('Ingresá un correo electrónico válido.');
    http.expectNone(registerUrl);
  });

  it('shows an error when the password is shorter than 6 characters', () => {
    fillAndSubmit('Ana', 'ana@test.com', 'Ab1');

    expect(element.textContent).toContain('La contraseña debe tener al menos 6 caracteres.');
    http.expectNone(registerUrl);
  });

  it.each(['secret123', 'SECRET123', 'SecretPass'])(
    'shows an error when the password "%s" lacks an uppercase, a lowercase or a number',
    (password) => {
      fillAndSubmit('Ana', 'ana@test.com', password);

      expect(element.textContent).toContain('Debe incluir al menos una mayúscula, una minúscula y un número.');
      http.expectNone(registerUrl);
    },
  );

  it('creates the account and goes to the login with the created notice', () => {
    fillAndSubmit('Ana', 'ana@test.com', 'Secret123');

    const req = http.expectOne(registerUrl);
    expect(req.request.body).toEqual({ name: 'Ana', email: 'ana@test.com', password: 'Secret123' });
    req.flush({ externalId: 'abc', email: 'ana@test.com', state: true });

    expect(router.navigate).toHaveBeenCalledWith(['/login'], { queryParams: { reason: 'registered' } });
  });

  it('disables the button and ignores a second submit while the request is in progress', () => {
    fillAndSubmit('Ana', 'ana@test.com', 'Secret123');
    const button = element.querySelector<HTMLButtonElement>('button[type="submit"]')!;

    submit();

    expect(button.disabled).toBe(true);
    expect(button.textContent).toContain('Creando cuenta...');
    http.expectOne(registerUrl).flush({ externalId: 'abc', email: 'ana@test.com', state: true });
  });

  it('shows that the email is taken when the back answers 409', () => {
    fillAndSubmit('Ana', 'ana@test.com', 'Secret123');
    http.expectOne(registerUrl).flush('Email already exists', { status: 409, statusText: 'Conflict' });
    fixture.detectChanges();

    expect(element.querySelector('[role="alert"]')?.textContent).toContain(
      'Ya existe una cuenta con ese correo electrónico.',
    );
    expect(router.navigate).not.toHaveBeenCalled();
    expect(element.querySelector<HTMLButtonElement>('button[type="submit"]')!.disabled).toBe(false);
  });

  it('shows invalid data when the back answers 400', () => {
    fillAndSubmit('Ana', 'ana@test.com', 'Secret123');
    http
      .expectOne(registerUrl)
      .flush({ errors: { email: 'Invalid email' }, status: 400 }, { status: 400, statusText: 'Bad Request' });
    fixture.detectChanges();

    expect(element.querySelector('[role="alert"]')?.textContent).toContain(
      'Revisá los datos ingresados e intentá de nuevo.',
    );
  });

  it('shows a server error when the back fails', () => {
    fillAndSubmit('Ana', 'ana@test.com', 'Secret123');
    http.expectOne(registerUrl).flush(null, { status: 500, statusText: 'Server Error' });
    fixture.detectChanges();

    expect(element.textContent).toContain('No pudimos conectar con el servidor.');
  });

  it('allows retrying after an error', () => {
    fillAndSubmit('Ana', 'ana@test.com', 'Secret123');
    http.expectOne(registerUrl).flush(null, { status: 500, statusText: 'Server Error' });

    submit();

    http.expectOne(registerUrl).flush({ externalId: 'abc', email: 'ana@test.com', state: true });
    expect(router.navigate).toHaveBeenCalled();
  });

  it('toggles the password visibility', () => {
    const password = element.querySelector<HTMLInputElement>('#register-password')!;

    element.querySelector<HTMLButtonElement>('button[aria-label="Mostrar contraseña"]')!.click();
    fixture.detectChanges();

    expect(password.type).toBe('text');
  });

  it('links to the login page', () => {
    expect(element.querySelector('a[href="/login"]')?.textContent).toContain('Iniciá sesión');
  });
});
