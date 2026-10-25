import { CurrencyPipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Icon } from '../../../../shared/components/icon/icon';
import { Purchase } from '../../model/purchase.model';
import { PurchaseService } from '../../services/purchase.service';
import { PurchaseCard } from '../purchase-card/purchase-card';

@Component({
  selector: 'app-purchase-history',
  imports: [RouterLink, CurrencyPipe, Icon, PurchaseCard],
  templateUrl: './purchase-history.html',
  host: { class: 'block' },
})
export class PurchaseHistory implements OnInit {
  private purchaseService = inject(PurchaseService);

  purchases = signal<Purchase[]>([]);
  isLoading = signal(true);

  sortedPurchases = computed(() => {
    return [...this.purchases()].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  });

  totalSpent = computed(() => {
    return this.purchases().reduce((total, purchase) => total + purchase.price, 0);
  });

  totalPoints = computed(() => {
    return this.purchases().reduce(
      (total, purchase) =>
        total + purchase.details.reduce((sum, detail) => sum + detail.generatedPoints, 0),
      0
    );
  });

  ngOnInit(): void {
    this.purchaseService.getMyPurchases().subscribe({
      next: (data) => {
        this.purchases.set(data);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('error loading purchases:', error);
        this.isLoading.set(false);
      },
    });
  }
}
