import { CouponBenefit } from '../types/coupon.model';

const PERCENTAGE_FORMAT = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 2 });

export function describeCouponReward(benefit: CouponBenefit): string {
  switch (benefit.kind) {
    case 'percentage-discount':
      return `${PERCENTAGE_FORMAT.format(benefit.percentage)}% de descuento`;
    case 'two-for-one':
      return `2x1 en ${benefit.product.name}`;
    case 'free-product':
      return `${benefit.product.name} gratis`;
  }
}
