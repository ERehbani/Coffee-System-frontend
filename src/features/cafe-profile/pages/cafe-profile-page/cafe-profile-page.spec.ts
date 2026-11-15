import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { signInForTest } from '../../../auth/utils/auth.fixture';
import { CafeProfileRepository } from '../../services/cafe-profile.repository';
import { CafeProfileStore } from '../../services/cafe-profile.store';
import { CAFE_PROFILE_FIXTURE } from '../../utils/cafe-profile.fixture';
import { toCafeProfile } from '../../utils/cafe-profile.mapper';
import { CafeProfilePage } from './cafe-profile-page';

const cafeProfile = toCafeProfile(CAFE_PROFILE_FIXTURE);

describe('CafeProfilePage', () => {
  let fixture: ComponentFixture<CafeProfilePage>;
  let root: HTMLElement;

  async function setup(): Promise<void> {
    await TestBed.configureTestingModule({
      imports: [CafeProfilePage],
      providers: [
        provideRouter([]),
        {
          provide: CafeProfileRepository,
          useValue: { getProfile: () => of(cafeProfile), updateProfile: () => of(cafeProfile) },
        },
        CafeProfileStore,
      ],
    }).compileComponents();

    signInForTest(['ROLE_CAFETERIA']);
    fixture = TestBed.createComponent(CafeProfilePage);
    root = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  }

  it('shows the profile of the cafe once it is loaded', async () => {
    await setup();

    expect(root.querySelector('h1')?.textContent?.trim()).toBe('Perfil del local');
    expect(root.textContent).toContain(cafeProfile.name);
    expect(root.textContent).toContain(cafeProfile.address);
  });

  it('lists the opening hours of every day the cafe opens', async () => {
    await setup();

    expect(root.textContent).toContain('Lunes: 07:30–20:00');
    expect(root.textContent).toContain('Sábado: 08:30–19:00');
  });

  it('leaves the navigation to the cafe layout', async () => {
    await setup();

    expect(root.querySelector('app-logout-button')).toBeNull();
    expect(root.querySelector('a[href="/cafe/validate"]')).toBeNull();
  });
});
