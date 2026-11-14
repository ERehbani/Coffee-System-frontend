import { CurrencyPipe } from '@angular/common';
import { Component, HostListener, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Icon } from '../../../../shared/components/icon/icon';
import { CHECKOUT_PATH } from '../../../checkout/utils/checkout-paths';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-cart-button',
  imports: [CurrencyPipe, Icon],
  templateUrl: './cart-button.html',
  styleUrl: './cart-button.css',
  host: { class: 'block' },
})
export class CartButton {
  readonly cartService = inject(CartService);
  private readonly router = inject(Router);

  isOpen = signal(false);
  productToRemove = signal<string | null>(null);

  canCheckout = computed(() => {
    return this.cartService.totalItems() > 0;
  });

  itemsLabel = computed(() => {
    return this.cartService.totalItems() === 1 ? 'producto' : 'productos';
  });

  openCart(): void {
    this.isOpen.set(true);
  }

  closeCart(): void {
    this.isOpen.set(false);
    this.productToRemove.set(null);
  }

  increase(productId: string): void {
    this.cartService.increaseQuantity(productId);
  }

  decrease(productId: string): void {
    this.cartService.decreaseQuantity(productId);
  }

  askRemove(productId: string): void {
    this.productToRemove.set(productId);
  }

  cancelRemove(): void {
    this.productToRemove.set(null);
  }

  confirmRemove(productId: string): void {
    this.cartService.removeProduct(productId);
    this.productToRemove.set(null);
  }

  goToCheckout(): void {
    if (!this.canCheckout()) {
      return;
    }

    this.closeCart();
    this.router.navigateByUrl(CHECKOUT_PATH);
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closeCart();
  }
}
