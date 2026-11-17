import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Icon } from '../../../../shared/components/icon/icon';
import { PURCHASE_STATUSES, Purchase, PurchaseStatus } from '../../../purchase-history/model/purchase.model';
import { PurchaseService } from '../../../purchase-history/services/purchase.service';
import { isCancellation } from '../../../purchase-history/utils/purchase-status';
import { toPurchaseStatusView } from '../../utils/purchase-status-view';

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
  filterStatus = signal<PurchaseStatus | 'all'>('all');
  selectedPurchase = signal<Purchase | null>(null);

  readonly statusFilters = PURCHASE_STATUSES;
  readonly statusView = toPurchaseStatusView;

  filteredPurchases = computed(() => {
    let list = this.purchases();

    const status = this.filterStatus();
    if (status !== 'all') {
      list = list.filter((p) => p.status === status);
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
    () => this.purchases().filter((p) => !isCancellation(p.status)).length
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
        console.error('Error al cargar las compras:', error);
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

  setFilterStatus(status: PurchaseStatus | 'all'): void {
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

}
