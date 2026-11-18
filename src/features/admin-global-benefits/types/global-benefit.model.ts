export type GlobalBenefitType = 'CODIGO_DESCUENTO' | 'DOS_POR_UNO' | 'PRODUCTO_POR_PUNTOS' | 'PRODUCTO_GRATIS_SOCIO';
export type GlobalBenefitTier = 'ALL' | 'BRONCE' | 'PLATA' | 'ORO' | 'DIAMANTE';

export const PRODUCT_TYPES: readonly GlobalBenefitType[] = ['DOS_POR_UNO', 'PRODUCTO_POR_PUNTOS', 'PRODUCTO_GRATIS_SOCIO'];

export interface CatalogProductOption {
  readonly id: string;
  readonly name: string;
}

export interface GlobalBenefitTypeOption {
  readonly value: GlobalBenefitType;
  readonly label: string;
  readonly shortLabel: string;
  readonly description: string;
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
  readonly tier: GlobalBenefitTier;
  readonly tierId: string;
  readonly startDate: string;
  readonly endDate: string;
  readonly maxRedemptions: number;
  readonly currentRedemptions: number;
  readonly soldOut: boolean;
  readonly status: boolean;
  readonly isPublic: boolean;
  readonly discountPercent?: number;
  readonly catalogProductId?: string;
  readonly productName?: string;
  readonly termsAndConditions?: string;
  readonly createdAt: string;
  readonly updatedAt?: string;
}

export interface CreateGlobalBenefitInput {
  readonly name: string;
  readonly description: string;
  readonly pointsCost: number;
  readonly type: GlobalBenefitType;
  readonly tier: GlobalBenefitTier;
  readonly tierId?: string;
  readonly startDate: string;
  readonly endDate: string;
  readonly maxRedemptions: number;
  readonly discountPercent?: number;
  readonly catalogProductId?: string;
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
  readonly global: boolean;
  readonly startDate?: string;
  readonly endDate?: string;
  readonly benefitType?: GlobalBenefitType | null;
  readonly tierId?: string;
  readonly tierName?: string;
  readonly redeemedCount?: number;
  readonly soldOut?: boolean;
  readonly discountPercentage?: number | null;
  readonly catalogProductId?: string | null;
  readonly productName?: string | null;
  readonly conditions?: string | null;
}

export interface BenefitCreateRequestDto {
  readonly name: string;
  readonly description: string;
  readonly pointsCost: number;
  readonly startDate: string;
  readonly endDate: string;
  readonly maxRedemptions: number;
  readonly type: GlobalBenefitType;
  readonly discountPercentage: number | null;
  readonly catalogProductId: string | null;
  readonly cafeId: null;
  readonly tierId: string;
  readonly conditions: string | null;
}

export interface BenefitUpdateRequestDto {
  readonly name: string;
  readonly description: string;
  readonly pointsCost: number;
  readonly startDate: string;
  readonly endDate: string;
  readonly maxRedemptions: number;
  readonly type: GlobalBenefitType;
  readonly discountPercentage: number | null;
  readonly catalogProductId: string | null;
  readonly cafeId: null;
  readonly tierId: string;
  readonly conditions: string | null;
}

export interface NewEndDateRequestDto {
  readonly endDate: string;
}
