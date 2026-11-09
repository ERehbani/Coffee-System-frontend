import { TestBed } from '@angular/core/testing';
import { AuthService } from '../services/auth.service';

export const TEST_EMAIL = 'user@test.com';

export function signInForTest(roles: string[]): void {
  TestBed.inject(AuthService).startSession({ email: TEST_EMAIL, roles });
}

export function signOutForTest(): void {
  TestBed.inject(AuthService).clearSession();
}
