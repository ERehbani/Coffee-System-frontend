import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { CatalogPage } from './catalog-page';

describe('CatalogPage', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CatalogPage],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
  });

  it('should create the catalog page', () => {
    const fixture = TestBed.createComponent(CatalogPage);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });

  it('should load cafes and default selected cafe on init', async () => {
    const fixture = TestBed.createComponent(CatalogPage);
    const component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.cafes().length).toBeGreaterThan(0);
    expect(component.selectedCafe()).not.toBeNull();
    expect(component.products().length).toBeGreaterThan(0);
  });

  it('should switch selected cafe and load its products', async () => {
    const fixture = TestBed.createComponent(CatalogPage);
    const component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();

    const secondCafe = component.cafes()[1];
    component.selectCafe(secondCafe, false);

    expect(component.selectedCafe()?.externalId).toBe(secondCafe.externalId);
    expect(
      component.products().every((p) => p.cafeExternalId === secondCafe.externalId)
    ).toBe(true);
  });

  it('should filter products by category and query', async () => {
    const fixture = TestBed.createComponent(CatalogPage);
    const component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();

    component.onSelectCategory('Cafetería');
    expect(
      component.filteredProducts().every((p) => p.category === 'Cafetería')
    ).toBe(true);

    component.onProductSearchChange('Espresso');
    expect(component.filteredProducts().length).toBeGreaterThan(0);
    expect(
      component.filteredProducts().every(
        (p) =>
          p.name.toLowerCase().includes('espresso') ||
          p.description?.toLowerCase().includes('espresso')
      )
    ).toBe(true);
  });
});
