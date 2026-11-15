import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, of, switchMap } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  BenefitType,
  BenefitTypeOption,
  CafeBenefit,
  CafeBenefitCreation,
  CreateCafeBenefitRequest,
  TierOption,
} from '../model/cafe-benefit.model';

@Injectable({
  providedIn: 'root',
})
export class CafeBenefitService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/benefits`;
  private readonly formatsUrl = `${environment.apiBaseUrl}/benefit-formats`;
  private readonly tiersUrl = `${environment.apiBaseUrl}/tiers`;

  getAll(): Observable<CafeBenefit[]> {
    return this.http.get<CafeBenefit[]>(this.baseUrl);
  }

  /** Creates the benefit and publishes it; a failed publish still emits the saved (unpublished) benefit. */
  create(request: CreateCafeBenefitRequest): Observable<CafeBenefitCreation> {
    const payload = {
      name: request.name,
      description: request.description,
      conditions: request.conditions || null,
      pointsCost: request.pointsCost,
      startDate: request.startDate,
      endDate: request.endDate,
      maxRedemptions: request.maxRedemptions,
      type: request.type,
      discountPercentage: request.discountPercentage ?? null,
      productId: request.productId ?? null,
      tierId: request.tierId,
    };

    return this.http.post<CafeBenefit>(this.baseUrl, payload).pipe(
      switchMap((created) =>
        this.http.post<CafeBenefit>(`${this.baseUrl}/${created.externalId}/publish`, {}).pipe(
          map((benefit) => ({ benefit, publishError: null })),
          catchError((publishError: unknown) => of({ benefit: created, publishError })),
        ),
      ),
    );
  }

  getBenefitTypes(): Observable<BenefitTypeOption[]> {
    return this.http.get<{ code: BenefitType; active: boolean }[]>(this.formatsUrl).pipe(
      map((formats) =>
        formats
          .filter((format) => format.active)
          .map((format) => ({
            id: format.code,
            name: format.code,
            displayName: this.formatTypeName(format.code),
          })),
      ),
    );
  }

  getTiers(): Observable<TierOption[]> {
    return this.http.get<{ externalId: string; name: string; minPoints?: number }[]>(this.tiersUrl).pipe(
      map((tiers) =>
        tiers.map((t) => ({
          id: t.externalId,
          name: t.name,
          displayName: this.formatTierName(t.name, t.minPoints),
          minPoints: t.minPoints,
        })),
      ),
    );
  }

  private formatTypeName(name: string): string {
    switch (name) {
      case 'CODIGO_DESCUENTO':
        return 'Código de Descuento (%)';
      case 'DOS_POR_UNO':
        return 'Promoción 2x1';
      case 'PRODUCTO_POR_PUNTOS':
        return 'Producto por Puntos';
      case 'PRODUCTO_GRATIS_SOCIO':
        return 'Cortesía Gratis Socio';
      default:
        return name;
    }
  }

  private formatTierName(name: string, minPoints?: number): string {
    const formatted = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
    if (minPoints !== undefined && minPoints !== null) {
      return `${formatted} (${minPoints} pts)`;
    }
    return formatted;
  }
}
