import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Icon } from '../../../../shared/components/icon/icon';
import { Purchase } from '../../../purchase-history/model/purchase.model';
import { PurchaseService } from '../../../purchase-history/services/purchase.service';
import { RefundPurchase } from '../../../purchase-history/components/refund-purchase/refund-purchase';

@Component({
  selector: 'app-cafe-purchases-page',
  imports: [FormsModule, Icon, RefundPurchase],
  templateUrl: './cafe-purchases-page.html',
  styleUrl: './cafe-purchases-page.css',
  host: { class: 'block' },
})
export class CafePurchasesPage implements OnInit {
  private readonly purchaseService = inject(PurchaseService);

  purchases = signal<Purchase[]>([]);
  isLoading = signal(true);
  hasError = signal(false);
  searchQuery = signal('');
  filterStatus = signal<string>('all');
  dateFrom = signal<string>('');
  dateTo = signal<string>('');
  selectedPurchase = signal<Purchase | null>(null);

  filteredPurchases = computed(() => {
    if (this.dateError()) {
      return [];
    }

    let list = this.purchases();

    if (this.filterStatus() !== 'all') {
      list = list.filter(
        (p) => p.status?.toUpperCase() === this.filterStatus().toUpperCase()
      );
    }

    const from = this.dateFrom();
    if (from) {
      list = list.filter((p) => {
        if (!p.date) return false;
        const purchaseDate = p.date.substring(0, 10);
        return purchaseDate >= from;
      });
    }

    const to = this.dateTo();
    if (to) {
      list = list.filter((p) => {
        if (!p.date) return false;
        const purchaseDate = p.date.substring(0, 10);
        return purchaseDate <= to;
      });
    }

    const query = this.searchQuery().toLowerCase().trim();
    if (query) {
      list = list.filter((p) => {
        const matchClient =
          p.clientName?.toLowerCase().includes(query) ||
          p.clientId?.toLowerCase().includes(query);
        const matchId = p.externalId?.toLowerCase().includes(query);
        const matchItems = p.details?.some((d) =>
          d.productName?.toLowerCase().includes(query)
        );
        return matchClient || matchId || matchItems;
      });
    }

    return [...list].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  });

  dateError = computed(() => {
    if (this.dateFrom() && this.dateTo() && this.dateFrom() > this.dateTo()) {
      return 'La fecha "Desde" no puede ser posterior a "Hasta"';
    }
    return null;
  });

  totalPurchasesCount = computed(() => this.filteredPurchases().length);

  totalAmount = computed(() =>
    this.filteredPurchases().reduce((acc, p) => acc + (p.price || 0), 0)
  );

  deliveredCount = computed(
    () => this.purchases().filter((p) => p.status === 'DELIVERED').length
  );

  hasActiveFilters = computed(
    () =>
      this.searchQuery() !== '' ||
      this.filterStatus() !== 'all' ||
      this.dateFrom() !== '' ||
      this.dateTo() !== '' ||
      this.dateError() !== null
  );

  ngOnInit(): void {
    this.loadPurchases();
  }

  loadPurchases(): void {
    this.isLoading.set(true);
    this.hasError.set(false);

    this.purchaseService.getAll().subscribe({
      next: (data) => {
        this.purchases.set(data);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error al cargar las compras de la cafetería:', error);
        this.hasError.set(true);
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

  setFilterStatus(status: string): void {
    this.filterStatus.set(status);
  }

  onDateFromChange(value: string): void {
    this.dateFrom.set(value);
  }

  onDateToChange(value: string): void {
    this.dateTo.set(value);
  }

  clearFilters(): void {
    this.searchQuery.set('');
    this.filterStatus.set('all');
    this.dateFrom.set('');
    this.dateTo.set('');
  }

  openDetails(purchase: Purchase): void {
    this.selectedPurchase.set(purchase);
  }

  closeDetails(): void {
    this.selectedPurchase.set(null);
  }

  onRefunded(refunded: Purchase): void {
    this.purchases.update((list) => list.map((p) => (p.externalId === refunded.externalId ? refunded : p)));
    this.selectedPurchase.set(refunded);
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  formatPrice(value: number): string {
    if (value === null || value === undefined) return '$ 0';
    return '$ ' + value.toLocaleString('es-AR');
  }

  getStatusBadgeClass(status: string): string {
    switch (status?.toUpperCase()) {
      case 'DELIVERED':
        return 'bg-emerald-50 text-emerald-800 border-emerald-300';
      case 'CONFIRMED':
        return 'bg-blue-50 text-blue-800 border-blue-300';
      case 'IN_PREPARATION':
      case 'READY':
        return 'bg-amber-50 text-amber-800 border-amber-300';
      case 'CANCELLED':
        return 'bg-rose-50 text-rose-800 border-rose-300';
      case 'REFUNDED':
        return 'bg-purple-50 text-purple-800 border-purple-300';
      default:
        return 'bg-neutral-100 text-neutral-800 border-neutral-300';
    }
  }

  getStatusLabel(status: string): string {
    switch (status?.toUpperCase()) {
      case 'DELIVERED':
        return 'Entregada';
      case 'CONFIRMED':
        return 'Confirmada';
      case 'IN_PREPARATION':
        return 'En preparación';
      case 'READY':
        return 'Lista';
      case 'CANCELLED':
        return 'Cancelada';
      case 'REFUNDED':
        return 'Reembolsada';
      default:
        return status || 'Desconocido';
    }
  }
}
