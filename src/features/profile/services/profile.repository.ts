import { Observable } from 'rxjs';
import {
  ClientProfile,
  ProfileDashboard,
  RedeemedBenefit,
  TierBenefit,
  TierDetail,
  UpdateClientProfileInput,
  UsedBenefit,
} from '../types/profile.model';

export abstract class ProfileRepository {
  abstract getDashboard(): Observable<ProfileDashboard>;
  abstract getTierDetail(): Observable<TierDetail>;
  abstract getTierBenefits(): Observable<readonly TierBenefit[]>;
  abstract redeemBenefit(benefitId: string): Observable<RedeemedBenefit>;
  abstract getUsedBenefits(): Observable<readonly UsedBenefit[]>;
  abstract updateProfile(clientId: string, input: UpdateClientProfileInput): Observable<ClientProfile>;
}
