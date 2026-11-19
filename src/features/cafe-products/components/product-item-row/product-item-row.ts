import { DecimalPipe } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { Icon } from '../../../../shared/components/icon/icon';
import { ProductDto } from '../../../catalog/types/product.dto';

@Component({
  selector: 'tr[app-product-item-row]',
  imports: [DecimalPipe, Icon],
  templateUrl: './product-item-row.html',
})
export class ProductItemRow {
  readonly product = input.required<ProductDto>();

  readonly edit = output<ProductDto>();
  readonly delete = output<ProductDto>();
  readonly activate = output<ProductDto>();
  readonly toggleAvailability = output<ProductDto>();

  onEdit(): void {
    this.edit.emit(this.product());
  }

  onDelete(): void {
    this.delete.emit(this.product());
  }

  onActivate(): void {
    this.activate.emit(this.product());
  }

  onToggleAvailability(): void {
    this.toggleAvailability.emit(this.product());
  }
}
