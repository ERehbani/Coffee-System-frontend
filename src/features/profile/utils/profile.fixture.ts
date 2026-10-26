import {
  ProfileDashboardDto,
  RedemptionDto,
  TierBenefitDto,
  TierDetailDto,
} from '../types/profile.dto';

const DAY_MS = 24 * 60 * 60 * 1000;
const UNSPLASH = 'https://images.unsplash.com';

export function buildProfileDashboardFixture(now: Date): ProfileDashboardDto {
  return {
    client: {
      id: 'client-001',
      firstName: 'Juan',
      lastName: 'Pérez',
      email: 'juan.perez@example.com',
      phoneNumber: '1145238890',
      avatarUrl: `${UNSPLASH}/photo-1507003211169-0a1dd7228f2d?w=96&h=96&fit=crop&crop=faces&q=80&auto=format`,
    },
    loyalty: {
      tier: 'SILVER',
      availablePoints: 850,
      lifetimePoints: 1420,
      nextTier: 'GOLD',
      nextTierThreshold: 3000,
      progressPercent: 21,
      pointsToNextTier: 1580,
    },
    activeRedemptions: [
      {
        id: 'redemption-001',
        title: 'Descuento 15% bienvenida',
        description: 'Válido en cualquier sucursal adherida',
        code: 'VLD-8492-C0FF',
        expiresAt: new Date(now.getTime() + 5 * DAY_MS).toISOString(),
        conditions: [
          'Un solo uso por cliente.',
          'No acumulable con otras promociones.',
          'Presentá el código antes de pagar.',
        ],
      },
    ],
    nearbyCafes: [
      {
        id: 'cafe-central',
        name: 'Cafe Central',
        imageUrl: `${UNSPLASH}/photo-1525610553991-2bede1a236e2?w=192&h=192&fit=crop&q=80&auto=format`,
        rating: 4.9,
        reviewCount: 12,
        isOpenNow: true,
        distanceMeters: null,
        maxPointsPerProduct: 80,
        tagline: 'Espresso de especialidad en el centro',
      },
      {
        id: 'cafe-norte',
        name: 'Cafe Norte',
        imageUrl: `${UNSPLASH}/photo-1559925393-8be0ec4767c8?w=192&h=192&fit=crop&q=80&auto=format`,
        rating: 4.8,
        reviewCount: 8,
        isOpenNow: false,
        distanceMeters: 450,
        maxPointsPerProduct: null,
        tagline: 'Tostado de origen único & filtrados V60',
      },
    ],
    featuredBenefits: [
      {
        id: 'benefit-capuccino',
        title: 'Capuccino por tus puntos',
        description: 'Caliente o frío, leche a elección',
        imageUrl: `${UNSPLASH}/photo-1572442388796-11668a67e53d?w=600&h=450&fit=crop&q=80&auto=format`,
        pointsCost: 300,
      },
      {
        id: 'benefit-medialunas',
        title: '2x1 Medialunas',
        description: 'De manteca o grasa, recién horneadas',
        imageUrl: `${UNSPLASH}/photo-1555507036-ab1f4038808a?w=600&h=450&fit=crop&q=80&auto=format`,
        pointsCost: 200,
      },
    ],
  };
}

export function buildTierDetailFixture(): TierDetailDto {
  return {
    tier: 'SILVER',
    availablePoints: 850,
    lifetimePoints: 1420,
    currentTierThreshold: 1000,
    nextTier: 'GOLD',
    nextTierThreshold: 3000,
    progressPercent: 21,
    pointsToNextTier: 1580,
    levels: [
      {
        tier: 'BRONZE',
        threshold: 0,
        benefits: ['Sumá puntos en cada compra', 'Regalo de bienvenida'],
      },
      {
        tier: 'SILVER',
        threshold: 1000,
        benefits: ['5% de puntos extra', 'Café gratis en tu cumpleaños'],
      },
      {
        tier: 'GOLD',
        threshold: 3000,
        benefits: ['10% de puntos extra', 'Acceso anticipado a lanzamientos'],
      },
      {
        tier: 'DIAMOND',
        threshold: 6000,
        benefits: ['20% de puntos extra', 'Un café de especialidad gratis por mes'],
      },
    ],
  };
}

function toIsoDay(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/**
 * Benefits enabled for the mock client (tier PLATA, 850 points): the BRONCE and PLATA ones, ordered
 * by tier and name like the backend does. Tier names are the backend ones.
 */
export function buildTierBenefitsFixture(now: Date): TierBenefitDto[] {
  const endsIn = (days: number) => toIsoDay(new Date(now.getTime() + days * DAY_MS));
  return [
    {
      externalId: 'benefit-2x1-medialunas',
      name: '2x1 en medialunas',
      description: 'Dos medialunas de manteca por el precio de una',
      pointsCost: 200,
      endDate: endsIn(60),
      cafeName: 'Cafe Norte',
      tierName: 'BRONCE',
      benefitType: 'DESCUENTO_PORCENTAJE',
    },
    {
      externalId: 'benefit-cafe-cortesia',
      name: 'Café de cortesía',
      description: 'Un café de filtro a elección en cualquier cafetería de la red',
      pointsCost: 300,
      endDate: null,
      cafeName: null,
      tierName: 'BRONCE',
      benefitType: 'PRODUCTO_GRATIS_SOCIO',
    },
    {
      externalId: 'benefit-descuento-15',
      name: 'Descuento 15% en tu pedido',
      description: 'Aplicable a toda la carta, una vez por visita',
      pointsCost: 600,
      endDate: endsIn(90),
      cafeName: null,
      tierName: 'PLATA',
      benefitType: 'DESCUENTO_PORCENTAJE',
    },
    {
      externalId: 'benefit-taza-edicion-limitada',
      name: 'Taza de edición limitada',
      description: 'Taza de cerámica con el diseño de la temporada',
      pointsCost: 1200,
      endDate: null,
      cafeName: 'Cafe Central',
      tierName: 'PLATA',
      benefitType: 'PRODUCTO_GRATIS_SOCIO',
    },
  ];
}

export function buildRedemptionHistoryFixture(now: Date): RedemptionDto[] {
  const daysAgo = (days: number) => new Date(now.getTime() - days * DAY_MS).toISOString();
  return [
    {
      externalId: 'redemption-active',
      date: now.toISOString(),
      usedPoints: 300,
      state: true,
      validationCode: 'VLD-8492-C0FF',
      benefitName: 'Descuento 15% bienvenida',
      cafeName: null,
    },
    {
      externalId: 'redemption-104',
      date: daysAgo(3),
      usedPoints: 450,
      state: false,
      validationCode: 'VLD-1104-USED',
      benefitName: 'Cappuccino gratis',
      cafeName: 'Cafe Central',
    },
    {
      externalId: 'redemption-103',
      date: daysAgo(12),
      usedPoints: 200,
      state: false,
      validationCode: 'VLD-1103-USED',
      benefitName: '2x1 en medialunas',
      cafeName: 'Cafe Norte',
    },
    {
      externalId: 'redemption-102',
      date: daysAgo(27),
      usedPoints: 300,
      state: false,
      validationCode: 'VLD-1102-USED',
      benefitName: 'Descuento 10% en tu pedido',
      cafeName: null,
    },
    {
      externalId: 'redemption-101',
      date: daysAgo(48),
      usedPoints: 600,
      state: false,
      validationCode: 'VLD-1101-USED',
      benefitName: 'Filtrado V60 de especialidad',
      cafeName: 'Cafe Norte',
    },
  ];
}
