export interface CafeReview {
  readonly id: string;
  readonly clientName: string;
  /** Whole stars, 1 to 5. */
  readonly rating: number;
  /** Date-only ISO string (yyyy-MM-dd); format it with DatePipe, never `new Date(date)`. */
  readonly date: string;
  readonly message: string;
}
