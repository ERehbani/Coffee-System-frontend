export interface Tier {
  readonly id: string;
  readonly name: string;
  readonly minPoints: number;
}

export interface SaveTierInput {
  readonly name: string;
  readonly minPoints: number;
}

export interface TierFormErrors {
  readonly name?: string;
  readonly minPoints?: string;
  readonly form?: string;
}
