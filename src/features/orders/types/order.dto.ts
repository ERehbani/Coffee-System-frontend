// Based on the backend PurchaseResponse / ReviewResponse. Fields marked "frontend-only"
// don't exist in the backend yet and are only served by the mock.

export type PurchaseStatusDto = string;

export interface PurchaseDto {
  readonly externalId: string;
  readonly date: string;
  readonly price: number;
  readonly status: PurchaseStatusDto;
  readonly details: readonly PurchaseDetailDto[];
  /** frontend-only */
  readonly cafe: PurchaseCafeDto;
  /** frontend-only: review left for this purchase, if any */
  readonly review: ReviewDto | null;
}

export interface PurchaseCafeDto {
  readonly externalId: string;
  readonly name: string;
  readonly imageUrl: string | null;
}

export interface PurchaseDetailDto {
  readonly externalId: string;
  readonly productName: string;
  readonly amount: number;
  readonly subtotal: number;
}

export interface ReviewCreateRequestDto {
  readonly cafeId: string;
  readonly message: string;
  /** frontend-only */
  readonly purchaseId: string;
  /** frontend-only: 1 to 5 */
  readonly rating: number;
}

export interface ReviewDto {
  readonly externalId: string;
  readonly message: string;
  readonly date: string;
  /** frontend-only */
  readonly rating: number;
}
