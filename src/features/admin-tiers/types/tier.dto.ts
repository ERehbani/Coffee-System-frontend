/** `GET /tiers` item and the response of `POST /tiers` and `PUT /tiers/{externalId}`. */
export interface TierDto {
  readonly externalId: string;
  readonly name: string;
  readonly minPoints: number;
}

/** Body of `POST /tiers` and `PUT /tiers/{externalId}`. */
export interface TierRequestDto {
  readonly name: string;
  readonly minPoints: number;
}
