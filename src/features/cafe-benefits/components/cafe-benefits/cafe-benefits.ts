import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Observable, switchMap } from 'rxjs';
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
import { toDeletionErrorMessage, toVisibilityErrorMessage } from '../../utils/benefit-action-error';
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
  busyBenefitId = signal<string | null>(null);
  showForm = signal(false);
  editingBenefit = signal<CafeBenefit | null>(null);
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
      error: () =>
        this.errorMessage.set('No se pudieron cargar los tipos de promoción. Recargá la página para intentar de nuevo.'),
    });

    this.cafeBenefitService.getTiers().subscribe({
      next: (tiers) => this.tiers.set(tiers),
      error: () =>
        this.errorMessage.set('No se pudieron cargar los niveles de socio. Recargá la página para intentar de nuevo.'),
    });
  }

  loadProducts(): void {
    this.productService
      .getMyCafeId()
      .pipe(switchMap((cafeId) => this.productService.listByCafe(cafeId)))
      .subscribe({
        next: (products) => this.products.set(toProductOptions(products)),
        error: () =>
          this.errorMessage.set('No se pudieron cargar los productos del local. Recargá la página para intentar de nuevo.'),
      });
  }

  onSaveBenefit(request: CreateCafeBenefitRequest): void {
    this.isSaving.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    const editing = this.editingBenefit();
    if (editing) {
      this.updateBenefit(editing, request);
      return;
    }

    this.cafeBenefitService.create(request).subscribe({
      next: ({ benefit, publishError }) => {
        this.benefits.update((list) => [benefit, ...list]);
        this.isSaving.set(false);
        this.showForm.set(false);
        if (publishError) {
          const reason = backendErrorMessage(publishError);
          this.errorMessage.set(`La promoción se guardó, pero no se pudo publicar.${reason ? ` ${reason}` : ''}`);
          return;
        }
        this.successMessage.set('¡Promoción publicada exitosamente!');
      },
      error: (err) => {
        this.isSaving.set(false);
        const serverError = backendErrorMessage(err);
        this.errorMessage.set(serverError || 'Ocurrió un error al crear la promoción. Verificá los datos ingresados.');
      },
    });
  }

  onEditBenefit(benefit: CafeBenefit): void {
    // The save in flight closes the form when it lands, which would throw this edit away.
    if (this.isSaving()) {
      return;
    }
    this.editingBenefit.set(benefit);
    this.showForm.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);
  }

  onPauseBenefit(benefit: CafeBenefit): void {
    this.changeVisibility(
      benefit,
      this.cafeBenefitService.pause(benefit.externalId),
      'Pausaste la promoción: los clientes ya no pueden canjearla, pero los cupones que ya tienen siguen valiendo.',
    );
  }

  onResumeBenefit(benefit: CafeBenefit): void {
    this.changeVisibility(
      benefit,
      this.cafeBenefitService.resume(benefit.externalId),
      'La promoción volvió a estar disponible para los clientes.',
    );
  }

  onRemoveBenefit(benefit: CafeBenefit): void {
    this.startAction(benefit);
    this.cafeBenefitService.delete(benefit.externalId).subscribe({
      next: () => {
        this.benefits.update((list) => list.filter((item) => item.externalId !== benefit.externalId));
        if (this.editingBenefit()?.externalId === benefit.externalId) {
          this.closeForm();
        }
        this.busyBenefitId.set(null);
        this.successMessage.set('Eliminaste la promoción.');
      },
      error: (err) => {
        this.busyBenefitId.set(null);
        this.errorMessage.set(toDeletionErrorMessage(err));
      },
    });
  }

  toggleForm(): void {
    this.showForm.update((open) => !open);
    this.editingBenefit.set(null);
    this.errorMessage.set(null);
  }

  closeForm(): void {
    this.showForm.set(false);
    this.editingBenefit.set(null);
    this.errorMessage.set(null);
  }

  private updateBenefit(editing: CafeBenefit, request: CreateCafeBenefitRequest): void {
    this.cafeBenefitService
      .update(editing.externalId, { ...request, maxPerClient: editing.maxPerClient ?? null })
      .subscribe({
        next: (updated) => {
          this.replaceBenefit(updated);
          this.isSaving.set(false);
          this.closeForm();
          this.successMessage.set('¡Promoción actualizada exitosamente!');
        },
        error: (err) => {
          this.isSaving.set(false);
          const serverError = backendErrorMessage(err);
          this.errorMessage.set(
            serverError || 'Ocurrió un error al actualizar la promoción. Verificá los datos ingresados.',
          );
        },
      });
  }

  private changeVisibility(benefit: CafeBenefit, request: Observable<CafeBenefit>, successMessage: string): void {
    this.startAction(benefit);
    request.subscribe({
      next: (updated) => {
        this.replaceBenefit(updated);
        this.busyBenefitId.set(null);
        this.successMessage.set(successMessage);
      },
      error: (err) => {
        this.busyBenefitId.set(null);
        this.errorMessage.set(toVisibilityErrorMessage(err));
      },
    });
  }

  private startAction(benefit: CafeBenefit): void {
    this.busyBenefitId.set(benefit.externalId);
    this.errorMessage.set(null);
    this.successMessage.set(null);
  }

  private replaceBenefit(updated: CafeBenefit): void {
    this.benefits.update((list) =>
      list.map((benefit) => (benefit.externalId === updated.externalId ? updated : benefit)),
    );
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

