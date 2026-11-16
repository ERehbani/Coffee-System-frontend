import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Observable, of, Subject, throwError } from 'rxjs';
import type { Mock } from 'vitest';
import { Cafe } from '../../model/cafe.model';
import { CafeService } from '../../services/cafe.service';
import { CAFES_FIXTURE } from '../../utils/cafe.fixture';
import { Home } from './home';

describe('Home', () => {
  let getAll: Mock<() => Observable<Cafe[]>>;

  function render(): ComponentFixture<Home> {
    const fixture = TestBed.createComponent(Home);
    fixture.detectChanges();
    return fixture;
  }

  beforeEach(async () => {
    getAll = vi.fn(() => of(CAFES_FIXTURE));
    await TestBed.configureTestingModule({
      imports: [Home],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: CafeService, useValue: { getAll } },
      ],
    }).compileComponents();
  });

  it('should load cafes on init', () => {
    const component = render().componentInstance;

    expect(component.cafes()).toEqual(CAFES_FIXTURE);
    expect(component.isLoading()).toBe(false);
    expect(component.hasError()).toBe(false);
  });

  it('should filter cafes by search query', () => {
    const component = render().componentInstance;

    component.onSearchChange('Central');
    expect(component.filteredCafes().length).toBe(1);
    expect(component.filteredCafes()[0].name).toBe('Cafe Central');

    component.clearSearch();
    expect(component.filteredCafes().length).toBe(CAFES_FIXTURE.length);
  });

  it('should filter cafes by open state', () => {
    const component = render().componentInstance;

    component.setFilterState('open');

    expect(component.filteredCafes().length).toBe(2);
    expect(component.filteredCafes().every((cafe) => cafe.state)).toBe(true);
  });

  it('does not show a rating the backend did not send', () => {
    const element: HTMLElement = render().nativeElement;

    expect(element.querySelector('app-cafe-card')).not.toBeNull();
    expect(element.textContent).not.toContain('4.8');
  });

  describe('while the cafes are loading', () => {
    let pendingCafes: Subject<Cafe[]>;

    beforeEach(() => {
      pendingCafes = new Subject<Cafe[]>();
      getAll.mockReturnValueOnce(pendingCafes);
    });

    it('shows placeholders and no counters of zero cafes', () => {
      const element: HTMLElement = render().nativeElement;

      expect(element.querySelectorAll('.h-96.animate-pulse').length).toBe(4);
      expect(element.textContent).toContain('Cargando cafeterías…');
      expect(element.textContent).not.toContain('(0)');
      expect(element.textContent).not.toContain('Mostrando 0 de 0');
    });

    it('shows the cafes and their counters once they arrive', () => {
      const fixture = render();
      const element: HTMLElement = fixture.nativeElement;

      pendingCafes.next(CAFES_FIXTURE);
      fixture.detectChanges();

      expect(element.querySelectorAll('.h-96.animate-pulse').length).toBe(0);
      expect(element.textContent).toContain('Mostrando 3 de 3 cafeterías');
      expect(element.querySelectorAll('app-cafe-card').length).toBe(3);
    });
  });

  describe('when the cafes fail to load', () => {
    beforeEach(() => getAll.mockReturnValueOnce(throwError(() => new Error('500'))));

    it('shows an error instead of an empty list', () => {
      const fixture = render();
      const element: HTMLElement = fixture.nativeElement;

      expect(fixture.componentInstance.hasError()).toBe(true);
      expect(fixture.componentInstance.isLoading()).toBe(false);
      expect(element.querySelector('[role="alert"]')?.textContent).toContain(
        'No pudimos cargar las cafeterías',
      );
      expect(element.textContent).not.toContain('No encontramos cafeterías');
    });

    it('loads the cafes when the client retries', () => {
      const fixture = render();
      const element: HTMLElement = fixture.nativeElement;

      element.querySelector<HTMLButtonElement>('[role="alert"] button')!.click();
      fixture.detectChanges();

      expect(getAll).toHaveBeenCalledTimes(2);
      expect(fixture.componentInstance.hasError()).toBe(false);
      expect(element.querySelectorAll('app-cafe-card').length).toBe(CAFES_FIXTURE.length);
    });
  });
});
