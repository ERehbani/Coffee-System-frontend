export type BenefitType = 'CODIGO_DESCUENTO' | 'DOS_POR_UNO' | 'PRODUCTO_POR_PUNTOS' | 'PRODUCTO_GRATIS_SOCIO';

export const PRODUCT_BENEFIT_TYPES: readonly BenefitType[] = [
  'DOS_POR_UNO',
  'PRODUCTO_POR_PUNTOS',
  'PRODUCTO_GRATIS_SOCIO',
];

export interface CreateCafeBenefitRequest {
  name: string;
  description: string;
  conditions?: string | null;
  pointsCost: number;
  startDate: string;
  endDate: string;
  maxRedemptions: number | null;
  type: BenefitType;
  tierId: string;
  productId?: string | null;
  discountPercentage?: number | null;
  image?: string | null;
}

export interface UpdateCafeBenefitRequest extends CreateCafeBenefitRequest {
  maxPerClient?: number | null;
}

export interface CafeBenefit {
  externalId: string;
  name: string;
  description: string;
  conditions?: string | null;
  pointsCost: number;
  status: boolean;
  isPublic: boolean;
  maxRedemptions: number | null;
  maxPerClient?: number | null;
  redeemedCount?: number | null;
  remainingRedemptions?: number | null;
  soldOut?: boolean;
  cafeEntity?: string | null;
  global: boolean;
  benefitType?: BenefitType | null;
  productId?: string | null;
  productName?: string | null;
  tierId?: string | null;
  tierName?: string | null;
  tierMinPoints?: number | null;
  startDate?: string | null;
  endDate?: string | null;
  discountPercentage?: number | null;
  image?: string | null;
}

export interface CafeBenefitCreation {
  benefit: CafeBenefit;
  publishError: unknown;
}

export interface BenefitTypeOption {
  id: BenefitType;
  name: BenefitType;
  displayName: string;
}

export interface TierOption {
  id: string;
  name: string;
  displayName: string;
  minPoints?: number;
}

export interface ProductOption {
  id: string;
  name: string;
}
