import { formatOpeningHours } from '../../../../shared/utils/opening-hours';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Icon } from '../../../../shared/components/icon/icon';
import { Cafe, CreateCafeAccountRequest, UpdateCafeRequest } from '../../../home/model/cafe.model';
import { CafeService } from '../../../home/services/cafe.service';
import { CafeDetailModal } from '../../components/cafe-detail-modal/cafe-detail-modal';
import { CafeEditModal } from '../../components/cafe-edit-modal/cafe-edit-modal';
import { CafeRegisterModal } from '../../components/cafe-register-modal/cafe-register-modal';
import { toCafeAdminErrorMessage } from '../../utils/cafe-admin-error';

@Component({
  selector: 'app-admin-cafes-page',
  imports: [Icon, CafeDetailModal, CafeEditModal, CafeRegisterModal],
  templateUrl: './admin-cafes-page.html',
  styleUrl: './admin-cafes-page.css',
  host: { class: 'block' },
})
export class AdminCafesPage implements OnInit {
  readonly formatHours = formatOpeningHours;

  private readonly cafeService = inject(CafeService);

  cafes = signal<Cafe[]>([]);
  isLoading = signal(true);
  searchQuery = signal('');
  filterState = signal<'all' | 'active' | 'inactive'>('all');
  selectedCafe = signal<Cafe | null>(null);
  isRegisterOpen = signal(false);
  isSubmitting = signal(false);
  registerError = signal<string | null>(null);
  editingCafe = signal<Cafe | null>(null);
  isUpdating = signal(false);
  editError = signal<string | null>(null);
  busyCafeId = signal<string | null>(null);
  feedbackMessage = signal<{ type: 'success' | 'error'; text: string } | null>(null);

  filteredCafes = computed(() => {
    let list = this.cafes();

    if (this.filterState() === 'active') {
      list = list.filter((c) => c.state);
    } else if (this.filterState() === 'inactive') {
      list = list.filter((c) => !c.state);
    }

    const query = this.searchQuery().toLowerCase().trim();
    if (!query) {
      return list;
    }

    return list.filter(
      (cafe) =>
        cafe.name.toLowerCase().includes(query) ||
        cafe.address.toLowerCase().includes(query) ||
        cafe.email.toLowerCase().includes(query)
    );
  });

  activeCafesCount = computed(() => {
    return this.cafes().filter((c) => c.state).length;
  });

  inactiveCafesCount = computed(() => {
    return this.cafes().filter((c) => !c.state).length;
  });

  ngOnInit(): void {
    this.loadCafes();
  }

  loadCafes(): void {
    this.isLoading.set(true);
    this.cafeService.getAll().subscribe({
      next: (data) => {
        this.cafes.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.feedbackMessage.set({
          type: 'error',
          text: 'Ocurrió un error al cargar las cafeterías.',
        });
        this.isLoading.set(false);
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

  openRegister(): void {
    this.registerError.set(null);
    this.isRegisterOpen.set(true);
  }

  closeRegister(): void {
    this.isRegisterOpen.set(false);
    this.registerError.set(null);
  }

  openDetail(cafe: Cafe): void {
    this.selectedCafe.set(cafe);
  }

  closeDetail(): void {
    this.selectedCafe.set(null);
  }

  clearFeedback(): void {
    this.feedbackMessage.set(null);
  }

  openEdit(cafe: Cafe): void {
    this.selectedCafe.set(null);
    this.editError.set(null);
    this.editingCafe.set(cafe);
  }

  closeEdit(): void {
    this.editingCafe.set(null);
    this.editError.set(null);
  }

  onUpdateCafe(request: UpdateCafeRequest): void {
    const cafe = this.editingCafe();
    if (!cafe) {
      return;
    }
    this.isUpdating.set(true);
    this.editError.set(null);

    this.cafeService.update(cafe.externalId, request).subscribe({
      next: (updated) => {
        this.isUpdating.set(false);
        this.replaceCafe(updated);
        this.closeEdit();
        this.feedbackMessage.set({ type: 'success', text: `Guardaste los cambios de "${updated.name}".` });
      },
      error: (error: unknown) => {
        this.isUpdating.set(false);
        this.editError.set(toCafeAdminErrorMessage(error, 'No se pudieron guardar los cambios. Probá de nuevo.'));
      },
    });
  }

  onDeactivateCafe(cafe: Cafe): void {
    this.busyCafeId.set(cafe.externalId);
    this.cafeService.deactivate(cafe.externalId).subscribe({
      next: () => {
        this.busyCafeId.set(null);
        this.replaceCafe({ ...cafe, state: false, openNow: false });
        this.feedbackMessage.set({
          type: 'success',
          text: `Desactivaste "${cafe.name}": ya no aparece para los clientes y no puede iniciar sesión.`,
        });
      },
      error: (error: unknown) => {
        this.busyCafeId.set(null);
        this.feedbackMessage.set({
          type: 'error',
          text: toCafeAdminErrorMessage(error, `No se pudo desactivar "${cafe.name}". Probá de nuevo.`),
        });
      },
    });
  }

  onReactivateCafe(cafe: Cafe): void {
    this.busyCafeId.set(cafe.externalId);
    this.cafeService.reactivate(cafe.externalId).subscribe({
      next: (reactivated) => {
        this.busyCafeId.set(null);
        this.replaceCafe(reactivated);
        this.feedbackMessage.set({
          type: 'success',
          text: `Reactivaste "${cafe.name}": vuelve a aparecer para los clientes y puede iniciar sesión.`,
        });
      },
      error: (error: unknown) => {
        this.busyCafeId.set(null);
        this.feedbackMessage.set({
          type: 'error',
          text: toCafeAdminErrorMessage(error, `No se pudo reactivar "${cafe.name}". Probá de nuevo.`),
        });
      },
    });
  }

  private replaceCafe(updated: Cafe): void {
    this.cafes.update((list) => list.map((cafe) => (cafe.externalId === updated.externalId ? updated : cafe)));
    if (this.selectedCafe()?.externalId === updated.externalId) {
      this.selectedCafe.set(updated);
    }
  }

  onRegisterCafe(request: CreateCafeAccountRequest): void {
    this.isSubmitting.set(true);
    this.registerError.set(null);

    this.cafeService.register(request).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.closeRegister();
        this.feedbackMessage.set({
          type: 'success',
          text: `Cafetería "${request.name}" registrada con éxito.`,
        });
        this.loadCafes();
      },
      error: (error: HttpErrorResponse) => {
        this.isSubmitting.set(false);
        let errorMsg =
          'No se pudo registrar la cafetería. Verificá que los datos sean correctos.';

        if (error.status === 409) {
          errorMsg = 'Ya existe una cuenta registrada con ese correo.';
        } else if (error.status === 400) {
          const errors = error.error?.errors;
          const firstMessage =
            errors && typeof errors === 'object' ? Object.values(errors)[0] : null;
          errorMsg =
            typeof firstMessage === 'string' ? firstMessage : 'Revisá los datos ingresados.';
        }

        this.registerError.set(errorMsg);
      },
    });
  }
}
