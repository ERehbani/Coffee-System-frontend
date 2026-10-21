export function toExpiryLabel(daysUntilExpiry: number): string {
  if (daysUntilExpiry === 0) {
    return 'Expira hoy';
  }
  return daysUntilExpiry === 1 ? 'Expira en 1 día' : `Expira en ${daysUntilExpiry} días`;
}
