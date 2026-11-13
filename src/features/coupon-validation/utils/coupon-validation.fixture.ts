import { RedemptionResponseDto } from '../types/coupon-validation.dto';

export const MOCK_CAFE_ID = 'cafe-central-001';

export const MOCK_VALIDATION_CODES = {
  discount: '11111111-1111-4111-8111-111111111111',
  twoForOne: '22222222-2222-4222-8222-222222222222',
  productForPoints: '33333333-3333-4333-8333-333333333333',
  memberFreeProduct: '44444444-4444-4444-8444-444444444444',
  used: '55555555-5555-4555-8555-555555555555',
  otherCafe: '66666666-6666-4666-8666-666666666666',
  global: '77777777-7777-4777-8777-777777777777',
} as const;

const CAFE_CENTRAL_COUPON: RedemptionResponseDto = {
  externalId: 'redemption-mock-base',
  date: '2026-11-10T10:30:00',
  usedPoints: 300,
  state: true,
  validationCode: '',
  benefitName: '',
  cafeName: 'Café Central',
  description: null,
  expiresAt: '2026-12-31',
  conditions: null,
  usedDate: null,
  cafeId: MOCK_CAFE_ID,
  benefitType: null,
  discountPercentage: null,
  productId: null,
  productName: null,
  productPrice: null,
};

function coupon(overrides: Partial<RedemptionResponseDto>): RedemptionResponseDto {
  return { ...CAFE_CENTRAL_COUPON, ...overrides };
}

export const COUPON_VALIDATION_FIXTURE: readonly RedemptionResponseDto[] = [
  coupon({
    externalId: 'redemption-mock-discount',
    validationCode: MOCK_VALIDATION_CODES.discount,
    benefitName: '15% off en tu pedido',
    description: 'Descuento sobre el total de la compra',
    conditions: 'Un solo uso por cliente.\nNo acumulable con otras promociones.',
    benefitType: 'CODIGO_DESCUENTO',
    discountPercentage: 15,
  }),
  coupon({
    externalId: 'redemption-mock-two-for-one',
    validationCode: MOCK_VALIDATION_CODES.twoForOne,
    benefitName: '2x1 en medialunas',
    description: 'Llevá dos medialunas y pagá una',
    benefitType: 'DOS_POR_UNO',
    productId: 'product-mock-medialuna',
    productName: 'Medialuna de manteca',
    productPrice: 1200,
  }),
  coupon({
    externalId: 'redemption-mock-product-for-points',
    validationCode: MOCK_VALIDATION_CODES.productForPoints,
    benefitName: 'Alfajor por puntos',
    usedPoints: 500,
    benefitType: 'PRODUCTO_POR_PUNTOS',
    productId: 'product-mock-alfajor',
    productName: 'Alfajor de maicena',
    productPrice: 1800,
  }),
  coupon({
    externalId: 'redemption-mock-member-free-product',
    validationCode: MOCK_VALIDATION_CODES.memberFreeProduct,
    benefitName: 'Cappuccino de regalo para socios',
    conditions: 'Válido de lunes a viernes.',
    benefitType: 'PRODUCTO_GRATIS_SOCIO',
    productId: 'product-mock-cappuccino',
    productName: 'Cappuccino',
    productPrice: 3500,
  }),
  coupon({
    externalId: 'redemption-mock-used',
    validationCode: MOCK_VALIDATION_CODES.used,
    benefitName: 'Café de filtro gratis',
    state: false,
    usedDate: '2026-11-12T09:15:00',
    benefitType: 'PRODUCTO_GRATIS_SOCIO',
    productName: 'Café de filtro',
  }),
  coupon({
    externalId: 'redemption-mock-other-cafe',
    validationCode: MOCK_VALIDATION_CODES.otherCafe,
    benefitName: '2x1 en tostados',
    cafeName: 'Cafe Norte',
    cafeId: 'cafe-norte-002',
    benefitType: 'DOS_POR_UNO',
    productName: 'Tostado de jamón y queso',
  }),
  coupon({
    externalId: 'redemption-mock-global',
    validationCode: MOCK_VALIDATION_CODES.global,
    benefitName: 'Descuento 10% en cualquier cafetería',
    cafeName: 'Global',
    cafeId: null,
    benefitType: 'CODIGO_DESCUENTO',
    discountPercentage: 10,
  }),
];
