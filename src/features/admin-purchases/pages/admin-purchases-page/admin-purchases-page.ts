import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Icon } from '../../../../shared/components/icon/icon';
import { Purchase } from '../../../purchase-history/model/purchase.model';
import { PurchaseService } from '../../../purchase-history/services/purchase.service';

@Component({
  selector: 'app-admin-purchases-page',
  imports: [RouterLink, FormsModule, Icon],
  templateUrl: './admin-purchases-page.html',
  host: { class: 'block' },
})
export class AdminPurchasesPage implements OnInit {
  private purchaseService = inject(PurchaseService);

  purchases = signal<Purchase[]>([]);
  isLoading = signal(true);
  searchQuery = signal('');
  filterStatus = signal<string>('all');
  selectedPurchase = signal<Purchase | null>(null);

  filteredPurchases = computed(() => {
    let list = this.purchases();

    if (this.filterStatus() !== 'all') {
      list = list.filter(
        (p) => p.status?.toUpperCase() === this.filterStatus().toUpperCase()
      );
    }

    const query = this.searchQuery().toLowerCase().trim();
    if (!query) {
      return list;
    }

    return list.filter((p) => {
      const matchCafe = p.cafeName?.toLowerCase().includes(query);
      const matchClient = p.clientName?.toLowerCase().includes(query) || p.clientId?.toLowerCase().includes(query);
      const matchId = p.externalId?.toLowerCase().includes(query);
      const matchItems = p.details?.some((d) => d.productName?.toLowerCase().includes(query));
      return matchCafe || matchClient || matchId || matchItems;
    });
  });

  totalPurchasesCount = computed(() => this.filteredPurchases().length);

  totalAmount = computed(() =>
    this.filteredPurchases().reduce((acc, p) => acc + (p.price || 0), 0)
  );

  confirmedCount = computed(
    () => this.purchases().filter((p) => p.status === 'CONFIRMED').length
  );

  ngOnInit(): void {
    this.loadPurchases();
  }

  loadPurchases(): void {
    this.isLoading.set(true);
    this.purchaseService.getAll().subscribe({
      next: (data) => {
        this.purchases.set(data);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading purchases:', error);
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

  openDetails(purchase: Purchase): void {
    this.selectedPurchase.set(purchase);
  }

  closeDetails(): void {
    this.selectedPurchase.set(null);
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
      case 'CONFIRMED':
        return 'bg-emerald-50 text-emerald-800 border-emerald-300';
      case 'PENDING':
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
      case 'CONFIRMED':
        return 'Confirmada';
      case 'PENDING':
        return 'Pendiente';
      case 'CANCELLED':
        return 'Cancelada';
      case 'REFUNDED':
        return 'Reembolsada';
      default:
        return status || 'Desconocido';
    }
  }
}
