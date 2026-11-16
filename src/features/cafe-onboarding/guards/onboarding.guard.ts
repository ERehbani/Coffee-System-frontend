import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { catchError, map, Observable, of } from 'rxjs';
import { HttpCafeProfileRepository } from '../../cafe-profile/services/http-cafe-profile.repository';

function redirectBy(isAllowed: (profileComplete: boolean) => boolean, target: string): Observable<boolean | UrlTree> {
  const router = inject(Router);
  return inject(HttpCafeProfileRepository)
    .getProfile()
    .pipe(
      map((profile) => (isAllowed(profile.profileComplete) ? true : router.createUrlTree([target]))),
      catchError(() => of(true)),
    );
}

export const profileCompleteGuard: CanActivateFn = () =>
  redirectBy((profileComplete) => profileComplete, '/cafe/onboarding');

export const onboardingPendingGuard: CanActivateFn = () =>
  redirectBy((profileComplete) => !profileComplete, '/cafe/dashboard');
