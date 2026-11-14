import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  BenefitTypeOption,
  CafeBenefit,
  CreateCafeBenefitRequest,
  TierOption,
} from '../model/cafe-benefit.model';

@Injectable({
  providedIn: 'root',
})
export class CafeBenefitService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/benefits`;
  private readonly typesUrl = `${environment.apiBaseUrl}/benefittypes`;
  private readonly tiersUrl = `${environment.apiBaseUrl}/tiers`;

  getAll(): Observable<CafeBenefit[]> {
    return this.http.get<CafeBenefit[]>(this.baseUrl);
  }

  create(request: CreateCafeBenefitRequest): Observable<CafeBenefit> {
    const payload = {
      name: request.name,
      description: request.description,
      conditions: request.conditions || null,
      pointsCost: request.pointsCost,
      startDate: request.startDate,
      endDate: request.endDate,
      maxRedemptions: request.maxRedemptions,
      typeId: request.typeId,
      tierId: request.tierId,
      ...(request.cafeId ? { cafeId: request.cafeId } : {}),
    };

    return this.http.post<CafeBenefit>(this.baseUrl, payload);
  }

  getBenefitTypes(): Observable<BenefitTypeOption[]> {
    return this.http.get<{ externalId: string; name: string; porcentajeDescuento?: number }[]>(this.typesUrl).pipe(
      map((types) =>
        types.map((t) => ({
          id: t.externalId,
          name: t.name,
          displayName: this.formatTypeName(t.name),
          porcentajeDescuento: t.porcentajeDescuento,
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
