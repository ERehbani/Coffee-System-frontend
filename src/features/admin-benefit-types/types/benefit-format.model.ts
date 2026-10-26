/** The coupon formats the platform supports; checkout discount logic switches on them. */
export const BENEFIT_FORMAT_CODES = [
  'PRODUCTO_POR_PUNTOS',
  'DOS_POR_UNO',
  'CODIGO_DESCUENTO',
  'PRODUCTO_GRATIS_SOCIO',
] as const;

export type BenefitFormatCode = (typeof BENEFIT_FORMAT_CODES)[number];

/** A coupon format registered in the catalog of benefit types. */
export interface BenefitFormat {
  readonly id: string;
  readonly code: BenefitFormatCode;
  readonly displayName: string;
  readonly description: string;
  readonly active: boolean;
  /** How many benefits use this format. */
  readonly usageCount: number;
}

/**
 * What the form saves. `code` picks the format on creation (`null` while none is chosen) and is
 * ignored on update, where the format cannot change.
 */
export interface SaveBenefitFormatInput {
  readonly code: BenefitFormatCode | null;
  readonly displayName: string;
  readonly description: string;
  readonly active: boolean;
}

/** Server-side errors of a save, per field plus one for the form as a whole. */
export interface BenefitFormatFormErrors {
  readonly code?: string;
  readonly displayName?: string;
  readonly description?: string;
  readonly form?: string;
}
