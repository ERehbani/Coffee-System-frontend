import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Icon } from '../../../../shared/components/icon/icon';
import { LogoutButton } from '../../../auth/components/logout-button/logout-button';
import { ProductService } from '../../../catalog/services/product.service';
import {
  CategoryOption,
  CreateProductRequest,
  ProductDto,
  UpdateProductRequest,
} from '../../../catalog/types/product.dto';
import { ProductForm } from '../product-form/product-form';
import { ProductItemCard } from '../product-item-card/product-item-card';

function normalizeText(text: string | null | undefined): string {
  if (!text) {
    return '';
  }
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

@Component({
  selector: 'app-cafe-products',
  imports: [RouterLink, FormsModule, Icon, LogoutButton, ProductItemCard, ProductForm],
  templateUrl: './cafe-products.html',
  styleUrl: './cafe-products.css',
  host: { class: 'block' },
})
export class CafeProducts implements OnInit {
  private readonly productService = inject(ProductService);

  products = signal<ProductDto[]>([]);
  categories = signal<CategoryOption[]>([]);

  isLoading = signal(true);
  isSaving = signal(false);
  isDeleting = signal(false);
  showForm = signal(false);
  editingProduct = signal<ProductDto | null>(null);
  deletingProduct = signal<ProductDto | null>(null);

  searchQuery = signal('');
  filterState = signal<'all' | 'active' | 'inactive'>('all');
  selectedCategory = signal<string>('all');

  successMessage = signal<string | null>(null);
  errorMessage = signal<string | null>(null);

  filteredProducts = computed(() => {
    let list = this.products();

    if (this.filterState() === 'active') {
      list = list.filter((p) => p.state);
    } else if (this.filterState() === 'inactive') {
      list = list.filter((p) => !p.state);
    }

    if (this.selectedCategory() !== 'all') {
      const selectedNorm = normalizeText(this.selectedCategory());
      list = list.filter(
        (p) =>
          normalizeText(p.category) === selectedNorm ||
          p.categoryId === this.selectedCategory() ||
          normalizeText(p.category).includes(selectedNorm),
      );
    }

    const query = normalizeText(this.searchQuery());
    if (!query) {
      return list;
    }

    return list.filter(
      (p) =>
        normalizeText(p.name).includes(query) ||
        normalizeText(p.description).includes(query) ||
        normalizeText(p.category).includes(query) ||
        (p.tags && p.tags.some((tag) => normalizeText(tag).includes(query))),
    );
  });

  totalProductsCount = computed(() => this.products().length);

  activeProductsCount = computed(() => {
    return this.products().filter((p) => p.state).length;
  });

  inactiveProductsCount = computed(() => {
    return this.products().filter((p) => !p.state).length;
  });

  availableCategories = computed(() => {
    const set = new Set<string>();
    for (const p of this.products()) {
      if (p.category) {
        set.add(p.category);
      }
    }
    for (const c of this.categories()) {
      if (c.name) {
        set.add(c.name);
      }
    }
    return Array.from(set);
  });

  ngOnInit(): void {
    this.loadProducts();
    this.loadCategories();
  }

  loadProducts(): void {
    this.isLoading.set(true);
    this.productService.getAll().subscribe({
      next: (data) => {
        this.products.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.errorMessage.set('No se pudieron cargar los productos del local.');
      },
    });
  }

  loadCategories(): void {
    this.productService.getCategories().subscribe({
      next: (cats) => {
        this.categories.set(cats);
      },
      error: () => {
        this.errorMessage.set('No se pudieron cargar las categorías disponibles.');
      },
    });
  }

  toggleForm(): void {
    if (this.showForm()) {
      this.closeForm();
    } else {
      this.openCreateForm();
    }
  }

  openCreateForm(): void {
    this.editingProduct.set(null);
    this.showForm.set(true);
    this.errorMessage.set(null);
  }

  openEditForm(product: ProductDto): void {
    this.editingProduct.set(product);
    this.showForm.set(true);
    this.errorMessage.set(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  closeForm(): void {
    this.showForm.set(false);
    this.editingProduct.set(null);
  }

  onSaveProduct(payload: { request: CreateProductRequest & { state?: boolean }; id?: string }): void {
    this.isSaving.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    if (payload.id) {
      const updatePayload: UpdateProductRequest = {
        name: payload.request.name,
        description: payload.request.description,
        price: payload.request.price,
        awardedPoints: payload.request.awardedPoints,
        categoryId: payload.request.categoryId,
        image: payload.request.image,
        tags: payload.request.tags,
        state: payload.request.state,
      };

      this.productService.update(payload.id, updatePayload).subscribe({
        next: (updatedProduct) => {
          this.products.update((list) =>
            list.map((item) => (item.externalId === updatedProduct.externalId ? updatedProduct : item)),
          );
          this.isSaving.set(false);
          this.closeForm();
          this.successMessage.set('¡Producto modificado exitosamente!');
        },
        error: (err) => {
          this.isSaving.set(false);
          const serverError = this.getErrorMessage(err);
          this.errorMessage.set(serverError || 'Ocurrió un error al actualizar el producto.');
        },
      });
    } else {
      this.productService.create(payload.request).subscribe({
        next: (newProduct) => {
          this.products.update((list) => [newProduct, ...list]);
          this.isSaving.set(false);
          this.closeForm();
          this.successMessage.set('¡Producto publicado exitosamente!');
        },
        error: (err) => {
          this.isSaving.set(false);
          const serverError = this.getErrorMessage(err);
          this.errorMessage.set(serverError || 'Ocurrió un error al crear el producto.');
        },
      });
    }
  }

  onActivateProduct(product: ProductDto): void {
    this.errorMessage.set(null);
    this.successMessage.set(null);

    this.productService.activate(product.externalId).subscribe({
      next: (updatedProduct) => {
        this.products.update((list) =>
          list.map((item) => (item.externalId === updatedProduct.externalId ? updatedProduct : item)),
        );
        this.successMessage.set(`El producto "${product.name}" fue reactivado exitosamente.`);
      },
      error: (err) => {
        const serverError = this.getErrorMessage(err);
        this.errorMessage.set(serverError || 'Ocurrió un error al activar el producto.');
      },
    });
  }

  confirmDelete(product: ProductDto): void {
    this.deletingProduct.set(product);
  }

  cancelDelete(): void {
    this.deletingProduct.set(null);
  }

  onDeleteProduct(): void {
    const toDelete = this.deletingProduct();
    if (!toDelete) {
      return;
    }

    this.isDeleting.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    this.productService.delete(toDelete.externalId).subscribe({
      next: () => {
        this.products.update((list) =>
          list.map((item) => (item.externalId === toDelete.externalId ? { ...item, state: false } : item)),
        );
        this.isDeleting.set(false);
        this.deletingProduct.set(null);
        this.successMessage.set(`El producto "${toDelete.name}" fue dado de baja exitosamente.`);
      },
      error: (err) => {
        this.isDeleting.set(false);
        const serverError = this.getErrorMessage(err);
        this.errorMessage.set(serverError || 'Ocurrió un error al dar de baja el producto.');
      },
    });
  }

  onSearchChange(value: string): void {
    this.searchQuery.set(value);
  }

  clearSearch(): void {
    this.searchQuery.set('');
  }

  setFilterState(state: 'all' | 'active' | 'inactive'): void {
    this.filterState.set(state);
  }

  setSelectedCategory(cat: string): void {
    this.selectedCategory.set(cat);
  }

  dismissSuccess(): void {
    this.successMessage.set(null);
  }

  dismissError(): void {
    this.errorMessage.set(null);
  }

  private getErrorMessage(err: unknown): string | null {
    if (!err || typeof err !== 'object') {
      return null;
    }
    const httpErr = err as { error?: unknown };
    if (typeof httpErr.error === 'string') {
      return httpErr.error;
    }
    if (httpErr.error && typeof httpErr.error === 'object') {
      const body = httpErr.error as { error?: string; message?: string; errors?: Record<string, string> };
      if (body.error && typeof body.error === 'string') {
        return body.error;
      }
      if (body.message && typeof body.message === 'string') {
        return body.message;
      }
      if (body.errors && typeof body.errors === 'object') {
        const msgs = Object.values(body.errors).filter((m) => typeof m === 'string');
        if (msgs.length > 0) {
          return msgs.join('. ');
        }
      }
    }
    return null;
  }
}
