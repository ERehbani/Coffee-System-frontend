import { Component, input, output } from '@angular/core';
import { Icon } from '../../../../shared/components/icon/icon';
import { Cafe } from '../../model/cafe.model';

@Component({
  selector: 'app-cafe-card',
  imports: [Icon],
  templateUrl: './cafe-card.html',
  host: { class: 'block' },
})
export class CafeCard {
  readonly cafe = input.required<Cafe>();
  readonly isSelected = input<boolean>(false);
  readonly select = output<Cafe>();

  onCardClick(): void {
    this.select.emit(this.cafe());
  }
}
