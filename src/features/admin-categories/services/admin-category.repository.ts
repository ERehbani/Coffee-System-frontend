import { Observable } from 'rxjs';
import { AdminCategory, CategoryFormData } from '../types/admin-category.model';

export abstract class AdminCategoryRepository {
  abstract getCategories(): Observable<readonly AdminCategory[]>;
  abstract getCategoryById(id: string): Observable<AdminCategory | null>;
  abstract createCategory(data: CategoryFormData): Observable<AdminCategory>;
  abstract updateCategory(id: string, data: CategoryFormData): Observable<AdminCategory>;
  abstract deleteCategory(id: string): Observable<void>;
}
