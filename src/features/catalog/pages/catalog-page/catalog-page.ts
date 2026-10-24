import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subject, merge, of } from 'rxjs';
import { catchError, distinctUntilChanged, map, switchMap, tap } from 'rxjs/operators';
import { Icon } from '../../../../shared/components/icon/icon';
import { CartButton } from '../../../cart/components/cart-button/cart-button';
import { CartService } from '../../../cart/services/cart.service';
import { Cafe } from '../../../home/model/cafe.model';
import { CafeService } from '../../../home/services/cafe.service';
import { ProductCard } from '../../components/product-card/product-card';
import { ProductDetailModal } from '../../components/product-detail-modal/product-detail-modal';
import { Product } from '../../model/product.model';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-catalog-page',
  imports: [RouterLink, FormsModule, Icon, ProductCard, ProductDetailModal, CartButton],
  templateUrl: './catalog-page.html',
  host: { class: 'block' },
})
export class CatalogPage implements OnInit {
  private readonly cafeService = inject(CafeService);
  private readonly productService = inject(ProductService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  readonly cartService = inject(CartService);

  private readonly manualCafeId$ = new Subject<string>();

  cafes = signal<Cafe[]>([]);
  selectedCafe = signal<Cafe | null>(null);
  isLoadingCafes = signal(true);

  products = signal<Product[]>([]);
  isLoadingProducts = signal(false);

  selectedCategory = signal('Todas');
  productSearchQuery = signal('');
  addedProductMessage = signal<string | null>(null);
  pendingProduct = signal<Product | null>(null);
  selectedProduct = signal<Product | null>(null);
  private messageTimeout?: ReturnType<typeof setTimeout>;

  categories = computed(() => {
    const set = new Set(this.products().map((p) => p.category));
    return ['Todas', ...Array.from(set)];
  });

  categoryCounts = computed(() => {
    const counts: Record<string, number> = { Todas: this.products().length };
    for (const p of this.products()) {
      counts[p.category] = (counts[p.category] || 0) + 1;
    }
    return counts;
  });

  filteredProducts = computed(() => {
    let list = this.products();
    const cat = this.selectedCategory();
    if (cat !== 'Todas') {
      list = list.filter((p) => p.category === cat);
    }

    const query = this.productSearchQuery().toLowerCase().trim();
    if (query) {
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          (p.description && p.description.toLowerCase().includes(query))
      );
    }

    return list;
  });

  ngOnInit(): void {
    this.cafeService
      .getAll()
      .pipe(
        tap((cafes) => {
          this.cafes.set(cafes);
          this.isLoadingCafes.set(false);
        }),
        switchMap((cafes) => {
          const queryParamCafeId$ = this.route.queryParams.pipe(
            map((params) => params['cafe'] as string | undefined)
          );

          return merge(queryParamCafeId$, this.manualCafeId$).pipe(
            map((cafeId) => {
              return cafes.find((c) => c.externalId === cafeId) || cafes[0];
            }),
            distinctUntilChanged((prev, curr) => prev?.externalId === curr?.externalId),
            tap((cafe) => {
              if (cafe) {
                this.selectedCafe.set(cafe);
                this.selectedCategory.set('Todas');
                this.productSearchQuery.set('');
                this.isLoadingProducts.set(true);
              }
            }),
            switchMap((cafe) => {
              if (!cafe) {
                return of([]);
              }
              return this.productService.getProductsByCafe(cafe.externalId).pipe(
                catchError((error) => {
                  console.error('Error loading products:', error);
                  return of([]);
                })
              );
            })
          );
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (products) => {
          this.products.set(products);
          this.isLoadingProducts.set(false);
        },
        error: (err) => {
          console.error('Error loading catalog data:', err);
          this.isLoadingCafes.set(false);
          this.isLoadingProducts.set(false);
        },
      });
  }

  selectCafe(cafe: Cafe, updateUrl: boolean = true): void {
    if (updateUrl) {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { cafe: cafe.externalId },
        queryParamsHandling: 'merge',
      });
    } else {
      this.manualCafeId$.next(cafe.externalId);
    }
  }

  loadProducts(cafeExternalId: string): void {
    this.manualCafeId$.next(cafeExternalId);
  }

  onSelectCategory(category: string): void {
    this.selectedCategory.set(category);
  }

  onProductSearchChange(value: string): void {
    this.productSearchQuery.set(value);
  }

  clearProductSearch(): void {
    this.productSearchQuery.set('');
  }

  onAddToOrder(product: Product): void {
    const cafe = this.selectedCafe();
    if (!cafe) {
      return;
    }

    if (this.cartService.isFromAnotherCafe(product)) {
      this.pendingProduct.set(product);
      return;
    }

    if (this.cartService.addProduct(product, cafe)) {
      this.showAddedMessage(product);
    }
  }

  openProductDetail(product: Product): void {
    this.selectedProduct.set(product);
  }

  closeProductDetail(): void {
    this.selectedProduct.set(null);
  }

  onAddFromDetail(product: Product): void {
    this.selectedProduct.set(null);
    this.onAddToOrder(product);
  }

  confirmReplaceCart(): void {
    const product = this.pendingProduct();
    const cafe = this.selectedCafe();
    if (!product || !cafe) {
      return;
    }

    if (this.cartService.replaceWithProduct(product, cafe)) {
      this.showAddedMessage(product);
    }
    this.pendingProduct.set(null);
  }

  cancelReplaceCart(): void {
    this.pendingProduct.set(null);
  }

  private showAddedMessage(product: Product): void {
    clearTimeout(this.messageTimeout);
    this.addedProductMessage.set(`¡${product.name} agregado al carrito!`);
    this.messageTimeout = setTimeout(() => {
      this.addedProductMessage.set(null);
    }, 2500);
  }
}
