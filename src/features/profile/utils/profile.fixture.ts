import { ProfileDashboardDto, TierDetailDto } from '../types/profile.dto';

const DAY_MS = 24 * 60 * 60 * 1000;
const UNSPLASH = 'https://images.unsplash.com';

export function buildProfileDashboardFixture(now: Date): ProfileDashboardDto {
  return {
    client: {
      id: 'client-001',
      firstName: 'Juan',
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
