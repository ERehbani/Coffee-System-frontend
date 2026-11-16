export interface Product {
  externalId: string;
  name: string;
  description?: string | null;
  price: number;
  awardedPoints?: number | null;
  state: boolean;
  /** False when the product is sold out for today. */
  available: boolean;
  category: string;
  cafeExternalId: string;
  image?: string | null;
}
