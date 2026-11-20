import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, Subject, throwError } from 'rxjs';
import { ProductService } from '../../../catalog/services/product.service';
import { ProductDto } from '../../../catalog/types/product.dto';
import { ESPRESSO_DTO_FIXTURE, PRODUCT_CAFE_ID } from '../../../catalog/utils/product.fixture';
import { CafeProducts } from './cafe-products';

describe('CafeProducts', () => {
  const inactive: ProductDto = { ...ESPRESSO_DTO_FIXTURE, externalId: 'product-off', state: false };
  let service: Record<string, ReturnType<typeof vi.fn>>;

  function render(): ComponentFixture<CafeProducts> {
    const fixture = TestBed.createComponent(CafeProducts);
    fixture.detectChanges();
    return fixture;
  }

  beforeEach(async () => {
    service = {
      getMyCafeId: vi.fn(() => of(PRODUCT_CAFE_ID)),
      listByCafe: vi.fn(() => of([ESPRESSO_DTO_FIXTURE, inactive])),
      getCategories: vi.fn(() => of([])),
      activate: vi.fn(() => of({ ...inactive, state: true })),
      changeAvailability: vi.fn(() => of({ ...ESPRESSO_DTO_FIXTURE, available: false })),
      delete: vi.fn(() => of(undefined)),
    };
    await TestBed.configureTestingModule({
      imports: [CafeProducts],
      providers: [provideRouter([]), { provide: ProductService, useValue: service }],
    }).compileComponents();
  });

  it('loads the products of the cafe of the logged user', () => {
    const component = render().componentInstance;

    expect(service['listByCafe']).toHaveBeenCalledWith(PRODUCT_CAFE_ID);
    expect(component.products()).toEqual([ESPRESSO_DTO_FIXTURE, inactive]);
    expect(component.isLoading()).toBe(false);
  });

  it('shows an error when the cafe cannot be found', () => {
    service['getMyCafeId'].mockReturnValue(throwError(() => new HttpErrorResponse({ status: 404 })));

    const component = render().componentInstance;

    expect(service['listByCafe']).not.toHaveBeenCalled();
    expect(component.errorMessage()).toBe('No se pudieron cargar los productos del local.');
  });

  it('sells a deactivated product again', () => {
    const component = render().componentInstance;

    component.onActivateProduct(inactive);

    expect(service['activate']).toHaveBeenCalledWith(PRODUCT_CAFE_ID, 'product-off');
    expect(component.products().find((p) => p.externalId === 'product-off')?.state).toBe(true);
  });

  it('asks for confirmation before changing the availability of a product', () => {
    const fixture = render();

    fixture.componentInstance.onToggleAvailability(ESPRESSO_DTO_FIXTURE);
    fixture.detectChanges();

    expect(service['changeAvailability']).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('¿Marcar como agotado hoy?');
  });

  it('asks for confirmation before making a sold out product available again', () => {
    const fixture = render();

    fixture.componentInstance.onToggleAvailability({ ...ESPRESSO_DTO_FIXTURE, available: false });
    fixture.detectChanges();

    expect(service['changeAvailability']).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('¿Marcar como disponible?');
  });

  it('leaves the availability as it was when the change is cancelled', () => {
    const component = render().componentInstance;

    component.onToggleAvailability(ESPRESSO_DTO_FIXTURE);
    component.cancelAvailabilityChange();

    expect(component.availabilityProduct()).toBeNull();
    expect(service['changeAvailability']).not.toHaveBeenCalled();
    expect(component.products()[0].available).toBe(ESPRESSO_DTO_FIXTURE.available);
  });

  it('marks an available product as sold out for today once confirmed', () => {
    const component = render().componentInstance;

    component.onToggleAvailability(ESPRESSO_DTO_FIXTURE);
    component.confirmAvailabilityChange();

    expect(component.availabilityProduct()).toBeNull();
    expect(service['changeAvailability']).toHaveBeenCalledWith(
      PRODUCT_CAFE_ID,
      ESPRESSO_DTO_FIXTURE.externalId,
      false,
    );
    expect(component.products()[0].available).toBe(false);
    expect(component.successMessage()).toContain('agotado hoy');
  });

  it('keeps the previous notice while the next change is in flight, so the table does not jump', () => {
    const pending = new Subject<ProductDto>();
    service['changeAvailability'].mockReturnValue(pending);
    const component = render().componentInstance;
    component.successMessage.set('"Latte" quedó marcado como agotado hoy.');

    component.onToggleAvailability(ESPRESSO_DTO_FIXTURE);
    component.confirmAvailabilityChange();

    expect(component.successMessage()).toBe('"Latte" quedó marcado como agotado hoy.');

    pending.next({ ...ESPRESSO_DTO_FIXTURE, available: false });

    expect(component.successMessage()).toContain(`"${ESPRESSO_DTO_FIXTURE.name}" quedó marcado como agotado hoy.`);
  });

  it('swaps the previous notice for the error when the change fails', () => {
    service['changeAvailability'].mockReturnValue(throwError(() => new HttpErrorResponse({ status: 500 })));
    const component = render().componentInstance;
    component.successMessage.set('"Latte" quedó marcado como agotado hoy.');

    component.onToggleAvailability(ESPRESSO_DTO_FIXTURE);
    component.confirmAvailabilityChange();

    expect(component.successMessage()).toBeNull();
    expect(component.errorMessage()).toBe('Ocurrió un error al cambiar la disponibilidad del producto.');
  });

  it('shows the detail of the backend when reactivating fails', () => {
    service['activate'].mockReturnValue(
      throwError(
        () => new HttpErrorResponse({ status: 409, error: { title: 'Conflicto de datos', detail: 'La cafetería ya vende Espresso' } }),
      ),
    );
    const component = render().componentInstance;

    component.onActivateProduct(inactive);

    expect(component.errorMessage()).toBe('La cafetería ya vende Espresso');
  });

  it('marks the product as inactive after taking it down', () => {
    const component = render().componentInstance;

    component.confirmDelete(ESPRESSO_DTO_FIXTURE);
    component.onDeleteProduct();

    expect(service['delete']).toHaveBeenCalledWith(PRODUCT_CAFE_ID, ESPRESSO_DTO_FIXTURE.externalId);
    expect(component.products()[0].state).toBe(false);
  });
});
