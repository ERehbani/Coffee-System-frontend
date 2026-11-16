import { TierDto, TierRequestDto } from '../types/tier.dto';
import { SaveTierInput, Tier } from '../types/tier.model';

export function toTier(dto: TierDto): Tier {
  return { id: dto.externalId, name: dto.name, minPoints: dto.minPoints };
}

/** Orders tiers from the fewest points needed to the most. */
export function sortTiers(tiers: readonly Tier[]): readonly Tier[] {
  return [...tiers].sort((a, b) => a.minPoints - b.minPoints);
}

export function toTierList(dtos: readonly TierDto[]): readonly Tier[] {
  return sortTiers(dtos.map(toTier));
}

export function toTierRequestDto(input: SaveTierInput): TierRequestDto {
  return { name: input.name.trim(), minPoints: input.minPoints };
}
