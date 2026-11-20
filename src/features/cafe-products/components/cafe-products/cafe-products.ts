import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { map } from 'rxjs';
import { Icon } from '../../../../shared/components/icon/icon';
import { ProductService } from '../../../catalog/services/product.service';
import {
  CategoryOption,
  CreateProductRequest,
  ProductDto,
  UpdateProductRequest,
} from '../../../catalog/types/product.dto';
import { backendErrorMessage } from '../../../../shared/utils/backend-error';
import { ProductForm } from '../product-form/product-form';
import { ProductItemRow } from '../product-item-row/product-item-row';

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
  imports: [FormsModule, Icon, ProductItemRow, ProductForm],
  templateUrl: './cafe-products.html',
  styleUrl: './cafe-products.css',
  host: { class: 'block', '(document:keydown.escape)': 'onEscape()' },
})
export class CafeProducts implements OnInit {
  private readonly productService = inject(ProductService);

  cafeId = signal<string | null>(null);
  products = signal<ProductDto[]>([]);
  categories = signal<CategoryOption[]>([]);

  isLoading = signal(true);
  isSaving = signal(false);
  isDeleting = signal(false);
  showForm = signal(false);
  editingProduct = signal<ProductDto | null>(null);
  deletingProduct = signal<ProductDto | null>(null);
  /** Producto al que se le quiere cambiar la disponibilidad, a la espera de que la cafetería lo confirme. */
  availabilityProduct = signal<ProductDto | null>(null);

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
    this.loadMyCafe();
    this.loadCategories();
  }

  loadMyCafe(): void {
    this.isLoading.set(true);
    this.productService.getMyCafeId().subscribe({
      next: (cafeId) => {
        this.cafeId.set(cafeId);
        this.loadProducts();
      },
      error: () => this.failLoading(),
    });
  }

  loadProducts(): void {
    const cafeId = this.cafeId();
    if (!cafeId) {
      return;
    }
    this.isLoading.set(true);
    this.productService.listByCafe(cafeId).subscribe({
      next: (data) => {
        this.products.set(data);
        this.isLoading.set(false);
      },
      error: () => this.failLoading(),
    });
  }

  private failLoading(): void {
    this.isLoading.set(false);
    this.errorMessage.set('No se pudieron cargar los productos del local.');
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
    const cafeId = this.cafeId();
    if (!cafeId) {
      return;
    }
    this.isSaving.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    if (payload.id) {
      const updatePayload: UpdateProductRequest = {
        name: payload.request.name,
        description: payload.request.description,
        price: payload.request.price,
        awardedPoints: payload.request.awardedPoints,
        image: payload.request.image,
        tags: payload.request.tags,
      };

      const requestedState = payload.request.state;
      this.productService.update(cafeId, payload.id, updatePayload).subscribe({
        next: (updatedProduct) => {
          this.replaceProduct(updatedProduct);
          if (requestedState === undefined || requestedState === updatedProduct.state) {
            this.finishEdit();
            return;
          }
          this.changeState(cafeId, updatedProduct, requestedState);
        },
        error: (err) => {
          this.isSaving.set(false);
          const serverError = backendErrorMessage(err);
          this.errorMessage.set(serverError || 'Ocurrió un error al actualizar el producto.');
        },
      });
    } else {
      this.productService.create(cafeId, payload.request).subscribe({
        next: (newProduct) => {
          this.products.update((list) => [newProduct, ...list]);
          this.isSaving.set(false);
          this.closeForm();
          this.successMessage.set('¡Producto publicado exitosamente!');
        },
        error: (err) => {
          this.isSaving.set(false);
          const serverError = backendErrorMessage(err);
          this.errorMessage.set(serverError || 'Ocurrió un error al crear el producto.');
        },
      });
    }
  }

  private changeState(cafeId: string, product: ProductDto, active: boolean): void {
    const change$ = active
      ? this.productService.activate(cafeId, product.externalId)
      : this.productService.delete(cafeId, product.externalId).pipe(map(() => ({ ...product, state: false })));

    change$.subscribe({
      next: (changedProduct) => {
        this.replaceProduct(changedProduct);
        this.finishEdit();
      },
      error: (err) => {
        this.isSaving.set(false);
        const reason = backendErrorMessage(err);
        const action = active ? 'activar' : 'dar de baja';
        this.errorMessage.set(
          `Los cambios se guardaron, pero no se pudo ${action} el producto.${reason ? ` ${reason}` : ''}`,
        );
      },
    });
  }

  private finishEdit(): void {
    this.isSaving.set(false);
    this.closeForm();
    this.successMessage.set('¡Producto modificado exitosamente!');
  }

  onActivateProduct(product: ProductDto): void {
    const cafeId = this.cafeId();
    if (!cafeId) {
      return;
    }
    this.errorMessage.set(null);
    this.successMessage.set(null);

    this.productService.activate(cafeId, product.externalId).subscribe({
      next: (updatedProduct) => {
        this.replaceProduct(updatedProduct);
        this.successMessage.set(`El producto "${product.name}" fue reactivado exitosamente.`);
      },
      error: (err) => {
        const serverError = backendErrorMessage(err);
        this.errorMessage.set(serverError || 'Ocurrió un error al activar el producto.');
      },
    });
  }

  onToggleAvailability(product: ProductDto): void {
    this.availabilityProduct.set(product);
  }

  cancelAvailabilityChange(): void {
    this.availabilityProduct.set(null);
  }

  confirmAvailabilityChange(): void {
    const product = this.availabilityProduct();
    this.availabilityProduct.set(null);
    if (product) {
      this.changeAvailability(product);
    }
  }

  onEscape(): void {
    this.cancelAvailabilityChange();
    this.cancelDelete();
  }

  private changeAvailability(product: ProductDto): void {
    const cafeId = this.cafeId();
    if (!cafeId) {
      return;
    }
    this.errorMessage.set(null);
    this.successMessage.set(null);

    this.productService.changeAvailability(cafeId, product.externalId, !product.available).subscribe({
      next: (updatedProduct) => {
        this.replaceProduct(updatedProduct);
        this.successMessage.set(
          updatedProduct.available
            ? `"${product.name}" está disponible de nuevo.`
            : `"${product.name}" quedó marcado como agotado hoy.`,
        );
      },
      error: (err) => {
        const serverError = backendErrorMessage(err);
        this.errorMessage.set(serverError || 'Ocurrió un error al cambiar la disponibilidad del producto.');
      },
    });
  }

  private replaceProduct(updatedProduct: ProductDto): void {
    this.products.update((list) =>
      list.map((item) => (item.externalId === updatedProduct.externalId ? updatedProduct : item)),
    );
  }

  confirmDelete(product: ProductDto): void {
    this.deletingProduct.set(product);
  }

  cancelDelete(): void {
    // Escape and the backdrop also land here: leave the dialog alone while the baja is in flight.
    if (this.isDeleting()) {
      return;
    }
    this.deletingProduct.set(null);
  }

  onDeleteProduct(): void {
    const toDelete = this.deletingProduct();
    const cafeId = this.cafeId();
    if (!toDelete || !cafeId) {
      return;
    }

    this.isDeleting.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    this.productService.delete(cafeId, toDelete.externalId).subscribe({
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
        const serverError = backendErrorMessage(err);
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
}
