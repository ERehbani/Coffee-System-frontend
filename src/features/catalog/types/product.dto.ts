export interface ProductDto {
  readonly externalId: string;
  readonly name: string;
  readonly description: string | null;
  readonly price: number;
  readonly awardedPoints: number | null;
  readonly cafe: string;
  readonly categoryId: string | null;
  readonly category: string | null;
  readonly image: string | null;
  readonly state: boolean;
  readonly tags: readonly string[] | null;
}

export interface CreateProductRequest {
  name: string;
  description?: string | null;
  price: number;
  awardedPoints: number;
  categoryId: string;
  image?: string | null;
  tags?: string[];
}

export interface UpdateProductRequest {
  name?: string;
  description?: string | null;
  price?: number;
  awardedPoints?: number;
  categoryId?: string;
  image?: string | null;
  tags?: string[];
  state?: boolean;
}

export interface CategoryOption {
  categoryId: string;
  name: string;
}
