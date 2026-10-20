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
