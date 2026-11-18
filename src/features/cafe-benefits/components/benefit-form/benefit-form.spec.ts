import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BenefitTypeOption, CreateCafeBenefitRequest } from '../../model/cafe-benefit.model';
import { BenefitForm } from './benefit-form';

describe('BenefitForm', () => {
  const types: BenefitTypeOption[] = [
    { id: 'CODIGO_DESCUENTO', name: 'CODIGO_DESCUENTO', displayName: 'Código de Descuento (%)' },
    { id: 'DOS_POR_UNO', name: 'DOS_POR_UNO', displayName: 'Promoción 2x1' },
  ];

  function render(): ComponentFixture<BenefitForm> {
    const fixture = TestBed.createComponent(BenefitForm);
    fixture.componentRef.setInput('benefitTypes', types);
    fixture.componentRef.setInput('tiers', [{ id: 'tier-bronce', name: 'BRONCE', displayName: 'Bronce (0 pts)' }]);
    fixture.componentRef.setInput('products', [{ id: 'product-medialuna', name: 'Medialuna' }]);
    fixture.detectChanges();
    return fixture;
  }

  function fillRequiredFields(form: BenefitForm): void {
    form.formModel.update((m) => ({
      ...m,
      name: '2x1 en medialunas',
      description: 'Llevá dos y pagá una',
      endDate: '2099-12-31',
    }));
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [BenefitForm] }).compileComponents();
  });

  it('starts with the first type and sends the discount of a discount code', () => {
    const form = render().componentInstance;
    let sent: CreateCafeBenefitRequest | undefined;
    form.save.subscribe((request) => (sent = request));
    fillRequiredFields(form);

    form.onSubmit(new Event('submit'));

    expect(sent?.type).toBe('CODIGO_DESCUENTO');
    expect(sent?.discountPercentage).toBe(15);
    expect(sent?.productId).toBeNull();
  });

  it('asks for a product when the type needs one', () => {
    const fixture = render();
    const form = fixture.componentInstance;
    const save = vi.fn();
    form.save.subscribe(save);
    fillRequiredFields(form);

    form.onTypeChange('DOS_POR_UNO');
    form.onSubmit(new Event('submit'));
    fixture.detectChanges();

    expect(save).not.toHaveBeenCalled();
    expect(form.productError()).toBe('Elegí el producto del beneficio.');
    expect(fixture.nativeElement.querySelector('#benefit-product-select')).not.toBeNull();
  });

  it('sends the chosen product of a 2x1', () => {
    const form = render().componentInstance;
    let sent: CreateCafeBenefitRequest | undefined;
    form.save.subscribe((request) => (sent = request));
    fillRequiredFields(form);

    form.onTypeChange('DOS_POR_UNO');
    form.onProductChange('product-medialuna');
    form.onSubmit(new Event('submit'));

    expect(sent?.type).toBe('DOS_POR_UNO');
    expect(sent?.productId).toBe('product-medialuna');
    expect(sent?.discountPercentage).toBeNull();
  });

  it('pre-fills every field from the benefit being edited', () => {
    const fixture = render();
    fixture.componentRef.setInput('benefit', {
      externalId: 'benefit-1',
      name: '2x1 Espresso',
      description: 'Dos por uno',
      conditions: 'Solo en salón',
      pointsCost: 120,
      status: true,
      isPublic: true,
      maxRedemptions: 20,
      global: false,
      benefitType: 'DOS_POR_UNO',
      productId: 'product-medialuna',
      tierId: 'tier-bronce',
      startDate: '2026-11-15',
      endDate: '2026-12-15',
    });
    fixture.detectChanges();
    const form = fixture.componentInstance;
    let sent: CreateCafeBenefitRequest | undefined;
    form.save.subscribe((request) => (sent = request));

    form.onSubmit(new Event('submit'));

    expect(fixture.nativeElement.querySelector('h2').textContent.trim()).toBe('Editar Promoción');
    expect(fixture.nativeElement.querySelector('button[type="submit"]').textContent).toContain('Guardar cambios');
    expect(sent).toEqual({
      name: '2x1 Espresso',
      description: 'Dos por uno',
      conditions: 'Solo en salón',
      startDate: '2026-11-15',
      endDate: '2026-12-15',
      pointsCost: 120,
      discountPercentage: null,
      maxRedemptions: 20,
      type: 'DOS_POR_UNO',
      productId: 'product-medialuna',
      tierId: 'tier-bronce',
    });
  });

  it('forgets the product when switching to a type without product', () => {
    const form = render().componentInstance;

    form.onTypeChange('DOS_POR_UNO');
    form.onProductChange('product-medialuna');
    form.onTypeChange('CODIGO_DESCUENTO');

    expect(form.formModel().productId).toBe('');
    expect(form.needsProduct()).toBe(false);
  });
});
