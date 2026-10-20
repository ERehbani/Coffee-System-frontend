import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Icon } from '../../../../shared/components/icon/icon';
import { CafeEditForm } from '../../components/cafe-edit-form/cafe-edit-form';
import { CafeHeader } from '../../components/cafe-header/cafe-header';
import { CafeInfoCard } from '../../components/cafe-info-card/cafe-info-card';
import { CafeProfileStore } from '../../services/cafe-profile.store';
import { UpdateCafeProfileInput } from '../../types/cafe-profile.model';

@Component({
  selector: 'app-cafe-profile-page',
  imports: [RouterLink, Icon, CafeHeader, CafeInfoCard, CafeEditForm],
  templateUrl: './cafe-profile-page.html',
  host: { class: 'block' },
})
export class CafeProfilePage {
  protected readonly store = inject(CafeProfileStore);

  protected onStartEdit(): void {
    this.store.startEditing();
  }

  protected onCancelEdit(): void {
    this.store.cancelEditing();
  }

  protected onSave(input: UpdateCafeProfileInput): void {
    this.store.saveProfile(input);
  }

  protected onDismissSuccess(): void {
    this.store.dismissSuccess();
  }

  protected onDismissError(): void {
    this.store.dismissError();
  }

  protected onReload(): void {
    this.store.loadProfile();
  }
}
