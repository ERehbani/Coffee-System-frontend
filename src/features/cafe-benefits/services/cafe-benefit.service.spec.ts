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
});
