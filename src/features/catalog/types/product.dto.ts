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
  readonly catalogProductId: string | null;
  readonly available: boolean;
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
  image?: string | null;
  tags?: string[];
}

export interface PointsRange {
  readonly suggested: number;
  readonly min: number;
  readonly max: number;
  readonly referencePrice: number;
  readonly cafesSelling: number;
}

export interface PointsRangeQuery {
  readonly price: number;
  readonly catalogProductId?: string | null;
  readonly name?: string | null;
}

export interface CategoryOption {
  categoryId: string;
  name: string;
}
