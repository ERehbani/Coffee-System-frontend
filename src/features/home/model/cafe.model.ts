export interface Cafe {
  externalId: string;
  name: string;
  address: string;
  email: string;
  phoneNumber?: string | null;
  description?: string | null;
  state: boolean;
  schedule?: string | null;
  image?: string | null;
  rating?: number;
  reviewCount?: number;
}

export interface CreateCafeAccountRequest {
  email: string;
  password: string;
  name: string;
  address: string;
  description: string;
  phoneNumber: string;
  schedule: string;
}

export interface UserResponse {
  externalId: string;
  email: string;
  state: boolean;
}

