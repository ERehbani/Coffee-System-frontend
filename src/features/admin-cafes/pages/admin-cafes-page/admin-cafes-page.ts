import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Icon } from '../../../../shared/components/icon/icon';
import { Cafe, CreateCafeAccountRequest } from '../../../home/model/cafe.model';
import { CafeService } from '../../../home/services/cafe.service';
import { CafeDetailModal } from '../../components/cafe-detail-modal/cafe-detail-modal';
import { CafeRegisterModal } from '../../components/cafe-register-modal/cafe-register-modal';

@Component({
  selector: 'app-admin-cafes-page',
  imports: [RouterLink, Icon, CafeDetailModal, CafeRegisterModal],
  templateUrl: './admin-cafes-page.html',
  styleUrl: './admin-cafes-page.css',
  host: { class: 'block' },
})
export class AdminCafesPage implements OnInit {
  private readonly cafeService = inject(CafeService);

  cafes = signal<Cafe[]>([]);
  isLoading = signal(true);
  searchQuery = signal('');
  filterState = signal<'all' | 'active' | 'inactive'>('all');
  selectedCafe = signal<Cafe | null>(null);
  isRegisterOpen = signal(false);
  isSubmitting = signal(false);
  registerError = signal<string | null>(null);
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
      error: (error) => {
        this.isSubmitting.set(false);
        const errorMsg =
          error?.error?.message ||
          'No se pudo registrar la cafetería. Verificá que los datos sean correctos.';
        this.registerError.set(errorMsg);
      },
    });
  }
}
