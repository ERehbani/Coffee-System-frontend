import { inject, Injectable } from '@angular/core';
import { delay, map, Observable, of, throwError } from 'rxjs';
import { Cafe } from '../../home/model/cafe.model';
import { CafeService } from '../../home/services/cafe.service';
import { AdminCafe, CreateCafeInput } from '../types/admin-cafe.model';
import { AdminCafeRepository } from './admin-cafe.repository';

export const MOCK_CAFE_LATENCY_MS = 250;

const DEFAULT_CAFE_IMAGE =
  'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1200&h=600&fit=crop&q=80&auto=format';

export function toAdminCafeFromHomeCafe(cafe: Cafe): AdminCafe {
  return {
    externalId: cafe.externalId,
    name: cafe.name,
    address: cafe.address,
    email: cafe.email,
    phoneNumber: cafe.phoneNumber ?? '',
    description: cafe.description ?? 'Sin descripción disponible.',
    state: cafe.state ?? true,
    schedule: cafe.schedule ?? 'Horario no especificado',
    image: cafe.image && cafe.image.trim().length > 0 ? cafe.image : DEFAULT_CAFE_IMAGE,
    createdAt: cafe.createdAt ?? new Date().toISOString(),
    rating: cafe.rating ?? 4.8,
    totalReviews: cafe.reviewCount ?? 0,
  };
}

@Injectable()
export class MockAdminCafeRepository implements AdminCafeRepository {
  private readonly cafeService = inject(CafeService);

  getCafes(): Observable<readonly AdminCafe[]> {
    return this.cafeService.getAll().pipe(
      delay(MOCK_CAFE_LATENCY_MS),
      map((cafes) => cafes.map(toAdminCafeFromHomeCafe)),
    );
  }

  getCafeById(externalId: string): Observable<AdminCafe | null> {
    return this.cafeService.getByExternalId(externalId).pipe(
      delay(MOCK_CAFE_LATENCY_MS),
      map((cafe) => (cafe ? toAdminCafeFromHomeCafe(cafe) : null)),
    );
  }

  registerCafe(request: CreateCafeInput): Observable<AdminCafe> {
    const existing = this.cafeService.getAllRaw();
    const emailNormalized = request.email.trim().toLowerCase();
    const exists = existing.some((c) => c.email.toLowerCase() === emailNormalized);
    if (exists) {
      return throwError(
        () => new Error(`Ya existe una cafetería registrada con el email ${request.email}`),
      );
    }

    const slug = request.name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 15);
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const externalId = `cafe-${slug || 'comercio'}-${randomSuffix}`;

    const newHomeCafe: Cafe = {
      externalId,
      name: request.name.trim(),
      address: request.address.trim(),
      email: emailNormalized,
      phoneNumber: request.phoneNumber?.trim() || null,
      description: request.description?.trim() || null,
      state: true,
      schedule: request.schedule?.trim() || null,
      image: request.image?.trim() || DEFAULT_CAFE_IMAGE,
      rating: 5.0,
      reviewCount: 0,
      createdAt: new Date().toISOString(),
    };

    // Synchronize with shared CafeService and localStorage
    this.cafeService.addCafe(newHomeCafe);

    return of(toAdminCafeFromHomeCafe(newHomeCafe)).pipe(delay(MOCK_CAFE_LATENCY_MS));
  }

  updateCafeStatus(externalId: string, state: boolean): Observable<AdminCafe> {
    const updated = this.cafeService.updateCafeStatus(externalId, state);
    if (!updated) {
      return throwError(() => new Error(`Cafetería con ID ${externalId} no encontrada`));
    }
    return of(toAdminCafeFromHomeCafe(updated)).pipe(delay(MOCK_CAFE_LATENCY_MS));
  }
}
