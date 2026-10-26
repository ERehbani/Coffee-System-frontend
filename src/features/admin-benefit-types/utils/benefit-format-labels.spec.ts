import { BENEFIT_FORMAT_CODES } from '../types/benefit-format.model';
import { benefitFormatLabel } from './benefit-format-labels';

describe('benefitFormatLabel', () => {
  it.each([
    ['CODIGO_DESCUENTO', 'Código de descuento'],
    ['DOS_POR_UNO', '2x1'],
    ['PRODUCTO_POR_PUNTOS', 'Producto por puntos'],
    ['PRODUCTO_GRATIS_SOCIO', 'Producto gratis para socios'],
  ] as const)('labels %s as "%s"', (code, label) => {
    expect(benefitFormatLabel(code)).toBe(label);
  });

  it('knows the four fixed formats', () => {
    expect([...BENEFIT_FORMAT_CODES].sort()).toEqual([
      'CODIGO_DESCUENTO',
      'DOS_POR_UNO',
      'PRODUCTO_GRATIS_SOCIO',
      'PRODUCTO_POR_PUNTOS',
    ]);
  });
});
