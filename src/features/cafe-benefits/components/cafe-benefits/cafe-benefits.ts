import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { switchMap } from 'rxjs';
import { Icon } from '../../../../shared/components/icon/icon';
import { backendErrorMessage } from '../../../../shared/utils/backend-error';
import { ProductService } from '../../../catalog/services/product.service';
import { ProductDto } from '../../../catalog/types/product.dto';
import {
  BenefitTypeOption,
  CafeBenefit,
  CreateCafeBenefitRequest,
  ProductOption,
  TierOption,
} from '../../model/cafe-benefit.model';
import { CafeBenefitService } from '../../services/cafe-benefit.service';
import { BenefitCard } from '../benefit-card/benefit-card';
import { BenefitForm } from '../benefit-form/benefit-form';

function toProductOptions(products: ProductDto[]): ProductOption[] {
  return products.filter((product) => product.state).map((product) => ({ id: product.externalId, name: product.name }));
}

@Component({
  selector: 'app-cafe-benefits',
  imports: [FormsModule, Icon, BenefitCard, BenefitForm],
  templateUrl: './cafe-benefits.html',
  styleUrl: './cafe-benefits.css',
  host: { class: 'block' },
})
export class CafeBenefits implements OnInit {
  private readonly cafeBenefitService = inject(CafeBenefitService);
  private readonly productService = inject(ProductService);

  benefits = signal<CafeBenefit[]>([]);
  benefitTypes = signal<BenefitTypeOption[]>([]);
  tiers = signal<TierOption[]>([]);
  products = signal<ProductOption[]>([]);

  isLoading = signal(true);
  isSaving = signal(false);
  showForm = signal(false);
  searchQuery = signal('');
  filterState = signal<'all' | 'active'>('all');
  successMessage = signal<string | null>(null);
  errorMessage = signal<string | null>(null);

  filteredBenefits = computed(() => {
    let list = this.benefits();

    if (this.filterState() === 'active') {
      list = list.filter((b) => b.status);
    }

    const query = this.searchQuery().toLowerCase().trim();
    if (!query) {
      return list;
    }

    return list.filter(
      (b) =>
        b.name.toLowerCase().includes(query) ||
        b.description.toLowerCase().includes(query) ||
        (b.conditions && b.conditions.toLowerCase().includes(query)),
    );
  });

  totalBenefitsCount = computed(() => this.benefits().length);

  activeBenefitsCount = computed(() => {
    return this.benefits().filter((b) => b.status).length;
  });

  ngOnInit(): void {
    this.loadBenefits();
    this.loadTypesAndTiers();
    this.loadProducts();
  }

  loadBenefits(): void {
    this.isLoading.set(true);
    this.cafeBenefitService.getAll().subscribe({
      next: (data) => {
        this.benefits.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.errorMessage.set('No se pudieron cargar las promociones del local.');
      },
    });
  }

  loadTypesAndTiers(): void {
    this.cafeBenefitService.getBenefitTypes().subscribe({
      next: (types) => this.benefitTypes.set(types),
    });

    this.cafeBenefitService.getTiers().subscribe({
      next: (tiers) => this.tiers.set(tiers),
    });
  }

  loadProducts(): void {
    this.productService
      .getMyCafeId()
      .pipe(switchMap((cafeId) => this.productService.listByCafe(cafeId)))
      .subscribe({
        next: (products) => this.products.set(toProductOptions(products)),
      });
  }

  onSaveBenefit(request: CreateCafeBenefitRequest): void {
    this.isSaving.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    this.cafeBenefitService.create(request).subscribe({
      next: (newBenefit) => {
        this.benefits.update((list) => [newBenefit, ...list]);
        this.isSaving.set(false);
        this.showForm.set(false);
        this.successMessage.set('¡Promoción publicada exitosamente!');
      },
      error: (err) => {
        this.isSaving.set(false);
        const serverError = backendErrorMessage(err);
        this.errorMessage.set(serverError || 'Ocurrió un error al crear la promoción. Verificá los datos ingresados.');
      },
    });
  }

  toggleForm(): void {
    this.showForm.update((open) => !open);
    this.errorMessage.set(null);
  }

  closeForm(): void {
    this.showForm.set(false);
  }

  onSearchChange(value: string): void {
    this.searchQuery.set(value);
  }

  clearSearch(): void {
    this.searchQuery.set('');
  }

  setFilterState(state: 'all' | 'active'): void {
    this.filterState.set(state);
  }

  dismissSuccess(): void {
    this.successMessage.set(null);
  }

  dismissError(): void {
    this.errorMessage.set(null);
  }
}

