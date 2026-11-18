export interface TierDto {
  readonly externalId: string;
  readonly name: string;
  readonly minPoints: number;
}

export interface TierRequestDto {
  readonly name: string;
  readonly minPoints: number;
}
