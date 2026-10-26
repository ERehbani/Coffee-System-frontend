import { IconName } from '../../../shared/components/icon/icon-registry';

export type GlobalBenefitType = 'CODIGO_DESCUENTO' | 'DOS_POR_UNO' | 'PRODUCTO_POR_PUNTOS' | 'PRODUCTO_GRATIS_SOCIO';
export type GlobalBenefitTier = 'ALL' | 'BRONCE' | 'PLATA' | 'ORO' | 'DIAMANTE';

export interface GlobalBenefitTypeOption {
  readonly value: GlobalBenefitType;
  readonly label: string;
  readonly shortLabel: string;
  readonly description: string;
  readonly icon: IconName;
  readonly defaultTypeId: string;
}

export interface GlobalBenefitTierOption {
  readonly value: GlobalBenefitTier;
  readonly label: string;
  readonly minPoints: number;
  readonly badgeBg: string;
  readonly defaultTierId: string;
}

export interface GlobalBenefit {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly pointsCost: number;
  readonly type: GlobalBenefitType;
  readonly typeId: string;
  readonly tier: GlobalBenefitTier;
  readonly tierId: string;
  readonly startDate: string;
  readonly endDate: string;
  readonly maxRedemptions: number;
  readonly currentRedemptions: number;
  readonly status: boolean;
  readonly isPublic: boolean;
  readonly isGlobal: 'GLOBAL_BENEFIT';
  readonly discountPercent?: number;
  readonly termsAndConditions?: string;
  readonly createdAt: string;
  readonly updatedAt?: string;
}

export interface CreateGlobalBenefitInput {
  readonly name: string;
  readonly description: string;
  readonly pointsCost: number;
  readonly type: GlobalBenefitType;
  readonly typeId?: string;
  readonly tier: GlobalBenefitTier;
  readonly tierId?: string;
  readonly startDate: string;
  readonly endDate: string;
  readonly maxRedemptions: number;
  readonly discountPercent?: number;
  readonly status: boolean;
  readonly isPublic: boolean;
  readonly termsAndConditions?: string;
}

export interface UpdateGlobalBenefitInput extends CreateGlobalBenefitInput {
  readonly id: string;
}

export interface GlobalBenefitStatsSummary {
  readonly total: number;
  readonly active: number;
  readonly publicCount: number;
  readonly avgPoints: number;
  readonly totalRedemptions: number;
}

export interface GlobalBenefitDto {
  readonly externalId: string;
  readonly name: string;
  readonly pointsCost: number;
  readonly status: boolean;
  readonly isPublic: boolean;
  readonly maxRedemptions: number;
  readonly description: string;
  readonly cafeEntity?: string | null;
  readonly isGlobal: 'GLOBAL_BENEFIT' | 'CAFFETERIA_BENEFIT';
  readonly startDate?: string;
  readonly endDate?: string;
  readonly typeId?: string;
  readonly typeName?: string;
  readonly tierId?: string;
  readonly tierName?: string;
  readonly currentRedemptions?: number;
  readonly discountPercent?: number;
  readonly termsAndConditions?: string;
  readonly createdAt?: string;
}

export interface BenefitCreateRequestDto {
  readonly name: string;
  readonly description: string;
  readonly pointsCost: number;
  readonly startDate: string;
  readonly endDate: string;
  readonly maxRedemptions: number;
  readonly typeId: string;
  readonly cafeId: null;
  readonly tierId: string;
}

export interface BenefitUpdateRequestDto {
  readonly name: string;
  readonly description: string;
  readonly pointsCost: number;
  readonly startDate: string;
  readonly endDate: string;
  readonly maxRedemptions: number;
  readonly typeId: string;
  readonly cafeId: null;
  readonly tierId: string;
}

export interface NewEndDateRequestDto {
  readonly endDate: string;
}
