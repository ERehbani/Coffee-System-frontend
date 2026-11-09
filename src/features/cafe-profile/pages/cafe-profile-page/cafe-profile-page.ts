import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Icon } from '../../../../shared/components/icon/icon';
import { LogoutButton } from '../../../auth/components/logout-button/logout-button';
import { AuthService } from '../../../auth/services/auth.service';
import { CafeEditForm } from '../../components/cafe-edit-form/cafe-edit-form';
import { CafeHeader } from '../../components/cafe-header/cafe-header';
import { CafeInfoCard } from '../../components/cafe-info-card/cafe-info-card';
import { CafeProfileStore } from '../../services/cafe-profile.store';
import { UpdateCafeProfileInput } from '../../types/cafe-profile.model';

@Component({
  selector: 'app-cafe-profile-page',
  imports: [RouterLink, Icon, CafeHeader, CafeInfoCard, CafeEditForm, LogoutButton],
  templateUrl: './cafe-profile-page.html',
  host: { class: 'block' },
})
export class CafeProfilePage {
  private readonly auth = inject(AuthService);

  protected readonly store = inject(CafeProfileStore);
  protected readonly canOpenClientView = computed(() => this.auth.hasRole('ROLE_CLIENTE'));

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
