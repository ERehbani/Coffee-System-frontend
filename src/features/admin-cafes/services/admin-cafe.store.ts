import { computed, inject, Injectable, signal } from '@angular/core';
import { AdminCafe, CafeStatsSummary, CreateCafeInput } from '../types/admin-cafe.model';
import { AdminCafeRepository } from './admin-cafe.repository';

export type AdminCafeStoreStatus = 'loading' | 'ready' | 'error';

export interface ActionFeedback {
  readonly type: 'success' | 'error';
  readonly text: string;
}

@Injectable()
export class AdminCafeStore {
  private readonly repository = inject(AdminCafeRepository);

  readonly cafes = signal<readonly AdminCafe[]>([]);
  readonly status = signal<AdminCafeStoreStatus>('loading');
  readonly errorMessage = signal<string | null>(null);

  readonly selectedCafe = signal<AdminCafe | null>(null);
  readonly isRegisterModalOpen = signal<boolean>(false);
  readonly isProcessing = signal<boolean>(false);
  readonly actionMessage = signal<ActionFeedback | null>(null);

  readonly searchQuery = signal<string>('');
  readonly stateFilter = signal<'all' | 'active' | 'inactive'>('all');

  readonly stats = computed<CafeStatsSummary>(() => {
    const list = this.cafes();
    return {
      totalCafes: list.length,
      activeCafes: list.filter((c) => c.state).length,
      inactiveCafes: list.filter((c) => !c.state).length,
      withSchedule: list.filter((c) => c.schedule && c.schedule !== 'Horario no especificado')
        .length,
    };
  });

  readonly filteredCafes = computed<readonly AdminCafe[]>(() => {
    const query = this.searchQuery().trim().toLowerCase();
    const filter = this.stateFilter();
    const list = this.cafes();

    return list.filter((cafe) => {
      if (filter === 'active' && !cafe.state) {
        return false;
      }
      if (filter === 'inactive' && cafe.state) {
        return false;
      }

      if (!query) {
        return true;
      }

      const matchesId = cafe.externalId.toLowerCase().includes(query);
      const matchesName = cafe.name.toLowerCase().includes(query);
      const matchesAddress = cafe.address.toLowerCase().includes(query);
      const matchesEmail = cafe.email.toLowerCase().includes(query);
      const matchesPhone = cafe.phoneNumber.toLowerCase().includes(query);

      return matchesId || matchesName || matchesAddress || matchesEmail || matchesPhone;
    });
  });

  constructor() {
    this.loadCafes();
  }

  loadCafes(): void {
    this.status.set('loading');
    this.errorMessage.set(null);

    this.repository.getCafes().subscribe({
      next: (data) => {
        this.cafes.set(data);
        this.status.set('ready');
      },
      error: () => {
        this.status.set('error');
        this.errorMessage.set(
          'No se pudo cargar la lista de cafeterías. Por favor, intente nuevamente.',
        );
      },
    });
  }

  selectCafe(cafe: AdminCafe | null): void {
    this.selectedCafe.set(cafe);
    this.actionMessage.set(null);
  }

  selectCafeById(externalId: string): void {
    const found = this.cafes().find((c) => c.externalId === externalId);
    if (found) {
      this.selectedCafe.set(found);
      this.actionMessage.set(null);
    }
  }

  clearSelection(): void {
    this.selectedCafe.set(null);
  }

  openRegisterModal(): void {
    this.isRegisterModalOpen.set(true);
    this.actionMessage.set(null);
  }

  closeRegisterModal(): void {
    this.isRegisterModalOpen.set(false);
  }

  registerCafe(input: CreateCafeInput, onSuccess?: () => void): void {
    this.isProcessing.set(true);
    this.actionMessage.set(null);

    this.repository.registerCafe(input).subscribe({
      next: (newCafe) => {
        this.cafes.update((prev) => [newCafe, ...prev]);
        this.isProcessing.set(false);
        this.isRegisterModalOpen.set(false);
        this.actionMessage.set({
          type: 'success',
          text: `¡Cafetería "${newCafe.name}" registrada exitosamente con credenciales de acceso inicial!`,
        });

        if (onSuccess) {
          onSuccess();
        }
      },
      error: (err) => {
        this.isProcessing.set(false);
        this.actionMessage.set({
          type: 'error',
          text:
            err?.message ||
            'Ocurrió un error al intentar registrar la cafetería. Verifique los datos ingresados.',
        });
      },
    });
  }

  updateCafeStatus(externalId: string, state: boolean, onSuccess?: () => void): void {
    this.isProcessing.set(true);
    this.actionMessage.set(null);

    this.repository.updateCafeStatus(externalId, state).subscribe({
      next: (updated) => {
        this.cafes.update((prev) =>
          prev.map((c) => (c.externalId === externalId ? updated : c)),
        );

        if (this.selectedCafe()?.externalId === externalId) {
          this.selectedCafe.set(updated);
        }

        const msg = state
          ? `¡La cafetería "${updated.name}" ha sido activada con éxito!`
          : `¡La cafetería "${updated.name}" ha sido dada de baja del sistema!`;

        this.actionMessage.set({ type: 'success', text: msg });
        this.isProcessing.set(false);

        if (onSuccess) {
          onSuccess();
        }
      },
      error: (err) => {
        this.isProcessing.set(false);
        this.actionMessage.set({
          type: 'error',
          text: err?.message || 'Error al actualizar el estado de la cafetería.',
        });
      },
    });
  }

  dismissActionMessage(): void {
    this.actionMessage.set(null);
  }

  setSearchQuery(query: string): void {
    this.searchQuery.set(query);
  }

  setStateFilter(state: 'all' | 'active' | 'inactive'): void {
    this.stateFilter.set(state);
  }

  resetFilters(): void {
    this.searchQuery.set('');
    this.stateFilter.set('all');
  }
}
