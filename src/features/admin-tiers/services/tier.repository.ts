import { Observable } from 'rxjs';
import { SaveTierInput, Tier } from '../types/tier.model';

export abstract class TierRepository {
  abstract getTiers(): Observable<readonly Tier[]>;
  abstract createTier(input: SaveTierInput): Observable<Tier>;
  abstract updateTier(id: string, input: SaveTierInput): Observable<Tier>;
}
