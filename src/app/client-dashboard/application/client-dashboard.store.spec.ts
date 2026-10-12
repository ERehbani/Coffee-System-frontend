import { ApplicationRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NEVER, Observable, of, Subject, throwError } from 'rxjs';
import { ClientDashboard } from '../domain/client-dashboard.model';
import { ClientDashboardRepository } from '../domain/client-dashboard.repository';
import { buildClientDashboardFixture } from '../infrastructure/client-dashboard.fixture';
import { mapClientDashboardDto } from '../infrastructure/client-dashboard.mapper';
import { ClientDashboardStore } from './client-dashboard.store';

describe('ClientDashboardStore', () => {
  const now = new Date(2026, 9, 12, 9, 0);
  const dashboard = mapClientDashboardDto(buildClientDashboardFixture(now));
  let getDashboard: ReturnType<typeof vi.fn<() => Observable<ClientDashboard>>>;

  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(now);
    getDashboard = vi.fn<() => Observable<ClientDashboard>>();
    TestBed.configureTestingModule({
      providers: [
        ClientDashboardStore,
        { provide: ClientDashboardRepository, useValue: { getDashboard } },
      ],
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const settle = () => TestBed.inject(ApplicationRef).whenStable();

  it('is loading until the repository responds', () => {
    getDashboard.mockReturnValue(NEVER);
    const store = TestBed.inject(ClientDashboardStore);
    TestBed.tick();

    expect(store.status()).toBe('loading');
    expect(store.dashboard()).toBeNull();
    expect(getDashboard).toHaveBeenCalledTimes(1);
  });

  it('exposes the dashboard and the derived loyalty progress once loaded', async () => {
    getDashboard.mockReturnValue(of(dashboard));
    const store = TestBed.inject(ClientDashboardStore);
    await settle();

    expect(store.status()).toBe('ready');
    expect(store.dashboard()).toEqual(dashboard);
    expect(store.loyaltyProgress()).toEqual({
      percent: 47.3,
      remainingPoints: 1580,
      isMaxTier: false,
    });
  });

  it('derives the days left before each active redemption expires', async () => {
    getDashboard.mockReturnValue(of(dashboard));
    const store = TestBed.inject(ClientDashboardStore);
    await settle();

    expect(store.activeRedemptions().map((r) => [r.code, r.daysUntilExpiry])).toEqual([
      ['VLD-8492-C0FF', 5],
    ]);
  });

  it('reports an error when the repository fails and recovers on reload', async () => {
    const retry = new Subject<ClientDashboard>();
    getDashboard
      .mockReturnValueOnce(throwError(() => new Error('Network down')))
      .mockReturnValueOnce(retry);
    const store = TestBed.inject(ClientDashboardStore);
    await settle();

    expect(store.status()).toBe('error');
    expect(store.dashboard()).toBeNull();
    expect(store.activeRedemptions()).toEqual([]);

    store.reload();
    TestBed.tick();
    expect(store.status()).toBe('loading');

    retry.next(dashboard);
    retry.complete();
    await settle();
    expect(store.status()).toBe('ready');
    expect(getDashboard).toHaveBeenCalledTimes(2);
  });
});
