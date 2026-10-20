import { Component, input } from '@angular/core';
import { Icon } from '../../../../shared/components/icon/icon';
import { CafeProfile } from '../../types/cafe-profile.model';

@Component({
  selector: 'app-cafe-info-card',
  imports: [Icon],
  templateUrl: './cafe-info-card.html',
  host: { class: 'block' },
})
export class CafeInfoCard {
  readonly profile = input.required<CafeProfile>();
}
