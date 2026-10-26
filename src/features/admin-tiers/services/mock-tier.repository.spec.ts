import { HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom, Observable } from 'rxjs';
import { Tier } from '../types/tier.model';
import { TIERS_FIXTURE } from '../utils/tier.fixture';
import { MOCK_LATENCY_MS, MockTierRepository } from './mock-tier.repository';

describe('MockTierRepository', () => {
  let repository: MockTierRepository;

  beforeEach(() => {
    vi.useFakeTimers();
    repository = new MockTierRepository();
  });

  afterEach(() => vi.useRealTimers());

  /** Subscribes, lets the simulated latency elapse and resolves with the first emission. */
  function settle<T>(source: Observable<T>): Promise<T> {
    const result = firstValueFrom(source);
    vi.advanceTimersByTime(MOCK_LATENCY_MS);
    return result;
  }

  async function failure(source: Observable<unknown>): Promise<HttpErrorResponse> {
    const error = await settle(source).catch((caught: unknown) => caught);
    expect(error).toBeInstanceOf(HttpErrorResponse);
    return error as HttpErrorResponse;
  }

  const baseTier = (): Tier => TIERS_FIXTURE.find((tier) => tier.minPoints === 0)!;
  const otherTier = (): Tier => TIERS_FIXTURE.find((tier) => tier.name === 'PLATA')!;

  it('mirrors the backend seeds, from the fewest points to the most', async () => {
    const tiers = await settle(repository.getTiers());

    expect(tiers.map(({ name, minPoints }) => [name, minPoints])).toEqual([
      ['BRONCE', 0],
      ['PLATA', 1000],
      ['ORO', 3000],
      ['DIAMANTE', 7000],
    ]);
  });

  it('creates a tier with a trimmed name and keeps the list sorted', async () => {
    const created = await settle(repository.createTier({ name: '  Platino  ', minPoints: 5000 }));
    const tiers = await settle(repository.getTiers());

    expect(created.name).toBe('Platino');
    expect(created.id).toBeTruthy();
    expect(tiers.map((tier) => tier.name)).toEqual([
      'BRONCE',
      'PLATA',
      'ORO',
      'Platino',
      'DIAMANTE',
    ]);
  });

  it('updates a tier and re-sorts the list', async () => {
    const updated = await settle(
      repository.updateTier(otherTier().id, { name: 'Plata plus', minPoints: 8000 }),
    );
    const tiers = await settle(repository.getTiers());

    expect(updated).toEqual({ id: otherTier().id, name: 'Plata plus', minPoints: 8000 });
    expect(tiers.at(-1)).toEqual(updated);
  });

  it('rejects an empty or too long name with the backend validation shape', async () => {
    const blank = await failure(repository.createTier({ name: '   ', minPoints: 10 }));
    const long = await failure(repository.createTier({ name: 'x'.repeat(51), minPoints: 10 }));

    expect(blank.status).toBe(400);
    expect(blank.error.errors.name).toBeTruthy();
    expect(long.status).toBe(400);
    expect(long.error.errors.name).toBeTruthy();
  });

  it('rejects negative and missing points with the backend validation shape', async () => {
    const negative = await failure(repository.createTier({ name: 'Nuevo', minPoints: -1 }));
    const missing = await failure(
      repository.createTier({ name: 'Nuevo', minPoints: null as unknown as number }),
    );

    expect(negative.status).toBe(400);
    expect(negative.error.errors.minPoints).toBeTruthy();
    expect(missing.status).toBe(400);
    expect(missing.error.errors.minPoints).toBeTruthy();
  });

  it('rejects a duplicate name ignoring case and surrounding spaces', async () => {
    const onCreate = await failure(repository.createTier({ name: ' oro ', minPoints: 4000 }));
    const onUpdate = await failure(
      repository.updateTier(otherTier().id, { name: 'ORO', minPoints: 1000 }),
    );

    expect(onCreate.status).toBe(409);
    expect(onCreate.error).toBe('A tier named oro already exists');
    expect(onUpdate.status).toBe(409);
  });

  it('rejects duplicate points on create and on update of another tier', async () => {
    const onCreate = await failure(repository.createTier({ name: 'Nuevo', minPoints: 3000 }));
    const onUpdate = await failure(
      repository.updateTier(otherTier().id, { name: 'PLATA', minPoints: 3000 }),
    );

    expect(onCreate.status).toBe(409);
    expect(onCreate.error).toBe('A tier with 3000 points already exists');
    expect(onUpdate.status).toBe(409);
  });

  it('rejects a second 0-point tier', async () => {
    const error = await failure(repository.createTier({ name: 'Otro base', minPoints: 0 }));

    expect(error.status).toBe(409);
    expect(error.error).toBe('A tier with 0 points already exists');
  });

  it('allows an update that keeps the tier own name and points', async () => {
    const updated = await settle(
      repository.updateTier(otherTier().id, { name: 'plata', minPoints: 1000 }),
    );

    expect(updated).toEqual({ id: otherTier().id, name: 'plata', minPoints: 1000 });
  });

  it('keeps the base tier at 0 points but lets it be renamed', async () => {
    const rejected = await failure(
      repository.updateTier(baseTier().id, { name: 'BRONCE', minPoints: 50 }),
    );
    const renamed = await settle(
      repository.updateTier(baseTier().id, { name: 'Inicial', minPoints: 0 }),
    );

    expect(rejected.status).toBe(400);
    expect(rejected.error).toEqual({ error: 'The base tier must keep 0 points', status: 400 });
    expect(renamed).toEqual({ id: baseTier().id, name: 'Inicial', minPoints: 0 });
  });

  it('answers 404 when the tier does not exist', async () => {
    const error = await failure(repository.updateTier('missing', { name: 'X', minPoints: 5 }));

    expect(error.status).toBe(404);
  });

  it('does not leak changes between instances', async () => {
    await settle(repository.createTier({ name: 'Extra', minPoints: 1 }));

    const fresh = new MockTierRepository();
    const tiers = await settle(fresh.getTiers());

    expect(tiers).toHaveLength(4);
  });
});
