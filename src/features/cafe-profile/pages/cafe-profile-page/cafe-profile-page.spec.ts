import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { signInForTest } from '../../../auth/utils/auth.fixture';
import { CafeProfileRepository } from '../../services/cafe-profile.repository';
import { CafeProfileStore } from '../../services/cafe-profile.store';
import { MockCafeProfileRepository } from '../../services/mock-cafe-profile.repository';
import { CafeProfilePage } from './cafe-profile-page';

describe('CafeProfilePage', () => {
  let fixture: ComponentFixture<CafeProfilePage>;
  let root: HTMLElement;

  const clientViewLink = () =>
    Array.from(root.querySelectorAll<HTMLAnchorElement>('a')).find((link) =>
      link.textContent?.includes('Vista Cliente'),
    );

  async function setup(roles: string[]): Promise<void> {
    await TestBed.configureTestingModule({
      imports: [CafeProfilePage],
      providers: [
        provideRouter([]),
        { provide: CafeProfileRepository, useClass: MockCafeProfileRepository },
        CafeProfileStore,
      ],
    }).compileComponents();

    signInForTest(roles);
    fixture = TestBed.createComponent(CafeProfilePage);
    root = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  }

  it('hides the client view link for a cafe only', async () => {
    await setup(['ROLE_CAFETERIA']);

    expect(clientViewLink()).toBeUndefined();
  });

  it('shows the client view link when the cafe is also a client', async () => {
    await setup(['ROLE_CAFETERIA', 'ROLE_CLIENTE']);

    expect(clientViewLink()?.getAttribute('href')).toBe('/profile');
  });

  it('shows the logout button', async () => {
    await setup(['ROLE_CAFETERIA']);

    expect(root.querySelector('app-logout-button')).not.toBeNull();
  });
});
