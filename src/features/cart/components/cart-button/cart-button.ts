import { CurrencyPipe } from '@angular/common';
import { Component, HostListener, signal } from '@angular/core';
import { Icon } from '../../../../shared/components/icon/icon';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-cart-button',
  imports: [CurrencyPipe, Icon],
  templateUrl: './cart-button.html',
  host: { class: 'block' },
})
export class CartButton {
  isOpen = signal(false);

  constructor(public cartService: CartService) {}

  openCart(): void {
    this.isOpen.set(true);
  }

  closeCart(): void {
    this.isOpen.set(false);
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closeCart();
  }
}
