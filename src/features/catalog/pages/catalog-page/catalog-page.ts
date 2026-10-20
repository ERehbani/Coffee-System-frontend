import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Icon } from '../../../../shared/components/icon/icon';
import { Cafe } from '../../../home/model/cafe.model';
import { CafeService } from '../../../home/services/cafe.service';
import { ProductCard } from '../../components/product-card/product-card';
import { Product } from '../../model/product.model';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-catalog-page',
  imports: [RouterLink, FormsModule, Icon, ProductCard],
  templateUrl: './catalog-page.html',
  host: { class: 'block' },
})
export class CatalogPage implements OnInit {
  private readonly cafeService = inject(CafeService);
  private readonly productService = inject(ProductService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  cafes = signal<Cafe[]>([]);
  selectedCafe = signal<Cafe | null>(null);
  isLoadingCafes = signal(true);

  products = signal<Product[]>([]);
  isLoadingProducts = signal(false);

  selectedCategory = signal('Todas');
  productSearchQuery = signal('');
  addedProductMessage = signal<string | null>(null);

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
    this.cafeService.getAll().subscribe({
      next: (cafes) => {
        this.cafes.set(cafes);
        const queryCafeId = this.route.snapshot.queryParams['cafe'];
        const matched = cafes.find((c) => c.externalId === queryCafeId) || cafes[0];
        if (matched) {
          this.selectCafe(matched, false);
        }
        this.isLoadingCafes.set(false);
      },
      error: (err) => {
        console.error('Error loading cafes for catalog:', err);
        this.isLoadingCafes.set(false);
      },
    });

    this.route.queryParams.subscribe((params) => {
      const cafeId = params['cafe'];
      if (cafeId && this.cafes().length > 0) {
        const found = this.cafes().find((c) => c.externalId === cafeId);
        if (found && this.selectedCafe()?.externalId !== found.externalId) {
          this.selectCafe(found, false);
        }
      }
    });
  }

  selectCafe(cafe: Cafe, updateUrl: boolean = true): void {
    this.selectedCafe.set(cafe);
    this.loadProducts(cafe.externalId);

    if (updateUrl) {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { cafe: cafe.externalId },
        queryParamsHandling: 'merge',
      });
    }
  }

  loadProducts(cafeExternalId: string): void {
    this.isLoadingProducts.set(true);
    this.selectedCategory.set('Todas');
    this.productSearchQuery.set('');

    this.productService.getProductsByCafe(cafeExternalId).subscribe({
      next: (data) => {
        this.products.set(data);
        this.isLoadingProducts.set(false);
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.products.set([]);
        this.isLoadingProducts.set(false);
      },
    });
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
    this.addedProductMessage.set(`¡${product.name} agregado al pedido!`);
    setTimeout(() => {
      this.addedProductMessage.set(null);
    }, 2500);
  }
}
