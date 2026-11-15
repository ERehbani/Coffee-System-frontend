import { OpeningHours } from '../../../shared/utils/opening-hours';

export interface Cafe {
  externalId: string;
  name: string;
  address: string;
  email: string;
  phoneNumber?: string | null;
  description?: string | null;
  state: boolean;
  openNow: boolean;
  logo?: string | null;
  image?: string | null;
  openingHours?: OpeningHours[] | null;
  /** Average with one decimal; 0 with a reviewCount of 0 while the cafe has no reviews. */
  rating?: number;
  reviewCount?: number;
}

export interface CreateCafeAccountRequest {
  email: string;
  password: string;
  name: string;
  address: string;
  description?: string | null;
  phoneNumber?: string | null;
}

export interface UserResponse {
  externalId: string;
  email: string;
  state: boolean;
}
