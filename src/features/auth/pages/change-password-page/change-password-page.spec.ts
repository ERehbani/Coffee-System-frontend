import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { environment } from '../../../../environments/environment';
import {
  ChangePasswordPage,
  PASSWORD_CHANGED_MESSAGE,
  SERVER_ERROR_MESSAGE,
  SESSION_EXPIRED_MESSAGE,
} from './change-password-page';

describe('ChangePasswordPage', () => {
  const passwordUrl = `${environment.apiBaseUrl}/auth/password`;
  let fixture: ComponentFixture<ChangePasswordPage>;
  let element: HTMLElement;
  let http: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChangePasswordPage],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(ChangePasswordPage);
    element = fixture.nativeElement;
    http = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => http.verify());

  function type(selector: string, value: string): void {
    const input = element.querySelector<HTMLInputElement>(selector)!;
    input.value = value;
    input.dispatchEvent(new Event('input'));
  }

  function fillAndSubmit(current: string, next: string, confirmation: string): void {
    type('#current-password', current);
    type('#new-password', next);
    type('#password-confirmation', confirmation);
    element.querySelector('form')!.dispatchEvent(new Event('submit'));
    fixture.detectChanges();
  }

  it('shows the errors and does not call the back when the form is empty', () => {
    fillAndSubmit('', '', '');

    expect(element.textContent).toContain('Ingresá tu contraseña actual.');
    expect(element.textContent).toContain('Ingresá la contraseña nueva.');
    expect(element.textContent).toContain('Repetí la contraseña nueva.');
    http.expectNone(passwordUrl);
  });

  it('applies the same rules as the registration to the new password', () => {
    fillAndSubmit('Actual123', 'sinmayus1', 'sinmayus1');

    expect(element.textContent).toContain(
      'Debe incluir al menos una mayúscula, una minúscula y un número.',
    );
    http.expectNone(passwordUrl);
  });

  it('does not send the change when the confirmation does not match', () => {
    fillAndSubmit('Actual123', 'Nueva1234', 'Nueva9999');

    expect(element.textContent).toContain('Las contraseñas no coinciden.');
    http.expectNone(passwordUrl);
  });

  it('sends the current and the new password, then clears the form', () => {
    fillAndSubmit('Actual123', 'Nueva1234', 'Nueva1234');

    const request = http.expectOne(passwordUrl);
    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual({
      currentPassword: 'Actual123',
      newPassword: 'Nueva1234',
    });
    request.flush(null, { status: 204, statusText: 'No Content' });
    fixture.detectChanges();

    expect(element.querySelector('[data-testid="password-changed"]')?.textContent).toContain(
      PASSWORD_CHANGED_MESSAGE,
    );
    expect(element.querySelector<HTMLInputElement>('#current-password')!.value).toBe('');
    expect(element.querySelector<HTMLInputElement>('#new-password')!.value).toBe('');
  });

  it('shows the reason given by the back when the current password is wrong', () => {
    fillAndSubmit('Otra1234', 'Nueva1234', 'Nueva1234');

    http
      .expectOne(passwordUrl)
      .flush(
        { detail: 'La contraseña actual no es correcta' },
        { status: 422, statusText: 'Unprocessable Content' },
      );
    fixture.detectChanges();

    expect(element.querySelector('[data-testid="password-error"]')?.textContent).toContain(
      'La contraseña actual no es correcta',
    );
  });

  it('asks to log in again when the session expired', () => {
    fillAndSubmit('Actual123', 'Nueva1234', 'Nueva1234');

    http.expectOne(passwordUrl).flush(null, { status: 401, statusText: 'Unauthorized' });
    fixture.detectChanges();

    expect(element.textContent).toContain(SESSION_EXPIRED_MESSAGE);
  });

  it('does not show a text of the backend that is not one of its Spanish rules', () => {
    fillAndSubmit('Actual123', 'Nueva1234', 'Nueva1234');

    http
      .expectOne(passwordUrl)
      .flush({ detail: 'Username not found' }, { status: 404, statusText: 'Not Found' });
    fixture.detectChanges();

    expect(element.textContent).not.toContain('Username not found');
    expect(element.textContent).toContain(SERVER_ERROR_MESSAGE);
  });

  it('shows a generic message when the server fails without a reason', () => {
    fillAndSubmit('Actual123', 'Nueva1234', 'Nueva1234');

    http.expectOne(passwordUrl).flush(null, { status: 500, statusText: 'Server Error' });
    fixture.detectChanges();

    expect(element.textContent).toContain(SERVER_ERROR_MESSAGE);
  });
});
