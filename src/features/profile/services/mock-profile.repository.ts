import { HttpErrorResponse } from '@angular/common/http';
import { Service } from '@angular/core';
import { defer, delay, map, Observable, of } from 'rxjs';
import {
  ClientProfileDto,
  ProfileDashboardDto,
  RedemptionDto,
  TierBenefitDto,
} from '../types/profile.dto';
import {
  ClientProfile,
  ProfileDashboard,
  RedeemedBenefit,
  TierBenefit,
  TierDetail,
  UpdateClientProfileInput,
  UsedBenefit,
} from '../types/profile.model';
import {
  buildProfileDashboardFixture,
  buildRedemptionHistoryFixture,
  buildTierBenefitsFixture,
  buildTierDetailFixture,
} from '../utils/profile.fixture';
import {
  toClientProfile,
  toProfileDashboard,
  toRedeemedBenefit,
  toTierBenefits,
  toTierDetail,
  toUsedBenefits,
} from '../utils/profile.mapper';
import { MOCK_REDEMPTIONS } from '../../redemption-detail/data/redemptions.mock';
import { ProfileRepository } from './profile.repository';

export const MOCK_LATENCY_MS = 400;

/** A redeemed benefit without an end date stays valid this long. */
const REDEMPTION_VALIDITY_DAYS = 30;
const DAY_MS = 24 * 60 * 60 * 1000;

/** A rejection shaped like the backend's: 404 plain-text body, 400 `{ error, status }`. */
function rejection(
  status: number,
  body: string | { error: string; status: number },
): HttpErrorResponse {
  return new HttpErrorResponse({ status, error: body });
}

@Service({ autoProvided: false })
export class MockProfileRepository implements ProfileRepository {
  private currentDashboard: ProfileDashboardDto = buildProfileDashboardFixture(new Date());
  private readonly tierBenefits: readonly TierBenefitDto[] = buildTierBenefitsFixture(new Date());
  private redemptionCount = 0;

  getDashboard(): Observable<ProfileDashboard> {
    return defer(() => of(this.currentDashboard)).pipe(
      delay(MOCK_LATENCY_MS),
      map(toProfileDashboard),
    );
  }

  getTierDetail(): Observable<TierDetail> {
    return defer(() =>
      of({
        ...buildTierDetailFixture(),
        availablePoints: this.currentDashboard.loyalty.availablePoints,
      }),
    ).pipe(delay(MOCK_LATENCY_MS), map(toTierDetail));
  }

  getTierBenefits(): Observable<readonly TierBenefit[]> {
    return defer(() => of(this.tierBenefits)).pipe(delay(MOCK_LATENCY_MS), map(toTierBenefits));
  }

  redeemBenefit(benefitId: string): Observable<RedeemedBenefit> {
    return defer(() => of(this.redeem(benefitId))).pipe(
      delay(MOCK_LATENCY_MS),
      map(toRedeemedBenefit),
    );
  }

  getUsedBenefits(): Observable<readonly UsedBenefit[]> {
    return defer(() => of(buildRedemptionHistoryFixture(new Date()))).pipe(
      delay(MOCK_LATENCY_MS),
      map(toUsedBenefits),
    );
  }

  updateProfile(clientId: string, input: UpdateClientProfileInput): Observable<ClientProfile> {
    const updatedClientDto: ClientProfileDto = {
      id: clientId,
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      phoneNumber: input.phoneNumber,
      avatarUrl: input.avatarUrl,
    };

    this.currentDashboard = {
      ...this.currentDashboard,
      client: updatedClientDto,
    };

    return defer(() => of(updatedClientDto)).pipe(delay(MOCK_LATENCY_MS), map(toClientProfile));
  }

  /** Spends the points and registers an active redemption, so the coupon detail can show it. */
  private redeem(benefitId: string): RedemptionDto {
    const benefit = this.tierBenefits.find(({ externalId }) => externalId === benefitId);
    if (!benefit) {
      throw rejection(404, 'Benefit not found');
    }

    const { loyalty, activeRedemptions } = this.currentDashboard;
    if (loyalty.availablePoints < benefit.pointsCost) {
      throw rejection(400, { error: 'Client does not have enough points', status: 400 });
    }

    const now = new Date();
    this.redemptionCount += 1;
    const sequence = String(this.redemptionCount).padStart(4, '0');
    const redemption: RedemptionDto = {
      externalId: `redemption-mock-${sequence}`,
      date: now.toISOString(),
      usedPoints: benefit.pointsCost,
      state: true,
      validationCode: `VLD-${sequence}-MOCK`,
      benefitName: benefit.name,
      cafeName: benefit.cafeName,
    };

    // Like the backend: a dated benefit expires on a calendar day, an open one on a date-time.
    const expiresAt =
      benefit.endDate ?? new Date(now.getTime() + REDEMPTION_VALIDITY_DAYS * DAY_MS).toISOString();
    const conditions = [
      'Un solo uso por canje.',
      benefit.cafeName === null
        ? 'Válido en cualquier cafetería de la red.'
        : `Válido solo en ${benefit.cafeName}.`,
      'Presenta el código antes de pagar.',
    ];
    this.currentDashboard = {
      ...this.currentDashboard,
      loyalty: { ...loyalty, availablePoints: loyalty.availablePoints - benefit.pointsCost },
      activeRedemptions: [
        {
          id: redemption.externalId,
          title: benefit.name,
          description: benefit.description,
          code: redemption.validationCode,
          expiresAt,
          cafeName: benefit.cafeName,
          conditions,
        },
        ...activeRedemptions,
      ],
    };

    MOCK_REDEMPTIONS.push({
      ...redemption,
      description: benefit.description,
      expiresAt: expiresAt.slice(0, 10),
      conditions: conditions.join('\n'),
    });

    return redemption;
  }
}
