import { BenefitFormatCode } from '../types/benefit-format.model';

const LABELS: Readonly<Record<BenefitFormatCode, string>> = {
  CODIGO_DESCUENTO: 'Código de descuento',
  DOS_POR_UNO: '2x1',
  PRODUCTO_POR_PUNTOS: 'Producto por puntos',
  PRODUCTO_GRATIS_SOCIO: 'Producto gratis para socios',
};

/** Spanish name of a coupon format. */
export function benefitFormatLabel(code: BenefitFormatCode): string {
  return LABELS[code];
}
