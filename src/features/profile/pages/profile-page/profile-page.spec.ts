import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { Observable, of, Subject } from 'rxjs';
import type { Mock } from 'vitest';
import { ProfileRepository } from '../../services/profile.repository';
import { ProfileStore } from '../../services/profile.store';
import { ProfileDashboard } from '../../types/profile.model';
import { buildProfileDashboardFixture } from '../../utils/profile.fixture';
import { toProfileDashboard } from '../../utils/profile.mapper';
import { ProfilePage } from './profile-page';

describe('ProfilePage coupon entry points', () => {
  let fixture: ComponentFixture<ProfilePage>;
  let element: HTMLElement;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfilePage],
      providers: [
        provideRouter([]),
        ProfileStore,
        {
          provide: ProfileRepository,
          useValue: {
            getDashboard: () => of(toProfileDashboard(buildProfileDashboardFixture(new Date()))),
          },
        },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);
    fixture = TestBed.createComponent(ProfilePage);
    TestBed.flushEffects();
    fixture.detectChanges();
    element = fixture.nativeElement;
  });

  it('opens the my coupons page from the "Mis cupones" quick action', () => {
    const tile = Array.from(element.querySelectorAll('app-quick-actions button')).find((button) =>
      button.textContent?.includes('Mis cupones'),
    ) as HTMLButtonElement;

    tile.click();

    expect(router.navigate).toHaveBeenCalledWith(['/profile/coupons']);
  });

  it('links "Ver todos" in the active redemptions section to the my coupons page', () => {
    const section = element.querySelector('section[aria-labelledby="active-redemptions-heading"]');
    const link = Array.from(section!.querySelectorAll('a')).find((anchor) =>
      anchor.textContent?.includes('Ver todos'),
    );

    expect(link?.getAttribute('href')).toBe('/profile/coupons');
  });
});

describe('ProfilePage loading', () => {
  const dashboard = toProfileDashboard(buildProfileDashboardFixture(new Date()));
  let getDashboard: Mock<() => Observable<ProfileDashboard>>;

  async function settle(): Promise<void> {
    TestBed.flushEffects();
    await Promise.resolve();
    TestBed.flushEffects();
  }

  function openPage(): ComponentFixture<ProfilePage> {
    const fixture = TestBed.createComponent(ProfilePage);
    TestBed.flushEffects();
    fixture.detectChanges();
    return fixture;
  }

  beforeEach(async () => {
    getDashboard = vi.fn(() => of(dashboard));
    await TestBed.configureTestingModule({
      imports: [ProfilePage],
      providers: [
        provideRouter([]),
        ProfileStore,
        { provide: ProfileRepository, useValue: { getDashboard } },
      ],
    }).compileComponents();
  });

  it('loads the dashboard once on the first visit', () => {
    const element: HTMLElement = openPage().nativeElement;

    expect(getDashboard).toHaveBeenCalledOnce();
    expect(element.querySelector('[aria-busy="true"]')).toBeNull();
    expect(element.querySelector('app-loyalty-card')).not.toBeNull();
  });

  it('shows the loading placeholders while the dashboard is on its way', () => {
    getDashboard.mockReturnValueOnce(new Subject<ProfileDashboard>());

    const element: HTMLElement = openPage().nativeElement;

    expect(element.querySelector('[aria-busy="true"]')).not.toBeNull();
    expect(element.querySelector('app-loyalty-card')).toBeNull();
  });

  it('loads the dashboard again and shows the placeholders when the client comes back', async () => {
    openPage().destroy();
    const freshDashboard = new Subject<ProfileDashboard>();
    getDashboard.mockReturnValueOnce(freshDashboard);

    const fixture = openPage();
    await settle();
    fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;

    expect(getDashboard).toHaveBeenCalledTimes(2);
    expect(element.querySelector('[aria-busy="true"]')).not.toBeNull();

    freshDashboard.next(dashboard);
    freshDashboard.complete();
    await settle();
    fixture.detectChanges();

    expect(element.querySelector('[aria-busy="true"]')).toBeNull();
    expect(element.querySelector('app-loyalty-card')).not.toBeNull();
  });
});
