import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { AdminCategoriesPage } from './admin-categories-page';

const CATEGORIES_URL = `${environment.apiBaseUrl}/category`;

describe('AdminCategoriesPage', () => {
  let fixture: ComponentFixture<AdminCategoriesPage>;
  let element: HTMLElement;
  let http: HttpTestingController;

  function answerWith(categories: { categoryId: string; name: string }[]): void {
    for (const request of http.match(CATEGORIES_URL)) {
      request.flush(categories);
    }
    fixture.detectChanges();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminCategoriesPage],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(AdminCategoriesPage);
    element = fixture.nativeElement;
    fixture.detectChanges();
  });

  it('shows placeholders instead of the empty message while the categories load', () => {
    expect(element.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);
    expect(element.textContent).not.toContain('No se encontraron categorías');
  });

  it('lists the categories once they arrive', () => {
    answerWith([
      { categoryId: 'category-1', name: 'Cafetería' },
      { categoryId: 'category-2', name: 'Pastelería' },
    ]);

    expect(element.querySelectorAll('.animate-pulse').length).toBe(0);
    expect(element.querySelectorAll('tbody tr').length).toBe(2);
    expect(element.textContent).toContain('Pastelería');
  });

  it('shows the empty message when there are no categories', () => {
    answerWith([]);

    expect(element.querySelectorAll('.animate-pulse').length).toBe(0);
    expect(element.textContent).toContain('No se encontraron categorías');
  });
});
