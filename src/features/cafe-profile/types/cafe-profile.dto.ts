export interface CafeResponseDto {
  readonly externalId: string;
  readonly name: string;
  readonly address: string;
  readonly email: string;
  readonly phoneNumber: string | null;
  readonly description: string | null;
  readonly state: boolean;
  readonly schedule: string | null;
  readonly image: string | null;
}

export interface UpdateCafeRequestDto {
  readonly address: string;
  readonly phoneNumber: string;
  readonly description: string;
  readonly schedule: string;
  readonly image: string;
}
