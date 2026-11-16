import { OpeningHours } from '../../../shared/utils/opening-hours';

export interface CafeResponseDto {
  readonly externalId: string;
  readonly name: string;
  readonly address: string;
  readonly email: string;
  readonly phoneNumber: string | null;
  readonly description: string | null;
  readonly state: boolean;
  readonly logo: string | null;
  readonly image: string | null;
  readonly openingHours: readonly OpeningHours[] | null;
  readonly openNow: boolean;
  readonly profileComplete: boolean;
}

export interface UpdateCafeRequestDto {
  readonly address: string;
  readonly phoneNumber: string;
  readonly description: string;
  readonly logo: string;
  readonly image: string;
  readonly openingHours: readonly OpeningHours[];
}
