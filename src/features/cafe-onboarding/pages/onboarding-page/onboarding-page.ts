import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Icon } from '../../../../shared/components/icon/icon';
import { OpeningHoursEditor } from '../../../../shared/components/opening-hours-editor/opening-hours-editor';
import { ThemeToggle } from '../../../../shared/components/theme-toggle/theme-toggle';
import { backendErrorMessage } from '../../../../shared/utils/backend-error';
import {
  DAY_LABELS,
  formatOpeningHours,
  hasValidOpeningHours,
  OpeningHours,
} from '../../../../shared/utils/opening-hours';
import { LogoutButton } from '../../../auth/components/logout-button/logout-button';
import { CafeProfileRepository } from '../../../cafe-profile/services/cafe-profile.repository';
import { CafeProfile } from '../../../cafe-profile/types/cafe-profile.model';

export const ONBOARDING_STEPS = ['Contacto', 'Horarios', 'Imágenes', 'Confirmar'] as const;

const PHONE_PATTERN = /^\d{10}$/;

@Component({
  selector: 'app-onboarding-page',
  imports: [Icon, OpeningHoursEditor, ThemeToggle, LogoutButton],
  templateUrl: './onboarding-page.html',
  host: { class: 'block min-h-dvh bg-bg text-text' },
})
export class OnboardingPage implements OnInit {
  private readonly repository = inject(CafeProfileRepository);
  private readonly router = inject(Router);

  readonly steps = ONBOARDING_STEPS;
  readonly dayLabels = DAY_LABELS;

  readonly profile = signal<CafeProfile | null>(null);
  readonly status = signal<'loading' | 'ready' | 'saving' | 'error'>('loading');
  readonly errorMessage = signal<string | null>(null);
  readonly step = signal(0);
  readonly attempted = signal(false);

  readonly address = signal('');
  readonly phoneNumber = signal('');
  readonly description = signal('');
  readonly openingHours = signal<OpeningHours[]>([]);
  readonly logo = signal('');
  readonly image = signal('');

  readonly addressError = computed(() => (this.address().trim() ? null : 'La dirección es obligatoria.'));
  readonly phoneError = computed(() =>
    PHONE_PATTERN.test(this.phoneNumber().trim()) ? null : 'Ingresá los 10 dígitos del teléfono.',
  );
  readonly hoursError = computed(() =>
    hasValidOpeningHours(this.openingHours()) ? null : 'Cargá al menos un día con un horario válido.',
  );
  readonly logoError = computed(() => (this.logo().trim() ? null : 'El logo es obligatorio.'));
  readonly imageError = computed(() => (this.image().trim() ? null : 'La portada es obligatoria.'));

  readonly hoursSummary = computed(() => formatOpeningHours(this.openingHours()));
  readonly isLastStep = computed(() => this.step() === this.steps.length - 1);

  readonly stepIsValid = computed(() => {
    switch (this.step()) {
      case 0:
        return !this.addressError() && !this.phoneError();
      case 1:
        return !this.hoursError();
      case 2:
        return !this.logoError() && !this.imageError();
      default:
        return true;
    }
  });

  ngOnInit(): void {
    this.repository.getProfile().subscribe({
      next: (profile) => this.start(profile),
      error: () => this.status.set('error'),
    });
  }

  next(): void {
    this.attempted.set(true);
    if (!this.stepIsValid()) {
      return;
    }
    this.attempted.set(false);
    this.step.update((current) => Math.min(current + 1, this.steps.length - 1));
  }

  back(): void {
    this.attempted.set(false);
    this.step.update((current) => Math.max(current - 1, 0));
  }

  finish(): void {
    const profile = this.profile();
    if (!profile || this.status() === 'saving') {
      return;
    }
    this.status.set('saving');
    this.errorMessage.set(null);
    this.repository
      .updateProfile(profile.id, {
        address: this.address(),
        phoneNumber: this.phoneNumber(),
        description: this.description(),
        logo: this.logo(),
        image: this.image(),
        openingHours: this.openingHours(),
      })
      .subscribe({
        next: () => this.router.navigateByUrl('/cafe/dashboard'),
        error: (error) => {
          this.status.set('ready');
          this.errorMessage.set(backendErrorMessage(error) ?? 'No pudimos guardar los datos. Probá de nuevo.');
        },
      });
  }

  private start(profile: CafeProfile): void {
    this.profile.set(profile);
    this.address.set(profile.address);
    this.phoneNumber.set(profile.phoneNumber);
    this.description.set(profile.description);
    this.openingHours.set(profile.openingHours);
    this.logo.set(profile.logo);
    this.image.set(profile.image);
    this.status.set('ready');
  }
}
