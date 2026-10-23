import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AdminCategory } from '../models/admin-category.model';

const INITIAL_CATEGORIES: AdminCategory[] = [
  { id: 'c101', name: 'Cafetería', productCount: 18 },
  { id: 'c102', name: 'Pastelería', productCount: 14 },
  { id: 'c103', name: 'Tostados y Salados', productCount: 10 },
  { id: 'c104', name: 'Bebidas', productCount: 9 },
  { id: 'c105', name: 'Tés e Infusiones', productCount: 6 },
  { id: 'c106', name: 'Granos y Molidos', productCount: 5 },
];

@Injectable({ providedIn: 'root' })
export class AdminCategoryService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/category`;

  readonly categories = signal<AdminCategory[]>(INITIAL_CATEGORIES);
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
    if (environment.useMockApi) return;
    this.loading.set(true);
    this.http.get<{ categoryId?: string; id?: string; name: string }[]>(this.baseUrl).pipe(
      map((items) => items.map((i) => ({ id: i.categoryId || i.id || '', name: i.name, productCount: 0 }))),
    ).subscribe({
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

    if (environment.useMockApi) {
      const newCat: AdminCategory = { id: `cat-${Date.now().toString(36)}`, name: trimmed, productCount: 0 };
      this.categories.update((prev) => [newCat, ...prev]);
      this.notify(`¡Categoría "${trimmed}" creada con éxito!`);
      onSuccess?.();
      return;
    }

    this.http.post<{ categoryId?: string; id?: string; name: string }>(this.baseUrl, { name: trimmed }).subscribe({
      next: (res) => {
        this.categories.update((prev) => [{ id: res.categoryId || res.id || '', name: res.name, productCount: 0 }, ...prev]);
        this.notify(`¡Categoría "${trimmed}" creada con éxito!`);
        onSuccess?.();
      },
      error: () => this.notify('Ocurrió un error al crear la categoría.', true),
    });
  }

  update(id: string, name: string, onSuccess?: () => void): void {
    const trimmed = name.trim();
    if (this.categories().some((c) => c.id !== id && c.name.toLowerCase() === trimmed.toLowerCase())) {
      this.notify(`Ya existe otra categoría con el nombre "${trimmed}".`, true);
      return;
    }

    if (environment.useMockApi) {
      this.categories.update((prev) => prev.map((c) => (c.id === id ? { ...c, name: trimmed } : c)));
      this.notify(`¡Categoría actualizada a "${trimmed}"!`);
      onSuccess?.();
      return;
    }

    this.http.put<{ categoryId?: string; id?: string; name: string }>(`${this.baseUrl}/${id}`, { name: trimmed }).subscribe({
      next: (res) => {
        this.categories.update((prev) => prev.map((c) => (c.id === id ? { ...c, name: res.name } : c)));
        this.notify(`¡Categoría actualizada a "${trimmed}"!`);
        onSuccess?.();
      },
      error: () => this.notify('Ocurrió un error al actualizar la categoría.', true),
    });
  }

  delete(id: string, onSuccess?: () => void): void {
    const cat = this.categories().find((c) => c.id === id);
    const catName = cat?.name || 'Categoría';

    if (environment.useMockApi) {
      this.categories.update((prev) => prev.filter((c) => c.id !== id));
      this.notify(`Categoría "${catName}" eliminada correctamente.`);
      onSuccess?.();
      return;
    }

    this.http.delete<void>(`${this.baseUrl}/${id}`).subscribe({
      next: () => {
        this.categories.update((prev) => prev.filter((c) => c.id !== id));
        this.notify(`Categoría "${catName}" eliminada correctamente.`);
        onSuccess?.();
      },
      error: () => this.notify('Ocurrió un error al eliminar la categoría.', true),
    });
  }

  notify(text: string, error = false): void {
    this.message.set({ text, error });
  }

  clearMessage(): void {
    this.message.set(null);
  }
}
