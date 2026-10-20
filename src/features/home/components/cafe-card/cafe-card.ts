import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Icon } from '../../../../shared/components/icon/icon';
import { Cafe } from '../../model/cafe.model';

@Component({
  selector: 'app-cafe-card',
  imports: [RouterLink, Icon],
  templateUrl: './cafe-card.html',
  host: { class: 'block h-full' },
})
export class CafeCard {
  readonly cafe = input.required<Cafe>();
}
