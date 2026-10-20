import { Component, input, output } from '@angular/core';
import { Icon } from '../../../../shared/components/icon/icon';
import { CafeProfile } from '../../types/cafe-profile.model';

@Component({
  selector: 'app-cafe-header',
  imports: [Icon],
  templateUrl: './cafe-header.html',
  host: { class: 'block' },
})
export class CafeHeader {
  readonly profile = input.required<CafeProfile>();
  readonly isEditing = input<boolean>(false);
  readonly editClicked = output<void>();
}
