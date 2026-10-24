import { Observable } from 'rxjs';
import {
  CreateGlobalBenefitInput,
  GlobalBenefit,
  UpdateGlobalBenefitInput,
} from '../types/global-benefit.model';

export abstract class GlobalBenefitRepository {
  abstract getGlobalBenefits(): Observable<readonly GlobalBenefit[]>;
  abstract getGlobalBenefitById(id: string): Observable<GlobalBenefit | null>;
  abstract createGlobalBenefit(input: CreateGlobalBenefitInput): Observable<GlobalBenefit>;
  abstract updateGlobalBenefit(input: UpdateGlobalBenefitInput): Observable<GlobalBenefit>;
  abstract deleteGlobalBenefit(id: string): Observable<void>;
  abstract togglePublish(id: string, isPublic: boolean): Observable<GlobalBenefit>;
  abstract toggleStatus(id: string, status: boolean): Observable<GlobalBenefit>;
  abstract changeEndDate(id: string, endDate: string): Observable<GlobalBenefit>;
}
