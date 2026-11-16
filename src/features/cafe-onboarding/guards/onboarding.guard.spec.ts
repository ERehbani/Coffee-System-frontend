import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { HttpCafeProfileRepository } from '../../cafe-profile/services/http-cafe-profile.repository';
import { CAFE_PROFILE_FIXTURE } from '../../cafe-profile/utils/cafe-profile.fixture';
import { toCafeProfile } from '../../cafe-profile/utils/cafe-profile.mapper';
import { onboardingPendingGuard, profileCompleteGuard } from './onboarding.guard';

@Component({ template: '' })
class EmptyPage {}

describe('onboarding guards', () => {
  async function navigate(url: string, getProfile: () => unknown): Promise<string> {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          { path: 'cafe/onboarding', component: EmptyPage, canActivate: [onboardingPendingGuard] },
          { path: 'cafe/dashboard', component: EmptyPage, canActivate: [profileCompleteGuard] },
        ]),
        { provide: HttpCafeProfileRepository, useValue: { getProfile } },
      ],
    });
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl(url);
    return TestBed.inject(Router).url;
  }

  const complete = () => of(toCafeProfile(CAFE_PROFILE_FIXTURE));
  const incomplete = () => of({ ...toCafeProfile(CAFE_PROFILE_FIXTURE), profileComplete: false });

  it('lets a cafe with a complete profile into the dashboard', async () => {
    expect(await navigate('/cafe/dashboard', complete)).toBe('/cafe/dashboard');
  });

  it('sends a cafe that logs in for the first time to the onboarding', async () => {
    expect(await navigate('/cafe/dashboard', incomplete)).toBe('/cafe/onboarding');
  });

  it('does not show the onboarding again once the profile is complete', async () => {
    expect(await navigate('/cafe/onboarding', complete)).toBe('/cafe/dashboard');
  });

  it('lets the page show its own error when the profile cannot be loaded', async () => {
    expect(await navigate('/cafe/dashboard', () => throwError(() => new Error('offline')))).toBe('/cafe/dashboard');
  });
});
