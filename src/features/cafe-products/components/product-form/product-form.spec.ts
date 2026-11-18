import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ProductService } from '../../../catalog/services/product.service';
import { PointsRange, ProductDto } from '../../../catalog/types/product.dto';
import { ProductForm } from './product-form';

const RANGE: PointsRange = { suggested: 100, min: 80, max: 120, referencePrice: 2500, cafesSelling: 3 };

const CAPUCCINO: ProductDto = {
  externalId: 'product-1',
  name: 'Capuccino',
  description: null,
  price: 2500,
  awardedPoints: 90,
  cafe: 'cafe-1',
  categoryId: 'cat-1',
  category: 'Cafe',
  image: 'https://example.com/capuccino.jpg',
  state: true,
  tags: [],
  catalogProductId: 'catalog-capuccino',
  available: true,
};

describe('ProductForm points', () => {
  let fixture: ComponentFixture<ProductForm>;
  let getPointsRange: ReturnType<typeof vi.fn>;

  async function render(productToEdit: ProductDto | null = null): Promise<void> {
    await TestBed.configureTestingModule({
      imports: [ProductForm],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ProductService, useValue: { getPointsRange } },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(ProductForm);
    fixture.componentRef.setInput('cafeId', 'cafe-1');
    fixture.componentRef.setInput('productToEdit', productToEdit);
    fixture.detectChanges();
    await vi.advanceTimersByTimeAsync(500);
    fixture.detectChanges();
  }

  const text = () => (fixture.nativeElement.textContent as string).replace(/\s+/g, ' ');

  beforeEach(() => {
    vi.useFakeTimers();
    getPointsRange = vi.fn(() => of(RANGE));
  });

  afterEach(() => vi.useRealTimers());

  it('fills a new product with the suggested points and shows the floor and the cap', async () => {
    await render();

    expect(getPointsRange).toHaveBeenCalledWith('cafe-1', expect.objectContaining({ price: 1500 }));
    expect(fixture.componentInstance.formModel().awardedPoints).toBe(100);
    expect(text()).toContain('Sugerido: 100 pts');
    expect(text()).toContain('Podés elegir entre 80 y 120');
    expect(text()).toContain('3 cafeterías');
  });

  it('keeps the points of a product being edited and asks with its catalog product', async () => {
    await render(CAPUCCINO);

    expect(getPointsRange).toHaveBeenCalledWith(
      'cafe-1',
      expect.objectContaining({ price: 2500, catalogProductId: 'catalog-capuccino', name: null }),
    );
    expect(fixture.componentInstance.formModel().awardedPoints).toBe(90);
    expect(fixture.componentInstance.awardedPointsError()).toBeNull();
  });

  it('flags points outside the range and offers the suggested ones', async () => {
    await render(CAPUCCINO);
    fixture.componentInstance.formModel.update((model) => ({ ...model, awardedPoints: 300 }));
    fixture.detectChanges();

    expect(text()).toContain('Para este precio los puntos tienen que estar entre 80 y 120.');

    const useSuggested = Array.from(fixture.nativeElement.querySelectorAll('button')).find(
      (button) => (button as HTMLButtonElement).textContent?.trim() === 'Usar sugerido',
    ) as HTMLButtonElement;
    useSuggested.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.formModel().awardedPoints).toBe(100);
    expect(fixture.componentInstance.awardedPointsError()).toBeNull();
  });
});
