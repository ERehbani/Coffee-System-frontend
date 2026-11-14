export interface CreateCafeBenefitRequest {
  name: string;
  description: string;
  conditions?: string | null;
  pointsCost: number;
  startDate: string;
  endDate: string;
  maxRedemptions: number;
  typeId: string;
  tierId: string;
  cafeId?: string | null;
  discountPercentage?: number | null;
}

export interface CafeBenefit {
  externalId: string;
  name: string;
  description: string;
  conditions?: string | null;
  pointsCost: number;
  status: boolean;
  isPublic: boolean;
  maxRedemptions: number;
  cafeEntity?: string | null;
  isGlobal?: string | null;
  benefitType?: string | null;
  typeId?: string | null;
  tierId?: string | null;
  tierName?: string | null;
  tierMinPoints?: number | null;
  startDate?: string | null;
  endDate?: string | null;
  discountPercentage?: number | null;
}

export interface BenefitTypeOption {
  id: string;
  name: string;
  displayName: string;
  porcentajeDescuento?: number | null;
}

export interface TierOption {
  id: string;
  name: string;
  displayName: string;
  minPoints?: number;
}

