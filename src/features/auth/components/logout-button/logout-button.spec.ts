import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../services/auth.service';
import { signInForTest } from '../../utils/auth.fixture';
import { LogoutButton } from './logout-button';

describe('LogoutButton', () => {
  const logoutUrl = `${environment.apiBaseUrl}/auth/logout`;
  let fixture: ComponentFixture<LogoutButton>;
  let http: HttpTestingController;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LogoutButton],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    signInForTest(['ROLE_CLIENTE']);
    fixture = TestBed.createComponent(LogoutButton);
    http = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
    fixture.detectChanges();
  });

  afterEach(() => http.verify());

  function button(): HTMLButtonElement {
    return fixture.nativeElement.querySelector('button');
  }

  it('shows the logout label', () => {
    expect(button().textContent).toContain('Cerrar sesión');
  });

  it('closes the session and goes to the login', () => {
    button().click();
    http.expectOne(logoutUrl).flush(null, { status: 204, statusText: 'No Content' });

    expect(TestBed.inject(AuthService).isAuthenticated()).toBe(false);
    expect(router.navigateByUrl).toHaveBeenCalledWith('/login');
  });

  it('disables the button while logging out', () => {
    button().click();
    fixture.detectChanges();

    expect(button().disabled).toBe(true);
    expect(button().textContent).toContain('Cerrando sesión...');
    http.expectOne(logoutUrl).flush(null);
  });
});
