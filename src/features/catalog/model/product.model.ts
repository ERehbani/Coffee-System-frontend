export interface Product {
  externalId: string;
  name: string;
  description?: string | null;
  price: number;
  awardedPoints?: number | null;
  state: boolean;
  category: string;
  cafeExternalId: string;
  image?: string | null;
}
