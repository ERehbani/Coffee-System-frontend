import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Icon } from '../../../../shared/components/icon/icon';
import { ProfileEditForm } from '../../components/profile-edit-form/profile-edit-form';
import { ProfileStore } from '../../services/profile.store';
import { UpdateClientProfileInput } from '../../types/profile.model';

@Component({
  selector: 'app-profile-edit-page',
  imports: [RouterLink, Icon, ProfileEditForm],
  templateUrl: './profile-edit-page.html',
  host: { class: 'block' },
})
export class ProfileEditPage {
  protected readonly store = inject(ProfileStore);
  private readonly router = inject(Router);

  protected onSave(input: UpdateClientProfileInput): void {
    this.store.saveProfile(input);
  }

  protected onCancel(): void {
    this.router.navigate(['/profile']);
  }

  protected onDismissSuccess(): void {
    this.store.dismissSuccess();
  }

  protected onDismissError(): void {
    this.store.dismissError();
  }

  protected onReload(): void {
    this.store.reload();
  }
}
