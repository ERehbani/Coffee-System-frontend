import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductDto } from '../../../catalog/types/product.dto';
import { ESPRESSO_DTO_FIXTURE } from '../../../catalog/utils/product.fixture';
import { ProductItemCard } from './product-item-card';

describe('ProductItemCard', () => {
  function render(product: ProductDto): ComponentFixture<ProductItemCard> {
    const fixture = TestBed.createComponent(ProductItemCard);
    fixture.componentRef.setInput('product', product);
    fixture.detectChanges();
    return fixture;
  }

  function buttonWithText(fixture: ComponentFixture<ProductItemCard>, text: string): HTMLButtonElement | undefined {
    const buttons = Array.from(fixture.nativeElement.querySelectorAll('button')) as HTMLButtonElement[];
    return buttons.find((button) => button.textContent?.trim() === text);
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [ProductItemCard] }).compileComponents();
  });

  it('offers to mark an available product as sold out for today', () => {
    const fixture = render(ESPRESSO_DTO_FIXTURE);
    let toggled: ProductDto | undefined;
    fixture.componentInstance.toggleAvailability.subscribe((product) => (toggled = product));

    buttonWithText(fixture, 'Agotado hoy')?.click();

    expect(toggled).toEqual(ESPRESSO_DTO_FIXTURE);
  });

  it('shows the sold out badge and offers to make it available again', () => {
    const fixture = render({ ...ESPRESSO_DTO_FIXTURE, available: false });

    expect(fixture.nativeElement.textContent).toContain('Agotado hoy');
    expect(buttonWithText(fixture, 'Disponible')).toBeDefined();
  });

  it('offers to activate a product that was taken down', () => {
    const fixture = render({ ...ESPRESSO_DTO_FIXTURE, state: false });
    let activated: ProductDto | undefined;
    fixture.componentInstance.activate.subscribe((product) => (activated = product));

    buttonWithText(fixture, 'Activar')?.click();

    expect(activated?.state).toBe(false);
    expect(buttonWithText(fixture, 'Agotado hoy')).toBeUndefined();
  });
});
