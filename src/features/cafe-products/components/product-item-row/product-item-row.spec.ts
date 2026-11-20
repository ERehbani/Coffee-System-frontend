import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductDto } from '../../../catalog/types/product.dto';
import { ESPRESSO_DTO_FIXTURE } from '../../../catalog/utils/product.fixture';
import { ProductItemRow } from './product-item-row';

describe('ProductItemRow', () => {
  function render(product: ProductDto): ComponentFixture<ProductItemRow> {
    const fixture = TestBed.createComponent(ProductItemRow);
    fixture.componentRef.setInput('product', product);
    fixture.detectChanges();
    return fixture;
  }

  function buttonLabelled(fixture: ComponentFixture<ProductItemRow>, label: string): HTMLButtonElement | null {
    return fixture.nativeElement.querySelector(`button[aria-label^="${label}"]`);
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [ProductItemRow] }).compileComponents();
  });

  it('offers to mark an available product as sold out for today', () => {
    const fixture = render(ESPRESSO_DTO_FIXTURE);
    let toggled: ProductDto | undefined;
    fixture.componentInstance.toggleAvailability.subscribe((product) => (toggled = product));

    buttonLabelled(fixture, 'Marcar como agotado hoy')?.click();

    expect(toggled).toEqual(ESPRESSO_DTO_FIXTURE);
  });

  it('shows the sold out badge and offers to make it available again', () => {
    const fixture = render({ ...ESPRESSO_DTO_FIXTURE, available: false });

    expect(fixture.nativeElement.textContent).toContain('Agotado hoy');
    expect(buttonLabelled(fixture, 'Marcar como disponible')).not.toBeNull();
  });

  it('offers to activate a product that was taken down', () => {
    const fixture = render({ ...ESPRESSO_DTO_FIXTURE, state: false });
    let activated: ProductDto | undefined;
    fixture.componentInstance.activate.subscribe((product) => (activated = product));

    buttonLabelled(fixture, 'Activar producto')?.click();

    expect(activated?.state).toBe(false);
    expect(buttonLabelled(fixture, 'Marcar como agotado hoy')).toBeNull();
  });
});
