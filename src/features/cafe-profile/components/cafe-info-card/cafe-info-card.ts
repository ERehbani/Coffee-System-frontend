import { Component, computed, input } from '@angular/core';
import { Icon } from '../../../../shared/components/icon/icon';
import { DAY_LABELS, hoursOfToday } from '../../../../shared/utils/opening-hours';
import { CafeProfile } from '../../types/cafe-profile.model';

@Component({
  selector: 'app-cafe-info-card',
  imports: [Icon],
  templateUrl: './cafe-info-card.html',
  host: { class: 'block' },
})
export class CafeInfoCard {
  readonly profile = input.required<CafeProfile>();
  readonly dayLabels = DAY_LABELS;
  protected readonly todayHours = computed(() => hoursOfToday(this.profile().openingHours));
}
