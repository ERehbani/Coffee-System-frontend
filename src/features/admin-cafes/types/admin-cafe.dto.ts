export interface AdminCafeDto {
  readonly externalId: string;
  readonly name: string;
  readonly address: string;
  readonly email: string;
  readonly phoneNumber: string | null;
  readonly description: string | null;
  readonly state: boolean;
  readonly schedule: string | null;
  readonly image: string | null;
  readonly createdAt?: string;
  readonly totalReviews?: number;
  readonly rating?: number;
}

export interface CreateCafeAccountRequestDto {
  readonly email: string;
  readonly password: string;
  readonly name: string;
  readonly address: string;
  readonly description?: string | null;
  readonly phoneNumber?: string | null;
  readonly schedule?: string | null;
  readonly image?: string | null;
}

export interface CreatedCafeResponseDto {
  readonly externalId: string;
  readonly email: string;
  readonly state: boolean;
}
