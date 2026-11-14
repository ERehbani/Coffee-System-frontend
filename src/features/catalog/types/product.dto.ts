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
