import { Injectable } from '@angular/core';
import { delay, map, Observable, of, throwError } from 'rxjs';
import { CategoryDto } from '../types/admin-category.dto';
import { AdminCategory, CategoryFormData } from '../types/admin-category.model';
import { ADMIN_CATEGORIES_FIXTURE } from '../utils/admin-category.fixture';
import { toAdminCategory, toAdminCategoryList } from '../utils/admin-category.mapper';
import { AdminCategoryRepository } from './admin-category.repository';

export const MOCK_CATEGORY_LATENCY_MS = 250;

@Injectable()
export class MockAdminCategoryRepository implements AdminCategoryRepository {
  private categories: CategoryDto[] = ADMIN_CATEGORIES_FIXTURE.map((cat) => ({ ...cat }));

  getCategories(): Observable<readonly AdminCategory[]> {
    return of(this.categories).pipe(
      delay(MOCK_CATEGORY_LATENCY_MS),
      map(toAdminCategoryList),
    );
  }

  getCategoryById(id: string): Observable<AdminCategory | null> {
    const found = this.categories.find(
      (c) => (c.categoryId || c.externalId || c.id) === id,
    );
    return of(found ? toAdminCategory(found) : null).pipe(
      delay(MOCK_CATEGORY_LATENCY_MS),
    );
  }

  createCategory(data: CategoryFormData): Observable<AdminCategory> {
    const trimmedName = data.name.trim();

    // Check duplicate name
    const exists = this.categories.some(
      (c) => c.name.trim().toLowerCase() === trimmedName.toLowerCase(),
    );
    if (exists) {
      return throwError(() => new Error(`Ya existe una categoría con el nombre "${trimmedName}".`));
    }

    const now = new Date().toISOString();
    const newDto: CategoryDto = {
      categoryId: `cat-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      name: trimmedName,
      description: data.description?.trim() || '',
      icon: data.icon || 'tag',
      color: data.color || 'amber',
      status: data.status || 'active',
      productCount: 0,
      cafeCount: 0,
      createdAt: now,
      updatedAt: now,
    };

    this.categories = [newDto, ...this.categories];

    return of(toAdminCategory(newDto)).pipe(
      delay(MOCK_CATEGORY_LATENCY_MS),
    );
  }

  updateCategory(id: string, data: CategoryFormData): Observable<AdminCategory> {
    const index = this.categories.findIndex(
      (c) => (c.categoryId || c.externalId || c.id) === id,
    );

    if (index === -1) {
      return throwError(() => new Error(`Categoría no encontrada con el identificador proporcionado.`));
    }

    const trimmedName = data.name.trim();
    // Check duplicate name on another category
    const duplicate = this.categories.some(
      (c, i) => i !== index && c.name.trim().toLowerCase() === trimmedName.toLowerCase(),
    );
    if (duplicate) {
      return throwError(() => new Error(`Ya existe otra categoría con el nombre "${trimmedName}".`));
    }

    const current = this.categories[index];
    const now = new Date().toISOString();

    const updatedDto: CategoryDto = {
      ...current,
      name: trimmedName,
      description: data.description?.trim() || '',
      icon: data.icon || current.icon || 'tag',
      color: data.color || current.color || 'amber',
      status: data.status || current.status || 'active',
      updatedAt: now,
    };

    this.categories[index] = updatedDto;

    return of(toAdminCategory(updatedDto)).pipe(
      delay(MOCK_CATEGORY_LATENCY_MS),
    );
  }

  deleteCategory(id: string): Observable<void> {
    const index = this.categories.findIndex(
      (c) => (c.categoryId || c.externalId || c.id) === id,
    );

    if (index === -1) {
      return throwError(() => new Error(`Categoría no encontrada para eliminar.`));
    }

    this.categories = this.categories.filter((_, i) => i !== index);

    return of(void 0).pipe(
      delay(MOCK_CATEGORY_LATENCY_MS),
    );
  }
}
