import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { App } from './app';
import { routes } from './app.routes';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter(routes)],
    }).compileComponents();
  });

  it('redirects the root URL to the dashboard inside the client shell', async () => {
    const fixture = TestBed.createComponent(App);
    const router = TestBed.inject(Router);

    await router.navigateByUrl('/');
    await fixture.whenStable();

    const host = fixture.nativeElement as HTMLElement;
    expect(router.url).toBe('/dashboard');
    expect(host.querySelector('app-client-layout main')).not.toBeNull();
    expect(
      host.querySelector('app-client-layout nav[aria-label="Navegación principal"]'),
    ).not.toBeNull();
  });

  it('redirects unknown URLs to the dashboard', async () => {
    const fixture = TestBed.createComponent(App);
    const router = TestBed.inject(Router);

    await router.navigateByUrl('/does-not-exist');
    await fixture.whenStable();

    expect(router.url).toBe('/dashboard');
  });
});
