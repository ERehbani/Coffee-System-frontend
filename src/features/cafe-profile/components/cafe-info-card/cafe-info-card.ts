import { Component, input } from '@angular/core';
import { DAY_LABELS } from '../../../../shared/utils/opening-hours';
import { CafeProfile } from '../../types/cafe-profile.model';

@Component({
  selector: 'app-cafe-info-card',
  imports: [],
  templateUrl: './cafe-info-card.html',
  host: { class: 'block' },
})
export class CafeInfoCard {
  readonly profile = input.required<CafeProfile>();
  readonly dayLabels = DAY_LABELS;
}
