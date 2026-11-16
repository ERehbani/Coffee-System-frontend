import { ValidatedCoupon } from '../types/coupon-validation.model';

const PERCENT_FORMAT = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 2 });

function discountLabel(percentage: number | null): string {
  return percentage === null ? 'Descuento' : `${PERCENT_FORMAT.format(percentage)}% de descuento`;
}

export function toRewardLabel(coupon: ValidatedCoupon): string | null {
  const product = coupon.productName;
  switch (coupon.benefitType) {
    case 'CODIGO_DESCUENTO':
      return discountLabel(coupon.discountPercentage);
    case 'DOS_POR_UNO':
      return product ? `2x1 en ${product}` : '2x1';
    case 'PRODUCTO_POR_PUNTOS':
      return product ?? 'Producto canjeado con puntos';
    case 'PRODUCTO_GRATIS_SOCIO':
      return product ? `${product} gratis` : 'Producto gratis';
    default:
      return null;
  }
}
