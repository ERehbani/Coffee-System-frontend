import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { BenefitFormat } from '../types/benefit-format.model';
import { HttpBenefitFormatRepository } from './http-benefit-format.repository';

describe('HttpBenefitFormatRepository', () => {
  const url = `${environment.apiBaseUrl}/benefit-formats`;
  let repository: HttpBenefitFormatRepository;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [HttpBenefitFormatRepository, provideHttpClient(), provideHttpClientTesting()],
    });
    repository = TestBed.inject(HttpBenefitFormatRepository);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('getFormats requests GET /benefit-formats and maps the list sorted by name', () => {
    let formats: readonly BenefitFormat[] | undefined;
    repository.getFormats().subscribe((value) => (formats = value));

    const request = http.expectOne(url);
    expect(request.request.method).toBe('GET');
    request.flush([
      {
        externalId: 'b',
        code: 'CODIGO_DESCUENTO',
        displayName: 'Descuento',
        description: 'Reduce el precio.',
        active: true,
        usageCount: 12,
      },
      {
        externalId: 'a',
        code: 'DOS_POR_UNO',
        displayName: '2x1',
        description: 'Dos por uno.',
        active: false,
        usageCount: 0,
      },
    ]);

    expect(formats).toEqual([
      {
        id: 'a',
        code: 'DOS_POR_UNO',
        displayName: '2x1',
        description: 'Dos por uno.',
        active: false,
        usageCount: 0,
      },
      {
        id: 'b',
        code: 'CODIGO_DESCUENTO',
        displayName: 'Descuento',
        description: 'Reduce el precio.',
        active: true,
        usageCount: 12,
      },
    ]);
  });

  it('createFormat posts the code, the trimmed texts and the flag', () => {
    let created: BenefitFormat | undefined;
    repository
      .createFormat({
        code: 'PRODUCTO_POR_PUNTOS',
        displayName: ' Por puntos ',
        description: 'Canje con puntos.',
        active: true,
      })
      .subscribe((value) => (created = value));

    const request = http.expectOne(url);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({
      code: 'PRODUCTO_POR_PUNTOS',
      displayName: 'Por puntos',
      description: 'Canje con puntos.',
      active: true,
    });
    request.flush({
      externalId: 'new-1',
      code: 'PRODUCTO_POR_PUNTOS',
      displayName: 'Por puntos',
      description: 'Canje con puntos.',
      active: true,
      usageCount: 0,
    });

    expect(created?.id).toBe('new-1');
    expect(created?.usageCount).toBe(0);
  });

  it('updateFormat puts the editable fields, without the code, on the external id', () => {
    let updated: BenefitFormat | undefined;
    repository
      .updateFormat('fmt-9', {
        code: 'DOS_POR_UNO',
        displayName: '2x1',
        description: 'Dos por uno.',
        active: false,
      })
      .subscribe((value) => (updated = value));

    const request = http.expectOne(`${url}/fmt-9`);
    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual({
      displayName: '2x1',
      description: 'Dos por uno.',
      active: false,
    });
    request.flush({
      externalId: 'fmt-9',
      code: 'DOS_POR_UNO',
      displayName: '2x1',
      description: 'Dos por uno.',
      active: false,
      usageCount: 3,
    });

    expect(updated).toMatchObject({ id: 'fmt-9', active: false, usageCount: 3 });
  });

  it('lets the HTTP error reach the caller untouched', () => {
    let failure: unknown;
    repository
      .createFormat({ code: 'DOS_POR_UNO', displayName: 'x', description: 'y', active: true })
      .subscribe({ error: (e) => (failure = e) });

    http.expectOne(url).flush('The format DOS_POR_UNO is already in the catalog', {
      status: 409,
      statusText: 'Conflict',
    });

    expect(failure).toBeInstanceOf(HttpErrorResponse);
    expect((failure as HttpErrorResponse).status).toBe(409);
  });
});
