import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Observable, of, Subject, throwError } from 'rxjs';
import type { Mock } from 'vitest';
import { CartService } from '../../../cart/services/cart.service';
import { Cafe } from '../../../home/model/cafe.model';
import { CafeService } from '../../../home/services/cafe.service';
import {
  CAFE_CENTRAL_FIXTURE,
  CAFE_NORTE_FIXTURE,
  CAFES_FIXTURE,
} from '../../../home/utils/cafe.fixture';
import { Product } from '../../model/product.model';
import { ProductService } from '../../services/product.service';
import {
  ESPRESSO_FIXTURE,
  NORTE_LATTE_FIXTURE,
  PRODUCTS_FIXTURE,
} from '../../utils/product.fixture';
import { CatalogPage } from './catalog-page';

function productsOf(cafeId: string): Product[] {
  return cafeId === CAFE_NORTE_FIXTURE.externalId ? [NORTE_LATTE_FIXTURE] : PRODUCTS_FIXTURE;
}

describe('CatalogPage', () => {
  let getAll: Mock<() => Observable<Cafe[]>>;
  let getProductsByCafe: Mock<(cafeId: string) => Observable<Product[]>>;

  function render(): ComponentFixture<CatalogPage> {
    const fixture = TestBed.createComponent(CatalogPage);
    fixture.detectChanges();
    return fixture;
  }

  beforeEach(async () => {
    getAll = vi.fn(() => of(CAFES_FIXTURE));
    getProductsByCafe = vi.fn((cafeId: string) => of(productsOf(cafeId)));
    await TestBed.configureTestingModule({
      imports: [CatalogPage],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: CafeService, useValue: { getAll } },
        { provide: ProductService, useValue: { getProductsByCafe } },
      ],
    }).compileComponents();
  });

  afterEach(() => localStorage.clear());

  it('should load cafes and the products of the first cafe on init', () => {
    const component = render().componentInstance;

    expect(component.cafes()).toEqual(CAFES_FIXTURE);
    expect(component.selectedCafe()).toEqual(CAFE_CENTRAL_FIXTURE);
    expect(component.products()).toEqual(PRODUCTS_FIXTURE);
    expect(getProductsByCafe).toHaveBeenCalledWith(CAFE_CENTRAL_FIXTURE.externalId);
  });

  it('should switch selected cafe and load its products', () => {
    const component = render().componentInstance;

    component.selectCafe(CAFE_NORTE_FIXTURE, false);

    expect(component.selectedCafe()?.externalId).toBe(CAFE_NORTE_FIXTURE.externalId);
    expect(component.products()).toEqual([NORTE_LATTE_FIXTURE]);
  });

  it('should filter products by category and query', () => {
    const component = render().componentInstance;

    component.onSelectCategory('Cafetería');
    expect(component.filteredProducts().length).toBe(2);
    expect(component.filteredProducts().every((p) => p.category === 'Cafetería')).toBe(true);

    component.onProductSearchChange('Espresso');
    expect(component.filteredProducts().map((p) => p.name)).toEqual([
      'Espresso Doble',
      'Flat White',
    ]);
  });

  it('adds a product of the selected cafe to the cart', () => {
    const fixture = render();
    const cart = TestBed.inject(CartService);

    fixture.componentInstance.onAddToOrder(ESPRESSO_FIXTURE);

    expect(cart.items().map((item) => item.product.externalId)).toEqual([
      ESPRESSO_FIXTURE.externalId,
    ]);
    expect(fixture.componentInstance.addedProductMessage()).toContain('Espresso Doble');
  });

  it('does not show a rating the backend did not send', () => {
    const element: HTMLElement = render().nativeElement;

    expect(element.textContent).toContain('Mostrando productos de Cafe Central');
    expect(element.textContent).not.toContain('4.8');
  });

  describe('while the cafes are loading', () => {
    let pendingCafes: Subject<Cafe[]>;

    beforeEach(() => {
      pendingCafes = new Subject<Cafe[]>();
      getAll.mockReturnValueOnce(pendingCafes);
    });

    it('shows placeholders instead of an empty catalog', () => {
      const element: HTMLElement = render().nativeElement;

      expect(element.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);
      expect(element.textContent).toContain('Cargando productos…');
      expect(element.textContent).not.toContain('0 cafeterías disponibles');
      expect(element.textContent).not.toContain('No hay productos disponibles');
    });

    it('replaces the placeholders with the catalog once it arrives', () => {
      const fixture = render();
      const element: HTMLElement = fixture.nativeElement;

      pendingCafes.next(CAFES_FIXTURE);
      fixture.detectChanges();

      expect(element.querySelectorAll('.animate-pulse').length).toBe(0);
      expect(element.textContent).toContain(`${CAFES_FIXTURE.length} cafeterías disponibles`);
      expect(element.querySelectorAll('app-product-card').length).toBe(PRODUCTS_FIXTURE.length);
    });
  });

  describe('while the products of another cafe are loading', () => {
    let pendingProducts: Subject<Product[]>;

    function switchToPendingCafe(): ComponentFixture<CatalogPage> {
      const fixture = render();
      pendingProducts = new Subject<Product[]>();
      getProductsByCafe.mockReturnValueOnce(pendingProducts);
      fixture.componentInstance.selectCafe(CAFE_NORTE_FIXTURE, false);
      fixture.detectChanges();
      return fixture;
    }

    it('shows placeholders and hides the products of the previous cafe', () => {
      const fixture = switchToPendingCafe();
      const element: HTMLElement = fixture.nativeElement;

      expect(fixture.componentInstance.products()).toEqual([]);
      expect(element.querySelectorAll('app-product-card').length).toBe(0);
      expect(element.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);
      expect(element.textContent).toContain('Cargando productos…');
      expect(element.textContent).not.toContain('No hay productos disponibles');
    });

    it('shows the products of the new cafe once they arrive', () => {
      const fixture = switchToPendingCafe();
      const element: HTMLElement = fixture.nativeElement;

      pendingProducts.next([NORTE_LATTE_FIXTURE]);
      fixture.detectChanges();

      expect(element.querySelectorAll('.animate-pulse').length).toBe(0);
      expect(element.querySelectorAll('app-product-card').length).toBe(1);
      expect(element.textContent).toContain('1 productos disponibles');
    });
  });

  describe('when the cafes fail to load', () => {
    beforeEach(() => getAll.mockReturnValueOnce(throwError(() => new Error('500'))));

    it('shows an error and hides the empty catalog', () => {
      const fixture = render();
      const element: HTMLElement = fixture.nativeElement;

      expect(fixture.componentInstance.hasCafesError()).toBe(true);
      expect(element.querySelector('[role="alert"]')?.textContent).toContain(
        'No pudimos cargar las cafeterías',
      );
      expect(
        element.querySelector('section[aria-label="Listado de productos"]')?.classList,
      ).toContain('hidden');
    });

    it('loads the catalog when the client retries', () => {
      const fixture = render();
      const element: HTMLElement = fixture.nativeElement;

      element.querySelector<HTMLButtonElement>('[role="alert"] button')!.click();
      fixture.detectChanges();

      expect(fixture.componentInstance.hasCafesError()).toBe(false);
      expect(fixture.componentInstance.products()).toEqual(PRODUCTS_FIXTURE);
      expect(element.querySelector('[role="alert"]')).toBeNull();
    });
  });

  describe('when the products fail to load', () => {
    beforeEach(() => getProductsByCafe.mockReturnValueOnce(throwError(() => new Error('500'))));

    it('shows an error instead of an empty menu', () => {
      const fixture = render();
      const element: HTMLElement = fixture.nativeElement;

      expect(fixture.componentInstance.hasProductsError()).toBe(true);
      expect(fixture.componentInstance.isLoadingProducts()).toBe(false);
      expect(element.querySelector('[role="alert"]')?.textContent).toContain(
        'No pudimos cargar los productos',
      );
      expect(element.textContent).not.toContain('No hay productos disponibles');
    });

    it('loads the products when the client retries', () => {
      const fixture = render();
      const element: HTMLElement = fixture.nativeElement;

      element.querySelector<HTMLButtonElement>('[role="alert"] button')!.click();
      fixture.detectChanges();

      expect(fixture.componentInstance.hasProductsError()).toBe(false);
      expect(element.querySelectorAll('app-product-card').length).toBe(PRODUCTS_FIXTURE.length);
    });

    it('clears the error when the client switches to another cafe', () => {
      const fixture = render();

      fixture.componentInstance.selectCafe(CAFE_NORTE_FIXTURE, false);

      expect(fixture.componentInstance.hasProductsError()).toBe(false);
      expect(fixture.componentInstance.products()).toEqual([NORTE_LATTE_FIXTURE]);
    });
  });
});
