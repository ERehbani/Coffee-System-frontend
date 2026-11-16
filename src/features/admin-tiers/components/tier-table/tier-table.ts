import { Component, input, output } from '@angular/core';
import { Icon } from '../../../../shared/components/icon/icon';
import { Tier } from '../../types/tier.model';

const POINTS_FORMAT = new Intl.NumberFormat('es-AR');

@Component({
  imports: [Icon],
  selector: 'app-tier-table',
  templateUrl: './tier-table.html',
  host: { class: 'block' },
})
export class TierTable {
  readonly tiers = input.required<readonly Tier[]>();
  /** Id of the tier every client starts on; it is marked in the list. */
  readonly baseTierId = input<string | null>(null);

  readonly edit = output<Tier>();

  protected formatPoints(points: number): string {
    return POINTS_FORMAT.format(points);
  }
}
