import { inject, Injectable, signal } from '@angular/core';
import { CafeProfile, UpdateCafeProfileInput } from '../types/cafe-profile.model';
import { CafeProfileRepository } from './cafe-profile.repository';

export type CafeProfileStatus = 'loading' | 'ready' | 'saving' | 'error';

@Injectable()
export class CafeProfileStore {
  private readonly repository = inject(CafeProfileRepository);

  readonly profile = signal<CafeProfile | null>(null);
  readonly status = signal<CafeProfileStatus>('loading');
  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);
  readonly isEditing = signal<boolean>(false);

  constructor() {
    this.loadProfile();
  }

  loadProfile(externalId?: string): void {
    this.status.set('loading');
    this.errorMessage.set(null);

    this.repository.getProfile(externalId).subscribe({
      next: (profile) => {
        this.profile.set(profile);
        this.status.set('ready');
      },
      error: () => {
        this.status.set('error');
        this.errorMessage.set('No se pudieron cargar los datos de la cafetería.');
      },
    });
  }

  saveProfile(input: UpdateCafeProfileInput): void {
    const current = this.profile();
    if (!current) {
      return;
    }

    this.status.set('saving');
    this.errorMessage.set(null);

    this.repository.updateProfile(current.id, input).subscribe({
      next: (updatedProfile) => {
        this.profile.set(updatedProfile);
        this.status.set('ready');
        this.isEditing.set(false);
        this.successMessage.set('¡Los datos del comercio se guardaron correctamente!');
      },
      error: () => {
        this.status.set('ready');
        this.errorMessage.set('Ocurrió un error al intentar guardar los cambios.');
      },
    });
  }

  startEditing(): void {
    this.isEditing.set(true);
    this.errorMessage.set(null);
  }

  cancelEditing(): void {
    this.isEditing.set(false);
    this.errorMessage.set(null);
  }

  dismissSuccess(): void {
    this.successMessage.set(null);
  }

  dismissError(): void {
    this.errorMessage.set(null);
  }
}
