import { computed, inject, Injectable, signal } from '@angular/core';
import {
  CreateGlobalBenefitInput,
  GlobalBenefit,
  GlobalBenefitStatsSummary,
  GlobalBenefitTier,
  GlobalBenefitType,
  UpdateGlobalBenefitInput,
} from '../types/global-benefit.model';
import { GlobalBenefitRepository } from './global-benefit.repository';

export type BenefitSortOption = 'endDateAsc' | 'pointsDesc' | 'pointsAsc' | 'nameAsc' | 'redemptionsDesc';

export interface GlobalBenefitFilters {
  query: string;
  type: GlobalBenefitType | 'all';
  tier: GlobalBenefitTier | 'all';
  status: 'all' | 'active' | 'inactive';
  public: 'all' | 'published' | 'draft';
  sortBy: BenefitSortOption;
}

@Injectable()
export class GlobalBenefitStore {
  private readonly repository = inject(GlobalBenefitRepository);

  readonly benefits = signal<readonly GlobalBenefit[]>([]);
  readonly status = signal<'loading' | 'ready' | 'error'>('loading');
  readonly errorMessage = signal<string | null>(null);
  readonly isProcessing = signal<boolean>(false);
  readonly actionMessage = signal<{ type: 'success' | 'error'; text: string } | null>(null);

  readonly isFormModalOpen = signal<boolean>(false);
  readonly formModalMode = signal<'create' | 'edit'>('create');
  readonly editingBenefit = signal<GlobalBenefit | null>(null);

  readonly filters = signal<GlobalBenefitFilters>({
    query: '',
    type: 'all',
    tier: 'all',
    status: 'all',
    public: 'all',
    sortBy: 'endDateAsc',
  });

  readonly stats = computed<GlobalBenefitStatsSummary>(() => {
    const list = this.benefits();
    const total = list.length;
    return {
      total,
      active: list.filter((b) => b.status).length,
      publicCount: list.filter((b) => b.isPublic).length,
      avgPoints: total > 0 ? Math.round(list.reduce((acc, b) => acc + b.pointsCost, 0) / total) : 0,
      totalRedemptions: list.reduce((acc, b) => acc + b.currentRedemptions, 0),
    };
  });

  readonly filteredBenefits = computed<readonly GlobalBenefit[]>(() => {
    const f = this.filters();
    const q = f.query.trim().toLowerCase();

    return this.benefits()
      .filter((b) => {
        if (f.type !== 'all' && b.type !== f.type) return false;
        if (f.tier !== 'all' && b.tier !== f.tier) return false;
        if (f.status === 'active' && !b.status) return false;
        if (f.status === 'inactive' && b.status) return false;
        if (f.public === 'published' && !b.isPublic) return false;
        if (f.public === 'draft' && b.isPublic) return false;
        return !q || b.name.toLowerCase().includes(q) || b.description.toLowerCase().includes(q);
      })
      .sort((a, b) => {
        if (f.sortBy === 'pointsDesc') return b.pointsCost - a.pointsCost;
        if (f.sortBy === 'pointsAsc') return a.pointsCost - b.pointsCost;
        if (f.sortBy === 'nameAsc') return a.name.localeCompare(b.name, 'es');
        if (f.sortBy === 'redemptionsDesc') return b.currentRedemptions - a.currentRedemptions;
        return new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
      });
  });

  constructor() {
    this.loadBenefits();
  }

  loadBenefits(): void {
    this.status.set('loading');
    this.errorMessage.set(null);
    this.repository.getGlobalBenefits().subscribe({
      next: (data) => { this.benefits.set(data); this.status.set('ready'); },
      error: () => { this.status.set('error'); this.errorMessage.set('No se pudo cargar la lista de beneficios globales.'); },
    });
  }

  openCreateModal(): void {
    this.formModalMode.set('create');
    this.editingBenefit.set(null);
    this.isFormModalOpen.set(true);
  }

  openEditModal(benefit: GlobalBenefit): void {
    this.formModalMode.set('edit');
    this.editingBenefit.set(benefit);
    this.isFormModalOpen.set(true);
  }

  closeFormModal(): void {
    this.isFormModalOpen.set(false);
    this.editingBenefit.set(null);
  }

  saveBenefit(input: CreateGlobalBenefitInput | UpdateGlobalBenefitInput): void {
    this.isProcessing.set(true);
    const isEdit = 'id' in input && Boolean(input.id);
    const req$ = isEdit
      ? this.repository.updateGlobalBenefit(input as UpdateGlobalBenefitInput)
      : this.repository.createGlobalBenefit(input as CreateGlobalBenefitInput);

    req$.subscribe({
      next: (res) => {
        this.benefits.update((prev) => isEdit ? prev.map((b) => b.id === res.id ? res : b) : [res, ...prev]);
        this.closeFormModal();
        this.isProcessing.set(false);
        this.actionMessage.set({ type: 'success', text: `Beneficio "${res.name}" ${isEdit ? 'actualizado' : 'creado'} exitosamente.` });
      },
      error: (err) => {
        this.isProcessing.set(false);
        this.actionMessage.set({ type: 'error', text: err?.message || 'Error al guardar el beneficio.' });
      },
    });
  }

  duplicateBenefit(b: GlobalBenefit): void {
    this.openCreateModal();
    this.editingBenefit.set({ ...b, id: '', name: `${b.name} (Copia)`, isPublic: false });
    this.formModalMode.set('create');
  }

  deleteBenefit(b: GlobalBenefit): void {
    if (!confirm(`¿Eliminar el beneficio global "${b.name}" de toda la red?`)) return;
    this.isProcessing.set(true);
    this.repository.deleteGlobalBenefit(b.id).subscribe({
      next: () => {
        this.benefits.update((prev) => prev.filter((item) => item.id !== b.id));
        this.isProcessing.set(false);
        this.actionMessage.set({ type: 'success', text: `Beneficio "${b.name}" eliminado de la red.` });
      },
      error: () => { this.isProcessing.set(false); },
    });
  }

  togglePublish(id: string, currentPublic: boolean): void {
    this.repository.togglePublish(id, !currentPublic).subscribe({
      next: (res) => this.benefits.update((prev) => prev.map((b) => b.id === id ? res : b)),
    });
  }

  toggleStatus(id: string, currentStatus: boolean): void {
    this.repository.toggleStatus(id, !currentStatus).subscribe({
      next: (res) => this.benefits.update((prev) => prev.map((b) => b.id === id ? res : b)),
    });
  }

  setFilter<K extends keyof GlobalBenefitFilters>(key: K, value: GlobalBenefitFilters[K]): void {
    this.filters.update((f) => ({ ...f, [key]: value }));
  }

  resetFilters(): void {
    this.filters.set({ query: '', type: 'all', tier: 'all', status: 'all', public: 'all', sortBy: 'endDateAsc' });
  }

  dismissActionMessage(): void {
    this.actionMessage.set(null);
  }
}
