import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Home } from './home';

describe('Home', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Home],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
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
});
