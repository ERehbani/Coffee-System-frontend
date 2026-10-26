import { CurrencyPipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Icon } from '../../../../shared/components/icon/icon';
import { Purchase, ReviewFormData } from '../../model/purchase.model';
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
  reviewingPurchaseId = signal<string | null>(null);
  isSubmitting = signal(false);
  reviewError = signal<string | null>(null);
  successMessage = signal<string | null>(null);

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

  openReview(purchaseId: string): void {
    this.reviewingPurchaseId.set(purchaseId);
    this.reviewError.set(null);
    this.successMessage.set(null);
  }

  closeReview(): void {
    this.reviewingPurchaseId.set(null);
    this.reviewError.set(null);
  }

  submitReview(purchase: Purchase, data: ReviewFormData): void {
    this.isSubmitting.set(true);
    this.reviewError.set(null);

    this.purchaseService
      .createReview({
        cafeId: purchase.cafeId,
        purchaseId: purchase.externalId,
        rating: data.rating,
        message: data.message,
      })
      .subscribe({
        next: () => {
          this.purchases.update((list) =>
            list.map((p) => (p.externalId === purchase.externalId ? { ...p, reviewed: true } : p))
          );
          this.isSubmitting.set(false);
          this.reviewingPurchaseId.set(null);
          this.successMessage.set(`¡Gracias! Tu reseña de ${purchase.cafeName} fue enviada.`);
        },
        error: (error) => {
          console.error('error sending review:', error);
          this.isSubmitting.set(false);
          this.reviewError.set('No pudimos enviar tu reseña. Intentá de nuevo.');
        },
      });
  }

  dismissSuccess(): void {
    this.successMessage.set(null);
  }
}
