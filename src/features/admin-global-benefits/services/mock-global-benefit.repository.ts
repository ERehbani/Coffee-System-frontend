import { Injectable } from '@angular/core';
import { delay, Observable, of, throwError } from 'rxjs';
import { CreateGlobalBenefitInput, GlobalBenefit, UpdateGlobalBenefitInput } from '../types/global-benefit.model';
import { GLOBAL_BENEFITS_FIXTURE } from '../utils/global-benefit.fixture';
import { resolveTierId, resolveTypeId } from '../utils/global-benefit.mapper';
import { GlobalBenefitRepository } from './global-benefit.repository';

@Injectable()
export class MockGlobalBenefitRepository implements GlobalBenefitRepository {
  private benefits: GlobalBenefit[] = GLOBAL_BENEFITS_FIXTURE.map((b) => ({ ...b }));

  getGlobalBenefits(): Observable<readonly GlobalBenefit[]> {
    return of([...this.benefits]).pipe(delay(100));
  }

  getGlobalBenefitById(id: string): Observable<GlobalBenefit | null> {
    const found = this.benefits.find((b) => b.id === id);
    return of(found ? { ...found } : null).pipe(delay(100));
  }

  createGlobalBenefit(input: CreateGlobalBenefitInput): Observable<GlobalBenefit> {
    const today = new Date().toISOString().slice(0, 10);
    const newBenefit: GlobalBenefit = {
      ...input,
      id: `gb-${Date.now().toString(36)}`,
      pointsCost: Number(input.pointsCost),
      maxRedemptions: Number(input.maxRedemptions),
      typeId: resolveTypeId(input.type, input.typeId),
      tierId: resolveTierId(input.tier, input.tierId),
      currentRedemptions: 0,
      isGlobal: 'GLOBAL_BENEFIT',
      createdAt: today,
    };
    this.benefits = [newBenefit, ...this.benefits];
    return of(newBenefit).pipe(delay(100));
  }

  updateGlobalBenefit(input: UpdateGlobalBenefitInput): Observable<GlobalBenefit> {
    const idx = this.benefits.findIndex((b) => b.id === input.id);
    if (idx === -1) return throwError(() => new Error(`Beneficio "${input.id}" no encontrado.`));
    const updated: GlobalBenefit = {
      ...this.benefits[idx],
      ...input,
      pointsCost: Number(input.pointsCost),
      maxRedemptions: Number(input.maxRedemptions),
      typeId: resolveTypeId(input.type, input.typeId),
      tierId: resolveTierId(input.tier, input.tierId),
      updatedAt: new Date().toISOString().slice(0, 10),
    };
    this.benefits[idx] = updated;
    return of(updated).pipe(delay(100));
  }

  deleteGlobalBenefit(id: string): Observable<void> {
    this.benefits = this.benefits.filter((b) => b.id !== id);
    return of(void 0).pipe(delay(100));
  }

  togglePublish(id: string, isPublic: boolean): Observable<GlobalBenefit> {
    const b = this.benefits.find((item) => item.id === id);
    if (!b) return throwError(() => new Error('No encontrado'));
    const updated: GlobalBenefit = { ...b, isPublic, status: isPublic ? true : b.status };
    this.benefits = this.benefits.map((item) => (item.id === id ? updated : item));
    return of(updated).pipe(delay(100));
  }

  toggleStatus(id: string, status: boolean): Observable<GlobalBenefit> {
    const b = this.benefits.find((item) => item.id === id);
    if (!b) return throwError(() => new Error('No encontrado'));
    const updated: GlobalBenefit = { ...b, status, isPublic: !status ? false : b.isPublic };
    this.benefits = this.benefits.map((item) => (item.id === id ? updated : item));
    return of(updated).pipe(delay(100));
  }

  changeEndDate(id: string, endDate: string): Observable<GlobalBenefit> {
    const b = this.benefits.find((item) => item.id === id);
    if (!b) return throwError(() => new Error('No encontrado'));
    const updated: GlobalBenefit = { ...b, endDate };
    this.benefits = this.benefits.map((item) => (item.id === id ? updated : item));
    return of(updated).pipe(delay(100));
  }
}
