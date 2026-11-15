export interface ReviewResponseDto {
  readonly externalId: string;
  readonly message: string | null;
  readonly rating: number;
  /** Date-only ISO string (yyyy-MM-dd). */
  readonly date: string;
  readonly clientId: string;
  readonly clientName: string | null;
  readonly cafeId: string;
  readonly purchaseId: string;
}
