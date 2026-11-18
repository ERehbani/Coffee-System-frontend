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
      create: vi.fn(() => of({ benefit, publishError: null })),
      update: vi.fn(() => of({ ...benefit, name: 'Espresso 2x1' })),
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
        () => new HttpErrorResponse({ status: 422, error: { detail: 'Un beneficio de producto necesita un producto de la cafetería' } }),
      ),
    );
    const component = render().componentInstance;

    component.onSaveBenefit(request);

    expect(component.errorMessage()).toBe('Un beneficio de producto necesita un producto de la cafetería');
  });

  describe('editing', () => {
    const withLimit: CafeBenefit = { ...benefit, maxPerClient: 3 };

    beforeEach(() => {
      benefitService['getAll'].mockReturnValue(of([withLimit]));
    });

    it('opens the form pre-filled from the "Editar" button of a card', () => {
      const fixture = render();
      const root = fixture.nativeElement as HTMLElement;

      root.querySelector<HTMLButtonElement>('app-benefit-card button')!.click();
      fixture.detectChanges();

      expect(fixture.componentInstance.editingBenefit()).toEqual(withLimit);
      expect(root.querySelector('app-benefit-form h2')?.textContent?.trim()).toBe('Editar Promoción');
      expect(root.querySelector<HTMLInputElement>('#benefit-name')?.value).toBe('2x1 Espresso');
    });

    it('replaces the benefit in the list keeping its limit per client', () => {
      const component = render().componentInstance;
      component.onEditBenefit(withLimit);

      component.onSaveBenefit(request);

      expect(benefitService['update']).toHaveBeenCalledWith('benefit-1', { ...request, maxPerClient: 3 });
      expect(benefitService['create']).not.toHaveBeenCalled();
      expect(component.benefits().map((b) => b.name)).toEqual(['Espresso 2x1']);
      expect(component.showForm()).toBe(false);
      expect(component.editingBenefit()).toBeNull();
      expect(component.successMessage()).toBe('¡Promoción actualizada exitosamente!');
    });

    it('keeps the form open and shows the detail of the backend when the update is rejected', () => {
      benefitService['update'].mockReturnValue(
        throwError(
          () =>
            new HttpErrorResponse({
              status: 422,
              error: { detail: 'El límite no puede ser menor que los canjes ya realizados' },
            }),
        ),
      );
      const component = render().componentInstance;
      component.onEditBenefit(withLimit);

      component.onSaveBenefit(request);

      expect(component.errorMessage()).toBe('El límite no puede ser menor que los canjes ya realizados');
      expect(component.showForm()).toBe(true);
      expect(component.editingBenefit()).toEqual(withLimit);
      expect(component.benefits()).toEqual([withLimit]);
    });

    it('goes back to creating after closing the form', () => {
      const component = render().componentInstance;
      component.onEditBenefit(withLimit);

      component.closeForm();
      component.onSaveBenefit(request);

      expect(benefitService['create']).toHaveBeenCalledWith(request);
      expect(benefitService['update']).not.toHaveBeenCalled();
    });
  });
});
