import { CurrencyPipe } from '@angular/common';
import { Component, HostListener, computed, input, output } from '@angular/core';
import { Icon } from '../../../../shared/components/icon/icon';
import { Product } from '../../model/product.model';

@Component({
  selector: 'app-product-detail-modal',
  imports: [CurrencyPipe, Icon],
  templateUrl: './product-detail-modal.html',
})
export class ProductDetailModal {
  readonly product = input.required<Product>();
  readonly closed = output<void>();
  readonly addToOrder = output<Product>();

  pointsToEarn = computed(() => {
    return this.product().awardedPoints ?? 0;
  });

  hasPoints = computed(() => {
    return this.pointsToEarn() > 0;
  });

  onClose(): void {
    this.closed.emit();
  }

  onAddClick(): void {
    this.addToOrder.emit(this.product());
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.onClose();
  }
}
