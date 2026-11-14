import { Purchase, Review } from '../model/purchase.model';

export const PENDING_REVIEW_PURCHASE_FIXTURE: Purchase = {
  externalId: 'purchase-001',
  date: '2026-10-05T10:30:00',
  price: 6100,
  status: 'CONFIRMED',
  clientId: 'client-001',
  clientName: 'Juan Pérez',
  cafeId: 'cafe-norte-001',
  cafeName: 'Cafe Norte',
  redemptionId: null,
  details: [
    {
      externalId: 'detail-011',
      productId: 'product-latte',
      productName: 'Latte',
      amount: 1,
      unitPrice: 3100,
      generatedPoints: 30,
      subtotal: 3100,
    },
    {
      externalId: 'detail-012',
      productId: 'product-budin',
      productName: 'Budín de limón',
      amount: 1,
      unitPrice: 3000,
      generatedPoints: 25,
      subtotal: 3000,
    },
  ],
  reviewed: false,
};

export const REVIEWED_PURCHASE_FIXTURE: Purchase = {
  externalId: 'purchase-002',
  date: '2026-10-18T09:15:00',
  price: 4500,
  status: 'CONFIRMED',
  clientId: 'client-001',
  clientName: 'Juan Pérez',
  cafeId: 'cafe-central-001',
  cafeName: 'Cafe Central',
  redemptionId: null,
  details: [
    {
      externalId: 'detail-021',
      productId: 'product-flat-white',
      productName: 'Flat White',
      amount: 1,
      unitPrice: 4500,
      generatedPoints: 45,
      subtotal: 4500,
    },
  ],
  reviewed: true,
};

export const PURCHASES_FIXTURE: Purchase[] = [
  PENDING_REVIEW_PURCHASE_FIXTURE,
  REVIEWED_PURCHASE_FIXTURE,
];

export const REVIEW_FIXTURE: Review = {
  externalId: 'review-001',
  message: 'Excelente atención',
  rating: 5,
  date: '2026-10-06',
  clientId: 'client-001',
  cafeId: PENDING_REVIEW_PURCHASE_FIXTURE.cafeId,
  purchaseId: PENDING_REVIEW_PURCHASE_FIXTURE.externalId,
};
