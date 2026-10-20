import { PurchaseDto } from '../types/order.dto';

const DAY_MS = 24 * 60 * 60 * 1000;
const UNSPLASH = 'https://images.unsplash.com';

const CAFE_CENTRAL = {
  externalId: 'cafe-central',
  name: 'Cafe Central',
  imageUrl: `${UNSPLASH}/photo-1525610553991-2bede1a236e2?w=192&h=192&fit=crop&q=80&auto=format`,
};

const CAFE_NORTE = {
  externalId: 'cafe-norte',
  name: 'Cafe Norte',
  imageUrl: `${UNSPLASH}/photo-1559925393-8be0ec4767c8?w=192&h=192&fit=crop&q=80&auto=format`,
};

export function buildPurchaseHistoryFixture(now: Date): PurchaseDto[] {
  const daysAgo = (days: number) => new Date(now.getTime() - days * DAY_MS).toISOString();

  return [
    {
      externalId: 'purchase-004',
      date: daysAgo(1),
      price: 7800,
      status: 'CONFIRMED',
      cafe: CAFE_CENTRAL,
      details: [
        { externalId: 'detail-041', productName: 'Flat white', amount: 2, subtotal: 5600 },
        { externalId: 'detail-042', productName: 'Medialuna de manteca', amount: 2, subtotal: 2200 },
      ],
      review: null,
    },
    {
      externalId: 'purchase-003',
      date: daysAgo(4),
      price: 4500,
      status: 'CONFIRMED',
      cafe: CAFE_NORTE,
      details: [{ externalId: 'detail-031', productName: 'Filtrado V60', amount: 1, subtotal: 4500 }],
      review: null,
    },
    {
      externalId: 'purchase-002',
      date: daysAgo(9),
      price: 3200,
      status: 'CANCELLED',
      cafe: CAFE_CENTRAL,
      details: [{ externalId: 'detail-021', productName: 'Cappuccino', amount: 1, subtotal: 3200 }],
      review: null,
    },
    {
      externalId: 'purchase-001',
      date: daysAgo(15),
      price: 6100,
      status: 'CONFIRMED',
      cafe: CAFE_NORTE,
      details: [
        { externalId: 'detail-011', productName: 'Latte', amount: 1, subtotal: 3100 },
        { externalId: 'detail-012', productName: 'Budín de limón', amount: 1, subtotal: 3000 },
      ],
      review: {
        externalId: 'review-001',
        rating: 4,
        message: 'Muy buen café y atención rápida.',
        date: daysAgo(14),
      },
    },
  ];
}
