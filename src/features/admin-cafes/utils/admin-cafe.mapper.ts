import { AdminCafeDto } from '../types/admin-cafe.dto';
import { AdminCafe } from '../types/admin-cafe.model';

const DEFAULT_CAFE_IMAGE =
  'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1200&h=600&fit=crop&q=80&auto=format';

export function toAdminCafe(dto: AdminCafeDto): AdminCafe {
  return {
    externalId: dto.externalId,
    name: dto.name,
    address: dto.address,
    email: dto.email,
    phoneNumber: dto.phoneNumber ?? '',
    description: dto.description ?? 'Sin descripción disponible.',
    state: dto.state ?? true,
    schedule: dto.schedule ?? 'Horario no especificado',
    image: dto.image && dto.image.trim().length > 0 ? dto.image : DEFAULT_CAFE_IMAGE,
    createdAt: dto.createdAt ?? new Date().toISOString(),
    rating: dto.rating ?? 4.8,
    totalReviews: dto.totalReviews ?? 0,
  };
}

export function toAdminCafeList(dtos: readonly AdminCafeDto[]): readonly AdminCafe[] {
  return dtos.map(toAdminCafe);
}
