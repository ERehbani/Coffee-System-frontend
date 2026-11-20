import { AvailableBenefit } from '../model/available-benefit.model';

/** A benefit with no tier requirement is open to everyone; otherwise the client needs the accumulated points of that tier. */
export function isBenefitUnlocked(benefit: AvailableBenefit, clientTierPoints: number | null): boolean {
  const requiredPoints = benefit.tierMinPoints;
  if (requiredPoints === null) {
    return true;
  }
  return clientTierPoints !== null && clientTierPoints >= requiredPoints;
}
