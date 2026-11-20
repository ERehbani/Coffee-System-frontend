import { Component, computed, input, output } from '@angular/core';
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
  // The edit form passes the images it is editing so the header previews them before they are saved.
  readonly coverUrl = input<string | null>(null);
  readonly logoUrl = input<string | null>(null);
  readonly editClicked = output<void>();

  protected readonly cover = computed(() => this.coverUrl() ?? this.profile().image);
  protected readonly logo = computed(() => this.logoUrl() ?? this.profile().logo);
}
