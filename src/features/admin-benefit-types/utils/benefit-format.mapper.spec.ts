import { BenefitFormatDto } from '../types/benefit-format.dto';
import {
  toBenefitFormat,
  toBenefitFormatList,
  toCreateBenefitFormatRequestDto,
  toUpdateBenefitFormatRequestDto,
} from './benefit-format.mapper';

const dto = (externalId: string, displayName: string): BenefitFormatDto => ({
  externalId,
  code: 'DOS_POR_UNO',
  displayName,
  description: 'Dos por uno',
  active: true,
  usageCount: 4,
});

describe('benefit format mapper', () => {
  it('maps the external id to the format id', () => {
    expect(toBenefitFormat(dto('abc-1', '2x1'))).toEqual({
      id: 'abc-1',
      code: 'DOS_POR_UNO',
      displayName: '2x1',
      description: 'Dos por uno',
      active: true,
      usageCount: 4,
    });
  });

  it('lists the formats by name, ignoring the letter case', () => {
    const formats = toBenefitFormatList([
      dto('1', 'producto gratis'),
      dto('2', 'Descuento'),
      dto('3', '2x1'),
    ]);

    expect(formats.map((format) => format.displayName)).toEqual([
      '2x1',
      'Descuento',
      'producto gratis',
    ]);
  });

  it('builds the create body with the code and trimmed texts', () => {
    expect(
      toCreateBenefitFormatRequestDto({
        code: 'PRODUCTO_POR_PUNTOS',
        displayName: '  Por puntos ',
        description: ' Canje con puntos. ',
        active: false,
      }),
    ).toEqual({
      code: 'PRODUCTO_POR_PUNTOS',
      displayName: 'Por puntos',
      description: 'Canje con puntos.',
      active: false,
    });
  });

  it('builds the update body without the code', () => {
    expect(
      toUpdateBenefitFormatRequestDto({
        code: 'DOS_POR_UNO',
        displayName: ' 2x1 ',
        description: 'Dos por uno',
        active: true,
      }),
    ).toEqual({ displayName: '2x1', description: 'Dos por uno', active: true });
  });
});
