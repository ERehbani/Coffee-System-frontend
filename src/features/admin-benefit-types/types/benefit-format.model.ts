export const BENEFIT_FORMAT_CODES = [
  'PRODUCTO_POR_PUNTOS',
  'DOS_POR_UNO',
  'CODIGO_DESCUENTO',
  'PRODUCTO_GRATIS_SOCIO',
] as const;

export type BenefitFormatCode = (typeof BENEFIT_FORMAT_CODES)[number];

export interface BenefitFormat {
  readonly id: string;
  readonly code: BenefitFormatCode;
  readonly displayName: string;
  readonly description: string;
  readonly active: boolean;
  readonly usageCount: number;
}

export interface SaveBenefitFormatInput {
  readonly code: BenefitFormatCode | null;
  readonly displayName: string;
  readonly description: string;
  readonly active: boolean;
}

export interface BenefitFormatFormErrors {
  readonly code?: string;
  readonly displayName?: string;
  readonly description?: string;
  readonly form?: string;
}
