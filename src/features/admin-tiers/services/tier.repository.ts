import { Observable } from 'rxjs';
import { SaveTierInput, Tier } from '../types/tier.model';

export abstract class TierRepository {
  /** Every tier, from the fewest points needed to the most. */
  abstract getTiers(): Observable<readonly Tier[]>;
  abstract createTier(input: SaveTierInput): Observable<Tier>;
  abstract updateTier(id: string, input: SaveTierInput): Observable<Tier>;
}
