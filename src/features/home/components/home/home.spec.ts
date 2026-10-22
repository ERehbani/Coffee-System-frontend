import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { CafeService } from '../../services/cafe.service';
import { Home } from './home';

describe('Home', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Home],
      providers: [CafeService, provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    TestBed.inject(CafeService).resetToDefault();
  });

  it('should create the home component', () => {
    const fixture = TestBed.createComponent(Home);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });

  it('should load cafes on init', async () => {
    const fixture = TestBed.createComponent(Home);
    const component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.cafes().length).toBeGreaterThan(0);
    expect(component.isLoading()).toBe(false);
  });

  it('should filter cafes by search query', async () => {
    const fixture = TestBed.createComponent(Home);
    const component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();

    component.onSearchChange('Central');
    expect(component.filteredCafes().length).toBe(1);
    expect(component.filteredCafes()[0].name).toBe('Cafe Central');

    component.clearSearch();
    expect(component.filteredCafes().length).toBe(component.cafes().length);
  });

  it('should filter cafes by open state', async () => {
    const fixture = TestBed.createComponent(Home);
    const component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();

    component.setFilterState('open');
    expect(component.filteredCafes().every((c) => c.state)).toBe(true);
  });

  it('should display newly registered cafe in home list', async () => {
    const cafeService = TestBed.inject(CafeService);
    cafeService.addCafe({
      externalId: 'cafe-test-999',
      name: 'Cafetería Agregada por Admin',
      address: 'Palermo 123',
      email: 'admin@esmeralda.com',
      state: true,
      description: 'Café recién dado de alta',
    });

    const fixture = TestBed.createComponent(Home);
    const component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.cafes()[0].name).toBe('Cafetería Agregada por Admin');
    expect(
      component.filteredCafes().some((c) => c.name === 'Cafetería Agregada por Admin'),
    ).toBe(true);
  });
});
