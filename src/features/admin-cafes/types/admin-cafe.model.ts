export interface AdminCafe {
  readonly externalId: string;
  readonly name: string;
  readonly address: string;
  readonly email: string;
  readonly phoneNumber: string;
  readonly description: string;
  readonly state: boolean;
  readonly schedule: string;
  readonly image: string;
  readonly createdAt: string;
  readonly rating: number;
  readonly totalReviews: number;
}

export interface CafeStatsSummary {
  readonly totalCafes: number;
  readonly activeCafes: number;
  readonly inactiveCafes: number;
  readonly withSchedule: number;
}

export interface CreateCafeInput {
  readonly email: string;
  readonly password: string;
  readonly ownerName: string;
  readonly name: string;
  readonly address: string;
  readonly description?: string;
  readonly phoneNumber?: string;
  readonly schedule?: string;
  readonly image?: string;
}
