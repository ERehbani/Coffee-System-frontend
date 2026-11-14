import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { ProductService } from '../../../catalog/services/product.service';
import { ESPRESSO_DTO_FIXTURE, PRODUCT_CAFE_ID } from '../../../catalog/utils/product.fixture';
import { CafeBenefit, CreateCafeBenefitRequest } from '../../model/cafe-benefit.model';
import { CafeBenefitService } from '../../services/cafe-benefit.service';
import { CafeBenefits } from './cafe-benefits';

describe('CafeBenefits', () => {
  const benefit: CafeBenefit = {
    externalId: 'benefit-1',
    name: '2x1 Espresso',
    description: 'Dos por uno',
    pointsCost: 100,
    status: true,
    isPublic: true,
    maxRedemptions: 10,
    global: false,
    benefitType: 'DOS_POR_UNO',
    productName: 'Espresso',
  };
  const request: CreateCafeBenefitRequest = {
    name: '2x1 Espresso',
    description: 'Dos por uno',
    pointsCost: 100,
    startDate: '2026-11-15',
    endDate: '2026-12-15',
    maxRedemptions: 10,
    type: 'DOS_POR_UNO',
    productId: ESPRESSO_DTO_FIXTURE.externalId,
    tierId: 'tier-bronce',
  };
  let benefitService: Record<string, ReturnType<typeof vi.fn>>;
  let productService: Record<string, ReturnType<typeof vi.fn>>;

  function render(): ComponentFixture<CafeBenefits> {
    const fixture = TestBed.createComponent(CafeBenefits);
    fixture.detectChanges();
    return fixture;
  }

  beforeEach(async () => {
    benefitService = {
      getAll: vi.fn(() => of([])),
      getBenefitTypes: vi.fn(() => of([])),
      getTiers: vi.fn(() => of([])),
      create: vi.fn(() => of(benefit)),
    };
    productService = {
      getMyCafeId: vi.fn(() => of(PRODUCT_CAFE_ID)),
      listByCafe: vi.fn(() => of([ESPRESSO_DTO_FIXTURE, { ...ESPRESSO_DTO_FIXTURE, externalId: 'off', state: false }])),
    };
    await TestBed.configureTestingModule({
      imports: [CafeBenefits],
      providers: [
        provideRouter([]),
        { provide: CafeBenefitService, useValue: benefitService },
        { provide: ProductService, useValue: productService },
      ],
    }).compileComponents();
  });

  it('offers only the active products of the cafe for the benefit', () => {
    const component = render().componentInstance;

    expect(productService['listByCafe']).toHaveBeenCalledWith(PRODUCT_CAFE_ID);
    expect(component.products()).toEqual([{ id: ESPRESSO_DTO_FIXTURE.externalId, name: ESPRESSO_DTO_FIXTURE.name }]);
  });

  it('adds the created benefit at the top of the list', () => {
    const component = render().componentInstance;

    component.onSaveBenefit(request);

    expect(benefitService['create']).toHaveBeenCalledWith(request);
    expect(component.benefits()).toEqual([benefit]);
    expect(component.successMessage()).toBe('¡Promoción publicada exitosamente!');
  });

  it('shows the detail of the backend when the benefit is rejected', () => {
    benefitService['create'].mockReturnValue(
      throwError(
        () => new HttpErrorResponse({ status: 422, error: { detail: 'A product benefit needs a product of the cafe' } }),
      ),
    );
    const component = render().componentInstance;

    component.onSaveBenefit(request);

    expect(component.errorMessage()).toBe('A product benefit needs a product of the cafe');
  });
});
