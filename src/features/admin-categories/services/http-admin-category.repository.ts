import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CategoryDto, CreateCategoryRequestDto } from '../types/admin-category.dto';
import { AdminCategory, CategoryFormData } from '../types/admin-category.model';
import { toAdminCategory, toAdminCategoryList } from '../utils/admin-category.mapper';
import { AdminCategoryRepository } from './admin-category.repository';

@Injectable()
export class HttpAdminCategoryRepository implements AdminCategoryRepository {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/category`;

  getCategories(): Observable<readonly AdminCategory[]> {
    return this.http.get<readonly CategoryDto[]>(this.baseUrl).pipe(
      map(toAdminCategoryList),
    );
  }

  getCategoryById(id: string): Observable<AdminCategory | null> {
    return this.http.get<CategoryDto>(`${this.baseUrl}/${id}`).pipe(
      map((dto) => (dto ? toAdminCategory(dto) : null)),
    );
  }

  createCategory(data: CategoryFormData): Observable<AdminCategory> {
    const payload: CreateCategoryRequestDto = {
      name: data.name,
    };
    return this.http.post<CategoryDto>(this.baseUrl, payload).pipe(
      map((dto) => {
        const mapped = toAdminCategory(dto);
        return {
          ...mapped,
          description: data.description,
          icon: data.icon,
          color: data.color,
          status: data.status,
        };
      }),
    );
  }

  updateCategory(id: string, data: CategoryFormData): Observable<AdminCategory> {
    const payload = {
      name: data.name,
    };
    return this.http.put<CategoryDto>(`${this.baseUrl}/${id}`, payload).pipe(
      map((dto) => {
        const mapped = toAdminCategory(dto);
        return {
          ...mapped,
          description: data.description,
          icon: data.icon,
          color: data.color,
          status: data.status,
        };
      }),
    );
  }

  deleteCategory(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
