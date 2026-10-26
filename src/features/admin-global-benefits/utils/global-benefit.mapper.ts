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
  UpdateGlobalBenefitInput,
} from '../types/global-benefit.model';

export const BENEFIT_TYPE_OPTIONS: readonly GlobalBenefitTypeOption[] = [
  { value: 'CODIGO_DESCUENTO', label: 'Código de Descuento', shortLabel: 'Descuento %', description: 'Porcentaje de descuento en el ticket final', icon: 'tag', defaultTypeId: '00000000-0000-0000-0000-000000000001' },
  { value: 'DOS_POR_UNO', label: 'Promoción 2x1', shortLabel: '2x1', description: 'Llevá 2 productos y pagá solo 1 en toda la red', icon: 'ticket', defaultTypeId: '00000000-0000-0000-0000-000000000002' },
  { value: 'PRODUCTO_POR_PUNTOS', label: 'Producto por Puntos', shortLabel: 'Por Puntos', description: 'Canje directo de productos usando saldo de puntos', icon: 'coffee', defaultTypeId: '00000000-0000-0000-0000-000000000003' },
  { value: 'PRODUCTO_GRATIS_SOCIO', label: 'Cortesía Gratis Socio', shortLabel: 'Gratis Socio', description: 'Bebida sin costo por categoría de fidelidad', icon: 'gift', defaultTypeId: '00000000-0000-0000-0000-000000000004' },
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

export const resolveTypeId = (type: GlobalBenefitType, id?: string): string => id || getBenefitTypeMeta(type).defaultTypeId;
export const resolveTierId = (tier: GlobalBenefitTier, id?: string): string => id || getTierMeta(tier).defaultTierId;

export function toGlobalBenefit(dto: GlobalBenefitDto): GlobalBenefit {
  const t = dto.typeName?.toUpperCase() || '';
  const type: GlobalBenefitType = t.includes('2X1') || t.includes('DOS') ? 'DOS_POR_UNO' : t.includes('PUNTOS') ? 'PRODUCTO_POR_PUNTOS' : t.includes('GRATIS') ? 'PRODUCTO_GRATIS_SOCIO' : 'CODIGO_DESCUENTO';
  const r = dto.tierName?.toUpperCase() || '';
  const tier: GlobalBenefitTier = r.includes('DIAMANTE') ? 'DIAMANTE' : r.includes('ORO') ? 'ORO' : r.includes('PLATA') ? 'PLATA' : r.includes('BRONCE') ? 'BRONCE' : 'ALL';
  const today = new Date().toISOString().slice(0, 10);
  const parsedDiscount = dto.discountPercent ?? (dto.description?.match(/(\d+)%\s*OFF/i)?.[1] ? Number(dto.description.match(/(\d+)%\s*OFF/i)?.[1]) : undefined);

  return {
    id: dto.externalId,
    name: dto.name,
    description: dto.description || '',
    pointsCost: dto.pointsCost ?? 0,
    type,
    typeId: dto.typeId || resolveTypeId(type),
    tier,
    tierId: dto.tierId || resolveTierId(tier),
    startDate: dto.startDate || today,
    endDate: dto.endDate || today,
    maxRedemptions: dto.maxRedemptions ?? 100,
    currentRedemptions: dto.currentRedemptions ?? 0,
    status: dto.status ?? true,
    isPublic: dto.isPublic ?? true,
    isGlobal: 'GLOBAL_BENEFIT',
    discountPercent: parsedDiscount,
    termsAndConditions: dto.termsAndConditions || 'Válido en toda la red.',
    createdAt: dto.createdAt || today,
  };
}

export const toGlobalBenefitList = (dtos: readonly GlobalBenefitDto[]): readonly GlobalBenefit[] =>
  dtos.filter((d) => d.isGlobal === 'GLOBAL_BENEFIT' || !d.cafeEntity).map(toGlobalBenefit);

export function toCreateRequestDto(input: CreateGlobalBenefitInput): BenefitCreateRequestDto {
  let description = input.description.trim();
  if (input.discountPercent && !description.includes(`${input.discountPercent}%`)) {
    description = `${description} (${input.discountPercent}% OFF)`;
  }
  if (input.termsAndConditions && !description.includes(input.termsAndConditions)) {
    description = `${description}. ${input.termsAndConditions}`;
  }

  return {
    name: input.name.trim(),
    description,
    pointsCost: Number(input.pointsCost),
    startDate: input.startDate,
    endDate: input.endDate,
    maxRedemptions: Number(input.maxRedemptions),
    typeId: resolveTypeId(input.type, input.typeId),
    cafeId: null,
    tierId: resolveTierId(input.tier, input.tierId),
  };
}

export function toUpdateRequestDto(input: UpdateGlobalBenefitInput): BenefitUpdateRequestDto {
  let description = input.description.trim();
  if (input.discountPercent && !description.includes(`${input.discountPercent}%`)) {
    description = `${description} (${input.discountPercent}% OFF)`;
  }
  if (input.termsAndConditions && !description.includes(input.termsAndConditions)) {
    description = `${description}. ${input.termsAndConditions}`;
  }

  return {
    name: input.name.trim(),
    description,
    pointsCost: Number(input.pointsCost),
    startDate: input.startDate,
    endDate: input.endDate,
    maxRedemptions: Number(input.maxRedemptions),
    typeId: resolveTypeId(input.type, input.typeId),
    cafeId: null,
    tierId: resolveTierId(input.tier, input.tierId),
  };
}
