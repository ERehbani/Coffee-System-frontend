import { CurrencyPipe } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { Icon } from '../../../../shared/components/icon/icon';
import { Product } from '../../model/product.model';

@Component({
  selector: 'app-product-card',
  imports: [CurrencyPipe, Icon],
  templateUrl: './product-card.html',
  host: { class: 'block h-full' },
})
export class ProductCard {
  readonly product = input.required<Product>();
  readonly addToOrder = output<Product>();

  onAddClick(): void {
    this.addToOrder.emit(this.product());
  }
}
