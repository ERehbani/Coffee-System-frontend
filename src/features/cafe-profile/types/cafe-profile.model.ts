import { OpeningHours } from '../../../shared/utils/opening-hours';

export interface CafeProfile {
  readonly id: string;
  readonly name: string;
  readonly address: string;
  readonly email: string;
  readonly phoneNumber: string;
  readonly description: string;
  readonly isOpen: boolean;
  readonly logo: string;
  readonly image: string;
  readonly openingHours: OpeningHours[];
  readonly profileComplete: boolean;
}

export interface UpdateCafeProfileInput {
  readonly address: string;
  readonly phoneNumber: string;
  readonly description: string;
  readonly logo: string;
  readonly image: string;
  readonly openingHours: OpeningHours[];
}
