import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Icon } from '../../../../shared/components/icon/icon';
import { LogoutButton } from '../../../auth/components/logout-button/logout-button';
import {
  BenefitTypeOption,
  CafeBenefit,
  CreateCafeBenefitRequest,
  TierOption,
} from '../../model/cafe-benefit.model';
import { CafeBenefitService } from '../../services/cafe-benefit.service';
import { BenefitCard } from '../benefit-card/benefit-card';
import { BenefitForm } from '../benefit-form/benefit-form';

@Component({
  selector: 'app-cafe-benefits',
  imports: [RouterLink, FormsModule, Icon, LogoutButton, BenefitCard, BenefitForm],
  templateUrl: './cafe-benefits.html',
  styleUrl: './cafe-benefits.css',
  host: { class: 'block' },
})
export class CafeBenefits implements OnInit {
  private readonly cafeBenefitService = inject(CafeBenefitService);

  benefits = signal<CafeBenefit[]>([]);
  benefitTypes = signal<BenefitTypeOption[]>([]);
  tiers = signal<TierOption[]>([]);

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
        const serverError = this.getErrorMessage(err);
        this.errorMessage.set(serverError || 'Ocurrió un error al crear la promoción. Verificá los datos ingresados.');
      },
    });
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

