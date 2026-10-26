import { computed, inject, Injectable, signal } from '@angular/core';
import { SaveTierInput, Tier, TierFormErrors } from '../types/tier.model';
import { toTierFormErrors } from '../utils/tier-error';
import { sortTiers } from '../utils/tier.mapper';
import { TierRepository } from './tier.repository';

export type TierListStatus = 'loading' | 'ready' | 'error';
export type TierDrawerMode = 'create' | 'edit';

/** The base tier is the one with 0 points: every new client starts on it. */
const BASE_TIER_POINTS = 0;

@Injectable()
export class AdminTierStore {
  private readonly repository = inject(TierRepository);

  readonly tiers = signal<readonly Tier[]>([]);
  readonly status = signal<TierListStatus>('loading');
  readonly isProcessing = signal(false);
  readonly actionMessage = signal<{ type: 'success' | 'error'; text: string } | null>(null);
  readonly formErrors = signal<TierFormErrors>({});

  readonly isDrawerOpen = signal(false);
  readonly drawerMode = signal<TierDrawerMode>('create');
  readonly editingTier = signal<Tier | null>(null);

  readonly isEmpty = computed(() => this.status() === 'ready' && this.tiers().length === 0);

  constructor() {
    this.loadTiers();
  }

  loadTiers(): void {
    this.status.set('loading');
    this.repository.getTiers().subscribe({
      next: (tiers) => {
        this.tiers.set(sortTiers(tiers));
        this.status.set('ready');
      },
      error: () => this.status.set('error'),
    });
  }

  isBaseTier(tier: Tier): boolean {
    return tier.minPoints === BASE_TIER_POINTS;
  }

  openCreateDrawer(): void {
    this.drawerMode.set('create');
    this.editingTier.set(null);
    this.formErrors.set({});
    this.isDrawerOpen.set(true);
  }

  openEditDrawer(tier: Tier): void {
    this.drawerMode.set('edit');
    this.editingTier.set(tier);
    this.formErrors.set({});
    this.isDrawerOpen.set(true);
  }

  closeDrawer(): void {
    this.isDrawerOpen.set(false);
    this.editingTier.set(null);
    this.formErrors.set({});
  }

  saveTier(input: SaveTierInput): void {
    if (this.isProcessing()) {
      return;
    }
    const editing = this.editingTier();
    const request$ = editing
      ? this.repository.updateTier(editing.id, input)
      : this.repository.createTier(input);

    this.isProcessing.set(true);
    this.formErrors.set({});
    request$.subscribe({
      next: (saved) => {
        this.tiers.update((tiers) =>
          sortTiers(
            editing
              ? tiers.map((tier) => (tier.id === saved.id ? saved : tier))
              : [...tiers, saved],
          ),
        );
        this.closeDrawer();
        this.isProcessing.set(false);
        this.actionMessage.set({
          type: 'success',
          text: editing ? 'Tier actualizado.' : 'Tier creado.',
        });
      },
      error: (error: unknown) => {
        this.isProcessing.set(false);
        this.formErrors.set(toTierFormErrors(error));
      },
    });
  }

  /** Drops the server error of a field the user is editing. */
  clearFormError(field: keyof TierFormErrors): void {
    this.formErrors.update(({ [field]: _removed, ...rest }) => rest);
  }

  dismissActionMessage(): void {
    this.actionMessage.set(null);
  }
}
