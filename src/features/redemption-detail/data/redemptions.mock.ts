import { Redemption } from '../model/redemption.model';

export const MOCK_REDEMPTIONS: Redemption[] = [
  {
    externalId: 'redemption-001',
    date: '2026-10-20T10:30:00',
    usedPoints: 300,
    state: true,
    validationCode: 'VLD-8492-C0FF',
    benefitName: 'Descuento 15% bienvenida',
    cafeName: 'Global',
    description: 'Válido en cualquier sucursal adherida',
    expiresAt: '2026-12-31',
    conditions:
      'Un solo uso por cliente.\nNo acumulable con otras promociones.\nPresentá el código antes de pagar.',
  },
  {
    externalId: 'redemption-104',
    date: '2026-10-15T18:00:00',
    usedPoints: 450,
    state: false,
    validationCode: 'VLD-1104-USED',
    benefitName: 'Cappuccino gratis',
    cafeName: 'Cafe Central',
    description: 'Un cappuccino de cualquier tamaño',
    expiresAt: null,
    conditions: null,
  },
];
