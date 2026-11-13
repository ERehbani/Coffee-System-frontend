import { toOrderStatusLabel } from './order-status-label';

describe('toOrderStatusLabel', () => {
  it.each([
    ['confirmed', 'Confirmada'],
    ['cancelled', 'Cancelada'],
    ['refunded', 'Reembolsada'],
  ] as const)('labels %s as %s', (status, label) => {
    expect(toOrderStatusLabel(status)).toBe(label);
  });
});
