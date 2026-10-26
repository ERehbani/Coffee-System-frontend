import { BenefitFormat } from '../types/benefit-format.model';

/**
 * Mirrors the formats the backend seeds, all active. `PRODUCTO_POR_PUNTOS` is left out so that
 * "Nuevo tipo" has a format to register.
 */
export const BENEFIT_FORMATS_FIXTURE: readonly BenefitFormat[] = [
  {
    id: 'format-descuento',
    code: 'CODIGO_DESCUENTO',
    displayName: 'Descuento',
    description: 'Reduce el precio final del pedido en un porcentaje o monto fijo.',
    active: true,
    usageCount: 12,
  },
  {
    id: 'format-producto-gratis',
    code: 'PRODUCTO_GRATIS_SOCIO',
    displayName: 'Producto gratis',
    description: 'Entrega un producto del catálogo sin costo en puntos adicional.',
    active: true,
    usageCount: 5,
  },
  {
    id: 'format-2x1',
    code: 'DOS_POR_UNO',
    displayName: '2x1',
    description: 'Entrega dos unidades del mismo producto al costo de una.',
    active: true,
    usageCount: 0,
  },
];
