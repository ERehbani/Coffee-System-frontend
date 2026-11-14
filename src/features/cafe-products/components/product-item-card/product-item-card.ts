import { DecimalPipe } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { Icon } from '../../../../shared/components/icon/icon';
import { ProductDto } from '../../../catalog/types/product.dto';

@Component({
  selector: 'app-product-item-card',
  imports: [DecimalPipe, Icon],
  templateUrl: './product-item-card.html',
  styleUrl: './product-item-card.css',
  host: { class: 'block h-full' },
})
export class ProductItemCard {
  readonly product = input.required<ProductDto>();

  readonly edit = output<ProductDto>();
  readonly delete = output<ProductDto>();
  readonly activate = output<ProductDto>();

  onEdit(): void {
    this.edit.emit(this.product());
  }

  onDelete(): void {
    this.delete.emit(this.product());
  }

  onActivate(): void {
    this.activate.emit(this.product());
  }
}
