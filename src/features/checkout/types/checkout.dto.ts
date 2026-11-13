export type PurchaseStatusDto = 'CONFIRMED' | 'CANCELLED' | 'REFUNDED';

export interface CreatePurchaseRequestDto {
  readonly cartId: string;
  readonly validationCode?: string;
}

export interface PurchaseDetailResponseDto {
  readonly externalId: string;
  readonly productId: string;
  readonly productName: string;
  readonly amount: number;
  readonly unitPrice: number;
  readonly generatedPoints: number;
  readonly subtotal: number;
}

export interface PurchaseResponseDto {
  readonly externalId: string;
  readonly date: string;
  readonly price: number;
  readonly status: PurchaseStatusDto;
  readonly clientId: string;
  readonly clientName: string | null;
  readonly cafeId: string;
  readonly cafeName: string;
  readonly redemptionId: string | null;
  readonly details: readonly PurchaseDetailResponseDto[];
  readonly reviewed: boolean;
}
