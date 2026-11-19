import {
  BenefitCreateRequestDto,
  BenefitUpdateRequestDto,
  CreateGlobalBenefitInput,
  GlobalBenefit,
  GlobalBenefitDto,
  GlobalBenefitTier,
  GlobalBenefitTierOption,
  GlobalBenefitType,
  GlobalBenefitTypeOption,
  PRODUCT_TYPES,
  UpdateGlobalBenefitInput,
} from '../types/global-benefit.model';
import { toLocalIsoDate } from '../../../shared/utils/local-date';

export const BENEFIT_TYPE_OPTIONS: readonly GlobalBenefitTypeOption[] = [
  { value: 'CODIGO_DESCUENTO', label: 'Código de Descuento', shortLabel: 'Descuento %', description: 'Porcentaje de descuento en el ticket final' },
  { value: 'DOS_POR_UNO', label: 'Promoción 2x1', shortLabel: '2x1', description: 'Llevá 2 productos y pagá solo 1 en toda la red' },
  { value: 'PRODUCTO_POR_PUNTOS', label: 'Producto por Puntos', shortLabel: 'Por Puntos', description: 'Canje directo de productos usando saldo de puntos' },
  { value: 'PRODUCTO_GRATIS_SOCIO', label: 'Cortesía Gratis Socio', shortLabel: 'Gratis Socio', description: 'Bebida sin costo por categoría de fidelidad' },
];

export const BENEFIT_TIER_OPTIONS: readonly GlobalBenefitTierOption[] = [
  { value: 'ALL', label: 'Todos los Socios', minPoints: 0, badgeBg: 'bg-stone-100 text-stone-800 border-stone-300', defaultTierId: '00000000-0000-0000-0001-000000000000' },
  { value: 'BRONCE', label: 'Nivel Bronce', minPoints: 0, badgeBg: 'bg-amber-100 text-amber-900 border-amber-300', defaultTierId: '00000000-0000-0000-0001-000000000001' },
  { value: 'PLATA', label: 'Nivel Plata', minPoints: 1000, badgeBg: 'bg-slate-100 text-slate-800 border-slate-300', defaultTierId: '00000000-0000-0000-0001-000000000002' },
  { value: 'ORO', label: 'Nivel Oro', minPoints: 3000, badgeBg: 'bg-yellow-100 text-yellow-900 border-yellow-300', defaultTierId: '00000000-0000-0000-0001-000000000003' },
  { value: 'DIAMANTE', label: 'Nivel Diamante', minPoints: 7000, badgeBg: 'bg-cyan-100 text-cyan-900 border-cyan-300', defaultTierId: '00000000-0000-0000-0001-000000000004' },
];

export const getBenefitTypeMeta = (type: GlobalBenefitType): GlobalBenefitTypeOption =>
  BENEFIT_TYPE_OPTIONS.find((t) => t.value === type) ?? BENEFIT_TYPE_OPTIONS[0];

export const getTierMeta = (tier: GlobalBenefitTier): GlobalBenefitTierOption =>
  BENEFIT_TIER_OPTIONS.find((t) => t.value === tier) ?? BENEFIT_TIER_OPTIONS[0];

export const resolveTierId = (tier: GlobalBenefitTier, id?: string): string => id || getTierMeta(tier).defaultTierId;

export function toGlobalBenefit(dto: GlobalBenefitDto): GlobalBenefit {
  const type: GlobalBenefitType = dto.benefitType ?? 'CODIGO_DESCUENTO';
  const r = dto.tierName?.toUpperCase() || '';
  const tier: GlobalBenefitTier = r.includes('DIAMANTE') ? 'DIAMANTE' : r.includes('ORO') ? 'ORO' : r.includes('PLATA') ? 'PLATA' : r.includes('BRONCE') ? 'BRONCE' : 'ALL';
  const today = toLocalIsoDate();

  return {
    id: dto.externalId,
    name: dto.name,
    description: dto.description || '',
    pointsCost: dto.pointsCost ?? 0,
    type,
    tier,
    tierId: dto.tierId || resolveTierId(tier),
    startDate: dto.startDate || today,
    endDate: dto.endDate || today,
    maxRedemptions: dto.maxRedemptions ?? 100,
    currentRedemptions: dto.redeemedCount ?? 0,
    soldOut: dto.soldOut ?? false,
    status: dto.status ?? true,
    isPublic: dto.isPublic ?? true,
    discountPercent: dto.discountPercentage ?? undefined,
    catalogProductId: dto.catalogProductId ?? undefined,
    productName: dto.productName ?? undefined,
    termsAndConditions: dto.conditions ?? '',
    image: dto.image ?? undefined,
    createdAt: today,
  };
}

export const toGlobalBenefitList = (dtos: readonly GlobalBenefitDto[]): readonly GlobalBenefit[] =>
  dtos.filter((d) => d.global).map(toGlobalBenefit);

function toRequestDto(input: CreateGlobalBenefitInput): BenefitCreateRequestDto {
  return {
    name: input.name.trim(),
    description: input.description.trim(),
    pointsCost: Number(input.pointsCost),
    startDate: input.startDate,
    endDate: input.endDate,
    maxRedemptions: Number(input.maxRedemptions),
    type: input.type,
    discountPercentage: input.type === 'CODIGO_DESCUENTO' ? Number(input.discountPercent ?? 15) : null,
    catalogProductId: PRODUCT_TYPES.includes(input.type) ? input.catalogProductId ?? null : null,
    cafeId: null,
    tierId: resolveTierId(input.tier, input.tierId),
    conditions: input.termsAndConditions?.trim() || null,
    image: input.image?.trim() || null,
  };
}

export const toCreateRequestDto = (input: CreateGlobalBenefitInput): BenefitCreateRequestDto => toRequestDto(input);

export const toUpdateRequestDto = (input: UpdateGlobalBenefitInput): BenefitUpdateRequestDto => toRequestDto(input);
