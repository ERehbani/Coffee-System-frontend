import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { AdminPlaceholderPage } from './admin-placeholder-page';

describe('AdminPlaceholderPage', () => {
  let harness: RouterTestingHarness;
  let root: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        provideRouter([
          { path: 'tiers', component: AdminPlaceholderPage, data: { title: 'Tiers' } },
          {
            path: 'benefit-types',
            component: AdminPlaceholderPage,
            data: { title: 'Tipos de beneficio' },
          },
        ]),
      ],
    }).compileComponents();

    harness = await RouterTestingHarness.create();
  });

  async function open(url: string): Promise<void> {
    await harness.navigateByUrl(url, AdminPlaceholderPage);
    root = harness.routeNativeElement as HTMLElement;
  }

  it('shows the section title from the route data as the page heading', async () => {
    await open('/tiers');

    expect(root.querySelector('h1')?.textContent?.trim()).toBe('Tiers');
  });

  it('shows a different title when the route data differs', async () => {
    await open('/benefit-types');

    expect(root.querySelector('h1')?.textContent?.trim()).toBe('Tipos de beneficio');
  });

  it('renders the "Próximamente" empty state explaining the section is not available yet', async () => {
    await open('/tiers');

    expect(root.querySelector('h2')?.textContent?.trim()).toBe('Próximamente');
    expect(root.textContent).toContain('La sección «Tiers» todavía no está disponible');
  });

  it('owns the main landmark of the page', async () => {
    await open('/tiers');

    expect(root.querySelectorAll('main').length).toBe(1);
  });
});
