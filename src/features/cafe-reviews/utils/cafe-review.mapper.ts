import { ReviewResponseDto } from '../types/cafe-review.dto';
import { CafeReview } from '../types/cafe-review.model';

export function toCafeReview(dto: ReviewResponseDto): CafeReview {
  return {
    id: dto.externalId,
    clientName: dto.clientName?.trim() || 'Cliente',
    rating: dto.rating,
    date: dto.date,
    message: dto.message?.trim() ?? '',
  };
}

// Las fechas ISO se ordenan como texto; el id desempata las reseñas del mismo día.
export function toCafeReviews(dtos: readonly ReviewResponseDto[]): CafeReview[] {
  return dtos.map(toCafeReview).sort((a, b) => b.date.localeCompare(a.date) || a.id.localeCompare(b.id));
}
