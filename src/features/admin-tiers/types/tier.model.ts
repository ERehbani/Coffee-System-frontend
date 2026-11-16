/** A loyalty tier and the points a client needs to reach it. */
export interface Tier {
  readonly id: string;
  readonly name: string;
  readonly minPoints: number;
}

export interface SaveTierInput {
  readonly name: string;
  readonly minPoints: number;
}

/** Server-side errors of a save, per field plus one for the form as a whole. */
export interface TierFormErrors {
  readonly name?: string;
  readonly minPoints?: string;
  readonly form?: string;
}
