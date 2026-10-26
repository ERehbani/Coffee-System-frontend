import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { delay, Observable, of, throwError } from 'rxjs';
import { SaveTierInput, Tier } from '../types/tier.model';
import { TIERS_FIXTURE } from '../utils/tier.fixture';
import { sortTiers } from '../utils/tier.mapper';
import { TierRepository } from './tier.repository';

export const MOCK_LATENCY_MS = 250;

const NAME_MAX_LENGTH = 50;

function badRequest(body: object): HttpErrorResponse {
  return new HttpErrorResponse({ status: 400, error: { ...body, status: 400 } });
}

function conflict(message: string): HttpErrorResponse {
  return new HttpErrorResponse({ status: 409, error: message });
}

/** In-memory tiers that enforce the same rules as `/tiers` of the backend. */
@Injectable()
export class MockTierRepository implements TierRepository {
  private tiers: readonly Tier[] = TIERS_FIXTURE;
  private nextId = 1;

  getTiers(): Observable<readonly Tier[]> {
    return this.respond(() => sortTiers(this.tiers));
  }

  createTier(input: SaveTierInput): Observable<Tier> {
    return this.respond(() => {
      const name = this.validate(input, null);
      const created: Tier = { id: `tier-mock-${this.nextId++}`, name, minPoints: input.minPoints };
      this.tiers = [...this.tiers, created];
      return created;
    });
  }

  updateTier(id: string, input: SaveTierInput): Observable<Tier> {
    return this.respond(() => {
      const current = this.tiers.find((tier) => tier.id === id);
      if (!current) {
        throw new HttpErrorResponse({ status: 404, error: 'Tier not found' });
      }
      const name = this.validate(input, current);
      const updated: Tier = { id, name, minPoints: input.minPoints };
      this.tiers = this.tiers.map((tier) => (tier.id === id ? updated : tier));
      return updated;
    });
  }

  /** Runs the operation after the simulated latency; a thrown error reaches the subscriber. */
  private respond<T>(operation: () => T): Observable<T> {
    try {
      return of(operation()).pipe(delay(MOCK_LATENCY_MS));
    } catch (error) {
      return throwError(() => error).pipe(delay(MOCK_LATENCY_MS));
    }
  }

  /** Throws the backend error of the first broken rule; returns the trimmed name otherwise. */
  private validate(input: SaveTierInput, current: Tier | null): string {
    const name = (input.name ?? '').trim();
    const points = input.minPoints;
    const errors: Record<string, string> = {};
    if (!name) {
      errors['name'] = 'must not be blank';
    } else if (name.length > NAME_MAX_LENGTH) {
      errors['name'] = `size must be between 0 and ${NAME_MAX_LENGTH}`;
    }
    if (points === null || points === undefined) {
      errors['minPoints'] = 'must not be null';
    } else if (points < 0) {
      errors['minPoints'] = 'must be greater than or equal to 0';
    }
    if (Object.keys(errors).length > 0) {
      throw badRequest({ errors });
    }
    if (current?.minPoints === 0 && points !== 0) {
      throw badRequest({ error: 'The base tier must keep 0 points' });
    }
    const others = this.tiers.filter((tier) => tier.id !== current?.id);
    if (others.some((tier) => tier.name.trim().toLowerCase() === name.toLowerCase())) {
      throw conflict(`A tier named ${name} already exists`);
    }
    if (others.some((tier) => tier.minPoints === points)) {
      throw conflict(`A tier with ${points} points already exists`);
    }
    return name;
  }
}
