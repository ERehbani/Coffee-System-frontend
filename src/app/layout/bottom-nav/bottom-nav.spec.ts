import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { BottomNav } from './bottom-nav';

@Component({ template: '' })
class BlankPage {}

describe('BottomNav', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BottomNav],
      providers: [
        provideRouter([
          { path: 'dashboard', component: BlankPage },
          { path: 'catalog', component: BlankPage },
        ]),
      ],
    }).compileComponents();
  });

  function linkByLabel(host: HTMLElement, label: string): HTMLAnchorElement {
    const link = Array.from(host.querySelectorAll('a')).find(
      (anchor) => anchor.textContent?.trim() === label,
    );
    if (!link) {
      throw new Error(`Link "${label}" not found`);
    }
    return link;
  }

  it('renders the four primary destinations inside a labeled navigation landmark', async () => {
    const fixture = TestBed.createComponent(BottomNav);
    await fixture.whenStable();
    const host = fixture.nativeElement as HTMLElement;

    expect(host.querySelector('nav')?.getAttribute('aria-label')).toBe('Navegación principal');
    expect(Array.from(host.querySelectorAll('a')).map((a) => a.textContent?.trim())).toEqual([
      'Loyalty',
      'Catalog',
      'Cart',
      'Rewards',
    ]);
  });

  it('marks only the link of the current route as the active page', async () => {
    const fixture = TestBed.createComponent(BottomNav);
    await TestBed.inject(Router).navigateByUrl('/catalog');
    await fixture.whenStable();
    const host = fixture.nativeElement as HTMLElement;

    const catalog = linkByLabel(host, 'Catalog');
    const loyalty = linkByLabel(host, 'Loyalty');
    expect(catalog.getAttribute('aria-current')).toBe('page');
    expect(catalog.classList).toContain('bg-primary');
    expect(loyalty.getAttribute('aria-current')).toBeNull();
    expect(loyalty.classList).not.toContain('bg-primary');
  });
});
