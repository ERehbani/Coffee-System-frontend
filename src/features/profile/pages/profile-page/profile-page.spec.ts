import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of } from 'rxjs';
import { ProfileRepository } from '../../services/profile.repository';
import { ProfileStore } from '../../services/profile.store';
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
