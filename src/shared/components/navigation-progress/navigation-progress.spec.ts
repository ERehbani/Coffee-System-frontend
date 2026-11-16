import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { ReplaySubject } from 'rxjs';
import { PendingRequests } from '../../services/pending-requests';
import { NavigationProgress } from './navigation-progress';

@Component({ template: '' })
class EmptyPage {}

describe('NavigationProgress', () => {
  let fixture: ComponentFixture<NavigationProgress>;
  let router: Router;
  let pageReady: ReplaySubject<boolean>;

  const bar = () => fixture.nativeElement.querySelector('.navigation-progress') as HTMLElement;

  beforeEach(async () => {
    pageReady = new ReplaySubject<boolean>(1);
    await TestBed.configureTestingModule({
      imports: [NavigationProgress],
      providers: [
        provideRouter([
          { path: 'fast', component: EmptyPage },
          { path: 'slow', component: EmptyPage, canActivate: [() => pageReady] },
        ]),
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(NavigationProgress);
    fixture.detectChanges();
  });

  it('stays hidden while nothing is loading', () => {
    expect(fixture.componentInstance.isLoading()).toBe(false);
    expect(bar().classList).not.toContain('is-loading');
    expect(bar().getAttribute('aria-hidden')).toBe('true');
  });

  it('shows the bar while the next page is still loading', () => {
    router.navigateByUrl('/slow');
    fixture.detectChanges();

    expect(fixture.componentInstance.isLoading()).toBe(true);
    expect(bar().classList).toContain('is-loading');
    expect(bar().getAttribute('aria-hidden')).toBeNull();
    expect(bar().getAttribute('role')).toBe('progressbar');
  });

  it('hides the bar once the page is ready', async () => {
    const navigation = router.navigateByUrl('/slow');
    fixture.detectChanges();

    pageReady.next(true);
    pageReady.complete();
    await navigation;
    fixture.detectChanges();

    expect(router.url).toBe('/slow');
    expect(bar().classList).not.toContain('is-loading');
  });

  it('hides the bar when the navigation is cancelled', async () => {
    const navigation = router.navigateByUrl('/slow');
    fixture.detectChanges();

    pageReady.next(false);
    pageReady.complete();
    await navigation;
    fixture.detectChanges();

    expect(router.url).not.toBe('/slow');
    expect(bar().classList).not.toContain('is-loading');
  });

  it('hides the bar after a navigation that needs no waiting', async () => {
    await router.navigateByUrl('/fast');
    fixture.detectChanges();

    expect(bar().classList).not.toContain('is-loading');
  });

  it('shows the bar while a page is loading its data', () => {
    const pendingRequests = TestBed.inject(PendingRequests);

    pendingRequests.start();
    fixture.detectChanges();
    expect(bar().classList).toContain('is-loading');

    pendingRequests.finish();
    fixture.detectChanges();
    expect(bar().classList).not.toContain('is-loading');
  });

  it('keeps the bar while the page loads its data after the navigation ended', async () => {
    const pendingRequests = TestBed.inject(PendingRequests);
    pendingRequests.start();

    await router.navigateByUrl('/fast');
    fixture.detectChanges();

    expect(bar().classList).toContain('is-loading');
  });
});
