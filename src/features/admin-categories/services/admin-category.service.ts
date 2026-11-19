import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { backendErrorMessage } from '../../../shared/utils/backend-error';
import { AdminCategory } from '../models/admin-category.model';

interface CategoryDto {
  readonly categoryId: string;
  readonly name: string;
  readonly productCount: number;
}

function toAdminCategory(dto: CategoryDto): AdminCategory {
  return { id: dto.categoryId, name: dto.name, productCount: dto.productCount };
}

@Injectable({ providedIn: 'root' })
export class AdminCategoryService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/category`;

  readonly categories = signal<AdminCategory[]>([]);
  readonly searchQuery = signal('');
  readonly loading = signal(false);
  readonly message = signal<{ text: string; error?: boolean } | null>(null);

  readonly filteredCategories = computed(() => {
    const q = this.searchQuery().trim().toLowerCase();
    return q
      ? this.categories().filter((c) => c.name.toLowerCase().includes(q))
      : this.categories();
  });

  constructor() {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.http.get<CategoryDto[]>(this.baseUrl).pipe(map((items) => items.map(toAdminCategory))).subscribe({
      next: (list) => {
        this.categories.set(list);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.notify('Error al sincronizar categorías con el servidor', true);
      },
    });
  }

  create(name: string, onSuccess?: () => void): void {
    const trimmed = name.trim();
    if (this.categories().some((c) => c.name.toLowerCase() === trimmed.toLowerCase())) {
      this.notify(`Ya existe una categoría con el nombre "${trimmed}".`, true);
      return;
    }

    this.http.post<CategoryDto>(this.baseUrl, { name: trimmed }).subscribe({
      next: (res) => {
        this.categories.update((prev) => [toAdminCategory(res), ...prev]);
        this.notify(`¡Categoría "${trimmed}" creada con éxito!`);
        onSuccess?.();
      },
      error: (err: unknown) => this.notifyError('crear', err),
    });
  }

  update(id: string, name: string, onSuccess?: () => void): void {
    const trimmed = name.trim();
    if (this.categories().some((c) => c.id !== id && c.name.toLowerCase() === trimmed.toLowerCase())) {
      this.notify(`Ya existe otra categoría con el nombre "${trimmed}".`, true);
      return;
    }

    this.http.put<CategoryDto>(`${this.baseUrl}/${id}`, { name: trimmed }).subscribe({
      next: (res) => {
        this.categories.update((prev) => prev.map((c) => (c.id === id ? toAdminCategory(res) : c)));
        this.notify(`¡Categoría actualizada a "${trimmed}"!`);
        onSuccess?.();
      },
      error: (err: unknown) => this.notifyError('actualizar', err),
    });
  }

  delete(id: string, onSuccess?: () => void): void {
    const cat = this.categories().find((c) => c.id === id);
    const catName = cat?.name || 'Categoría';

    this.http.delete<void>(`${this.baseUrl}/${id}`).subscribe({
      next: () => {
        this.categories.update((prev) => prev.filter((c) => c.id !== id));
        this.notify(`Categoría "${catName}" eliminada correctamente.`);
        onSuccess?.();
      },
      error: (err: unknown) => this.notifyError('eliminar', err),
    });
  }

  notify(text: string, error = false): void {
    this.message.set({ text, error });
  }

  private notifyError(action: 'crear' | 'actualizar' | 'eliminar', error: unknown): void {
    const reason = backendErrorMessage(error);
    this.notify(
      reason ? `No se pudo ${action} la categoría. ${reason}` : `Ocurrió un error al ${action} la categoría.`,
      true,
    );
  }

  clearMessage(): void {
    this.message.set(null);
  }
}
