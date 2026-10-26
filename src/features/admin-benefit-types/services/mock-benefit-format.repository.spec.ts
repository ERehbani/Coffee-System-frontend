import { HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom, Observable } from 'rxjs';
import { SaveBenefitFormatInput } from '../types/benefit-format.model';
import { BENEFIT_FORMATS_FIXTURE } from '../utils/benefit-format.fixture';
import { MockBenefitFormatRepository, MOCK_LATENCY_MS } from './mock-benefit-format.repository';

describe('MockBenefitFormatRepository', () => {
  let repository: MockBenefitFormatRepository;

  beforeEach(() => {
    vi.useFakeTimers();
    repository = new MockBenefitFormatRepository();
  });

  afterEach(() => vi.useRealTimers());

  /** Subscribes, lets the simulated latency elapse and resolves with the first emission. */
  function settle<T>(source: Observable<T>): Promise<T> {
    const result = firstValueFrom(source);
    vi.advanceTimersByTime(MOCK_LATENCY_MS);
    return result;
  }

  async function failure(source: Observable<unknown>): Promise<HttpErrorResponse> {
    const error = await settle(source).catch((caught: unknown) => caught);
    expect(error).toBeInstanceOf(HttpErrorResponse);
    return error as HttpErrorResponse;
  }

  const valid: SaveBenefitFormatInput = {
    code: 'PRODUCTO_POR_PUNTOS',
    displayName: 'Por puntos',
    description: 'Canje de un producto con puntos.',
    active: true,
  };
  const descuento = () => BENEFIT_FORMATS_FIXTURE.find((f) => f.code === 'CODIGO_DESCUENTO')!;
  const editOf = (changes: Partial<SaveBenefitFormatInput>): SaveBenefitFormatInput => ({
    code: 'CODIGO_DESCUENTO',
    displayName: descuento().displayName,
    description: descuento().description,
    active: true,
    ...changes,
  });

  it('mirrors the backend seeds, ordered by name and without PRODUCTO_POR_PUNTOS', async () => {
    const formats = await settle(repository.getFormats());

    expect(formats.map(({ displayName, code, active }) => [displayName, code, active])).toEqual([
      ['2x1', 'DOS_POR_UNO', true],
      ['Descuento', 'CODIGO_DESCUENTO', true],
      ['Producto gratis', 'PRODUCTO_GRATIS_SOCIO', true],
    ]);
    expect(formats.some((format) => format.code === 'PRODUCTO_POR_PUNTOS')).toBe(false);
  });

  it('registers a format with a trimmed name, no usage and keeps the list ordered', async () => {
    const created = await settle(
      repository.createFormat({ ...valid, displayName: '  Por puntos  ' }),
    );
    const formats = await settle(repository.getFormats());

    expect(created).toMatchObject({
      code: 'PRODUCTO_POR_PUNTOS',
      displayName: 'Por puntos',
      active: true,
      usageCount: 0,
    });
    expect(created.id).toBeTruthy();
    expect(formats.map((format) => format.displayName)).toEqual([
      '2x1',
      'Descuento',
      'Por puntos',
      'Producto gratis',
    ]);
  });

  it('registers a format as active when the flag is missing', async () => {
    const created = await settle(
      repository.createFormat({ ...valid, active: undefined as unknown as boolean }),
    );

    expect(created.active).toBe(true);
  });

  it('updates the name, description and flag but keeps the code and the usage', async () => {
    const updated = await settle(
      repository.updateFormat(
        descuento().id,
        editOf({
          code: 'DOS_POR_UNO',
          displayName: 'Rebaja',
          description: 'Nueva.',
          active: false,
        }),
      ),
    );

    expect(updated).toEqual({
      ...descuento(),
      displayName: 'Rebaja',
      description: 'Nueva.',
      active: false,
    });
    expect(updated.code).toBe('CODIGO_DESCUENTO');
  });

  it('answers 404 when the format to update does not exist', async () => {
    const error = await failure(repository.updateFormat('missing', editOf({})));

    expect(error.status).toBe(404);
    expect(error.error).toBe('Benefit format not found');
  });

  it('rejects a missing format with the backend validation shape', async () => {
    const error = await failure(repository.createFormat({ ...valid, code: null }));

    expect(error.status).toBe(400);
    expect(error.error.errors).toEqual({ code: 'The format is required' });
  });

  it('rejects an empty or too long name with the backend messages', async () => {
    const blank = await failure(repository.createFormat({ ...valid, displayName: '   ' }));
    const long = await failure(repository.createFormat({ ...valid, displayName: 'x'.repeat(41) }));

    expect(blank.status).toBe(400);
    expect(blank.error.errors.displayName).toBe('The name is required');
    expect(long.error.errors.displayName).toBe('The name must have at most 40 characters');
  });

  it('accepts a name of exactly 40 characters and a description of exactly 200', async () => {
    const created = await settle(
      repository.createFormat({
        ...valid,
        displayName: 'x'.repeat(40),
        description: 'y'.repeat(200),
      }),
    );

    expect(created.displayName).toHaveLength(40);
    expect(created.description).toHaveLength(200);
  });

  it('rejects an empty or too long description with the backend messages', async () => {
    const blank = await failure(repository.createFormat({ ...valid, description: ' ' }));
    const long = await failure(repository.createFormat({ ...valid, description: 'y'.repeat(201) }));

    expect(blank.error.errors.description).toBe('The description is required');
    expect(long.error.errors.description).toBe('The description must have at most 200 characters');
  });

  it('reports every invalid field of one request together', async () => {
    const error = await failure(
      repository.createFormat({ code: null, displayName: '', description: '', active: true }),
    );

    expect(Object.keys(error.error.errors).sort()).toEqual(['code', 'description', 'displayName']);
  });

  it('answers 409 with plain text when the format is already in the catalog', async () => {
    const error = await failure(
      repository.createFormat({ ...valid, code: 'DOS_POR_UNO', displayName: 'Otro' }),
    );

    expect(error.status).toBe(409);
    expect(error.error).toBe('The format DOS_POR_UNO is already in the catalog');
  });

  it('answers 409 for a duplicate name, trimmed and ignoring the letter case', async () => {
    const created = await failure(
      repository.createFormat({ ...valid, displayName: ' DESCUENTO ' }),
    );
    const updated = await failure(
      repository.updateFormat(BENEFIT_FORMATS_FIXTURE[1].id, editOf({ displayName: 'descuento' })),
    );

    expect(created.status).toBe(409);
    expect(created.error).toBe('A benefit type named DESCUENTO already exists');
    expect(updated.status).toBe(409);
  });

  it('lets a format keep its own name on update', async () => {
    const updated = await settle(
      repository.updateFormat(descuento().id, editOf({ displayName: 'DESCUENTO', active: false })),
    );

    expect(updated.displayName).toBe('DESCUENTO');
  });
});
