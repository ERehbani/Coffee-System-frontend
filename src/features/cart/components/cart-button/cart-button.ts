import { CurrencyPipe } from '@angular/common';
import { Component, HostListener, inject, signal } from '@angular/core';
import { Icon } from '../../../../shared/components/icon/icon';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-cart-button',
  imports: [CurrencyPipe, Icon],
  templateUrl: './cart-button.html',
  host: { class: 'block' },
})
export class CartButton {
  readonly cartService = inject(CartService);

  isOpen = signal(false);
  productToRemove = signal<string | null>(null);

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

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closeCart();
  }
}
