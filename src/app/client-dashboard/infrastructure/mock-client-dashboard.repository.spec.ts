import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { calendarDaysUntil } from '../domain/loyalty-progress';
import { MOCK_LATENCY_MS, MockClientDashboardRepository } from './mock-client-dashboard.repository';

describe('MockClientDashboardRepository', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 9, 12, 9, 0));
    TestBed.configureTestingModule({ providers: [MockClientDashboardRepository] });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('emits the mapped design data after a simulated latency', async () => {
    const repository = TestBed.inject(MockClientDashboardRepository);
    let emitted = false;
    const dashboard = firstValueFrom(repository.getDashboard()).finally(() => (emitted = true));

    await vi.advanceTimersByTimeAsync(MOCK_LATENCY_MS - 1);
    expect(emitted).toBe(false);
    await vi.advanceTimersByTimeAsync(1);

    const result = await dashboard;
    expect(result.profile.firstName).toBe('Juan');
    expect(result.loyalty.tier).toBe('silver');
  });

  it('keeps the active redemption expiring five days from the moment it is requested', async () => {
    const repository = TestBed.inject(MockClientDashboardRepository);
    const dashboard = firstValueFrom(repository.getDashboard());
    await vi.advanceTimersByTimeAsync(MOCK_LATENCY_MS);

    const [redemption] = (await dashboard).activeRedemptions;
    expect(calendarDaysUntil(redemption.expiresAt, new Date())).toBe(5);
  });
});
