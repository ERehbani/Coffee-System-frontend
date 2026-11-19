export interface CafeReview {
  readonly id: string;
  readonly clientName: string;
  readonly rating: number;
  // Fecha ISO sin hora (yyyy-MM-dd); formatear con DatePipe, nunca con new Date(date).
  readonly date: string;
  readonly message: string;
}
