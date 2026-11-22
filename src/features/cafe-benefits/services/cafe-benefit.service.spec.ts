import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { BenefitTypeOption } from '../model/cafe-benefit.model';
import { CafeBenefitService } from './cafe-benefit.service';

describe('CafeBenefitService', () => {
  let service: CafeBenefitService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(CafeBenefitService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('offers the active benefit formats as types', () => {
    let types: BenefitTypeOption[] | undefined;
    service.getBenefitTypes().subscribe((value) => (types = value));

    http.expectOne(`${environment.apiBaseUrl}/benefit-formats`).flush([
      { code: 'DOS_POR_UNO', displayName: '2x1', active: true },
      { code: 'CODIGO_DESCUENTO', displayName: 'Descuento', active: false },
    ]);

    expect(types).toEqual([{ id: 'DOS_POR_UNO', name: 'DOS_POR_UNO', displayName: 'Promoción 2x1' }]);
  });

  it('creates the benefit with its type and product', () => {
    service
      .create({
        name: '2x1 Espresso',
        description: 'Dos por uno',
        pointsCost: 100,
        startDate: '2026-11-15',
        endDate: '2026-12-15',
        maxRedemptions: 10,
        type: 'DOS_POR_UNO',
        productId: 'product-espresso',
        tierId: 'tier-bronce',
      })
      .subscribe();

    const req = http.expectOne(`${environment.apiBaseUrl}/benefits`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(
      expect.objectContaining({
        type: 'DOS_POR_UNO',
        productId: 'product-espresso',
        discountPercentage: null,
        conditions: null,
      }),
    );
    expect(req.request.body.typeId).toBeUndefined();
    req.flush({ externalId: 'benefit-1' });

    const publish = http.expectOne(`${environment.apiBaseUrl}/benefits/benefit-1/publish`);
    expect(publish.request.method).toBe('POST');
    publish.flush({ externalId: 'benefit-1' });
  });

  it('updates the benefit keeping its limit per client', () => {
    service
      .update('benefit-1', {
        name: '2x1 Espresso',
        description: 'Dos por uno',
        conditions: '',
        pointsCost: 120,
        startDate: '2026-11-15',
        endDate: '2026-12-15',
        maxRedemptions: 20,
        type: 'DOS_POR_UNO',
        productId: 'product-espresso',
        tierId: 'tier-bronce',
        image: 'https://cdn.example.com/2x1.jpg',
        maxPerClient: 2,
      })
      .subscribe();

    const req = http.expectOne(`${environment.apiBaseUrl}/benefits/benefit-1`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({
      name: '2x1 Espresso',
      description: 'Dos por uno',
      conditions: null,
      pointsCost: 120,
      startDate: '2026-11-15',
      endDate: '2026-12-15',
      maxRedemptions: 20,
      type: 'DOS_POR_UNO',
      discountPercentage: null,
      productId: 'product-espresso',
      tierId: 'tier-bronce',
      image: 'https://cdn.example.com/2x1.jpg',
      maxPerClient: 2,
    });
    req.flush({ externalId: 'benefit-1' });
  });

  it('pauses the benefit through the cancel endpoint of the backend', () => {
    service.pause('benefit-1').subscribe();

    const req = http.expectOne(`${environment.apiBaseUrl}/benefits/benefit-1/cancel`);
    expect(req.request.method).toBe('POST');
    req.flush({ externalId: 'benefit-1', status: false });
  });

  it('resumes the benefit by publishing it again', () => {
    service.resume('benefit-1').subscribe();

    const req = http.expectOne(`${environment.apiBaseUrl}/benefits/benefit-1/publish`);
    expect(req.request.method).toBe('POST');
    req.flush({ externalId: 'benefit-1', status: true });
  });

  it('deletes the benefit', () => {
    service.delete('benefit-1').subscribe();

    const req = http.expectOne(`${environment.apiBaseUrl}/benefits/benefit-1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null, { status: 204, statusText: 'No Content' });
  });
});
