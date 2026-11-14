import { AvailableBenefit } from '../model/available-benefit.model';

export const CAFE_BENEFIT_FIXTURE: AvailableBenefit = {
  externalId: 'benefit-capuccino',
  name: 'Capuccino por puntos',
  description: 'Cambiá tus puntos por un capuccino',
  conditions: 'Válido de lunes a viernes',
  pointsCost: 300,
  cafeEntity: 'Cafe Central',
  global: false,
  benefitType: 'PRODUCTO_POR_PUNTOS',
  tierName: 'PLATA',
  tierMinPoints: 1000,
  endDate: '2026-12-31',
  productName: 'Capuccino',
  soldOut: false,
};

export const GLOBAL_BENEFIT_FIXTURE: AvailableBenefit = {
  externalId: 'benefit-welcome',
  name: 'Descuento 15% bienvenida',
  description: 'Descuento de bienvenida para socios',
  conditions: null,
  pointsCost: 500,
  cafeEntity: null,
  global: true,
  benefitType: 'CODIGO_DESCUENTO',
  tierName: 'BRONCE',
  tierMinPoints: 0,
  endDate: null,
  productName: null,
  soldOut: false,
};
