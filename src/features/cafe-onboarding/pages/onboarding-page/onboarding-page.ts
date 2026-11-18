import { CurrencyPipe } from '@angular/common';
import {
  Component,
  ElementRef,
  Injector,
  OnInit,
  afterNextRender,
  computed,
  inject,
  signal,
  viewChildren,
} from '@angular/core';
import { Router } from '@angular/router';
import { Icon } from '../../../../shared/components/icon/icon';
import { ImageInput } from '../../../../shared/components/image-input/image-input';
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
import { BenefitForm } from '../../../cafe-benefits/components/benefit-form/benefit-form';
import {
  BenefitTypeOption,
  CafeBenefit,
  CreateCafeBenefitRequest,
  ProductOption,
  TierOption,
} from '../../../cafe-benefits/model/cafe-benefit.model';
import { CafeBenefitService } from '../../../cafe-benefits/services/cafe-benefit.service';
import { CafeProfileRepository } from '../../../cafe-profile/services/cafe-profile.repository';
import { CafeProfile } from '../../../cafe-profile/types/cafe-profile.model';
import { ProductForm } from '../../../cafe-products/components/product-form/product-form';
import { ProductService } from '../../../catalog/services/product.service';
import { CategoryOption, CreateProductRequest, ProductDto } from '../../../catalog/types/product.dto';

export const ONBOARDING_STEPS = [
  { id: 'cafe', label: 'Tu cafetería', optional: false },
  { id: 'hours', label: 'Horarios', optional: false },
  { id: 'products', label: 'Primeros productos', optional: true },
  { id: 'benefit', label: 'Primer beneficio', optional: true },
  { id: 'done', label: '¡Listo!', optional: false },
] as const;

const PHONE_PATTERN = /^\d{10}$/;

@Component({
  selector: 'app-onboarding-page',
  imports: [CurrencyPipe, Icon, ImageInput, OpeningHoursEditor, ThemeToggle, LogoutButton, ProductForm, BenefitForm],
  templateUrl: './onboarding-page.html',
  styleUrl: './onboarding-page.css',
  host: { class: 'block min-h-dvh bg-bg text-text' },
})
export class OnboardingPage implements OnInit {
  private readonly repository = inject(CafeProfileRepository);
  private readonly router = inject(Router);
  private readonly productService = inject(ProductService);
  private readonly benefitService = inject(CafeBenefitService);
  private readonly injector = inject(Injector);
  private readonly stepHeadings = viewChildren<ElementRef<HTMLElement>>('stepHeading');

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
  readonly logoUploading = signal(false);
  readonly imageUploading = signal(false);
  readonly uploading = computed(() => this.logoUploading() || this.imageUploading());

  readonly categories = signal<CategoryOption[]>([]);
  readonly products = signal<ProductDto[]>([]);
  readonly showProductForm = signal(false);
  readonly productSaving = signal(false);
  readonly productError = signal<string | null>(null);

  readonly benefitTypes = signal<BenefitTypeOption[]>([]);
  readonly tiers = signal<TierOption[]>([]);
  readonly benefit = signal<CafeBenefit | null>(null);
  readonly showBenefitForm = signal(false);
  readonly benefitSaving = signal(false);
  readonly benefitError = signal<string | null>(null);
  readonly productOptions = computed<ProductOption[]>(() =>
    this.products().map((product) => ({ id: product.externalId, name: product.name })),
  );

  readonly addressError = computed(() => (this.address().trim() ? null : 'La dirección es obligatoria.'));
  readonly phoneError = computed(() =>
    PHONE_PATTERN.test(this.phoneNumber().trim()) ? null : 'Ingresá los 10 dígitos del teléfono.',
  );
  readonly hoursError = computed(() =>
    hasValidOpeningHours(this.openingHours()) ? null : 'Cargá al menos un día con un horario válido.',
  );

  readonly hoursSummary = computed(() => formatOpeningHours(this.openingHours()));
  readonly currentStep = computed(() => this.steps[this.step()]);
  readonly isLastStep = computed(() => this.step() === this.steps.length - 1);

  readonly stepIsValid = computed(() => {
    switch (this.currentStep().id) {
      case 'cafe':
        return !this.addressError() && !this.phoneError();
      case 'hours':
        return !this.hoursError();
      default:
        return true;
    }
  });

  readonly nextLabel = computed(() => {
    switch (this.currentStep().id) {
      case 'hours':
        return this.status() === 'saving' ? 'Guardando…' : 'Guardar y seguir';
      case 'products':
        return this.products().length > 0 ? 'Continuar' : 'Saltear';
      case 'benefit':
        return this.benefit() ? 'Continuar' : 'Saltear';
      case 'done':
        return 'Entrar al panel';
      default:
        return 'Siguiente';
    }
  });

  ngOnInit(): void {
    this.repository.getProfile().subscribe({
      next: (profile) => this.start(profile),
      error: () => this.status.set('error'),
    });
    this.productService.getCategories().subscribe({
      next: (categories) => this.categories.set(categories),
      error: () => this.productError.set('No pudimos cargar las categorías. Recargá la página para intentar de nuevo.'),
    });
    this.benefitService.getBenefitTypes().subscribe({
      next: (types) => this.benefitTypes.set(types),
      error: () => this.benefitError.set('No pudimos cargar los tipos de beneficio. Recargá la página para intentar de nuevo.'),
    });
    this.benefitService.getTiers().subscribe({
      next: (tiers) => this.tiers.set(tiers),
      error: () => this.benefitError.set('No pudimos cargar los niveles de socio. Recargá la página para intentar de nuevo.'),
    });
  }

  next(): void {
    this.attempted.set(true);
    if (!this.stepIsValid()) {
      return;
    }
    this.attempted.set(false);
    // Los datos obligatorios se guardan antes de los pasos opcionales para no dejar la cafetería en onboarding.
    if (this.currentStep().id === 'hours') {
      this.saveProfile();
      return;
    }
    this.goTo(this.step() + 1);
  }

  back(): void {
    this.attempted.set(false);
    this.goTo(this.step() - 1);
  }

  openProductForm(): void {
    this.productError.set(null);
    this.showProductForm.set(true);
  }

  createProduct({ request }: { request: CreateProductRequest }): void {
    const profile = this.profile();
    if (!profile || this.productSaving()) {
      return;
    }
    this.productSaving.set(true);
    this.productError.set(null);
    this.productService.create(profile.id, request).subscribe({
      next: (product) => {
        this.products.update((list) => [...list, product]);
        this.productSaving.set(false);
        this.showProductForm.set(false);
      },
      error: (error) => {
        this.productSaving.set(false);
        this.productError.set(backendErrorMessage(error) ?? 'No pudimos crear el producto. Probá de nuevo.');
      },
    });
  }

  openBenefitForm(): void {
    this.benefitError.set(null);
    this.showBenefitForm.set(true);
  }

  createBenefit(request: CreateCafeBenefitRequest): void {
    if (this.benefitSaving()) {
      return;
    }
    this.benefitSaving.set(true);
    this.benefitError.set(null);
    this.benefitService.create(request).subscribe({
      next: ({ benefit, publishError }) => {
        this.benefit.set(benefit);
        this.benefitSaving.set(false);
        this.showBenefitForm.set(false);
        if (publishError) {
          const reason = backendErrorMessage(publishError);
          this.benefitError.set(`El beneficio se guardó, pero no se publicó.${reason ? ` ${reason}` : ''}`);
        }
      },
      error: (error) => {
        this.benefitSaving.set(false);
        this.benefitError.set(backendErrorMessage(error) ?? 'No pudimos crear el beneficio. Probá de nuevo.');
      },
    });
  }

  finish(): void {
    this.router.navigateByUrl('/cafe/dashboard');
  }

  private saveProfile(): void {
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
        next: () => {
          this.status.set('ready');
          this.goTo(this.step() + 1);
        },
        error: (error) => {
          this.status.set('ready');
          this.errorMessage.set(backendErrorMessage(error) ?? 'No pudimos guardar los datos. Probá de nuevo.');
        },
      });
  }

  private goTo(index: number): void {
    const target = Math.min(Math.max(index, 0), this.steps.length - 1);
    this.step.set(target);
    // El título recibe el foco cuando el render quita inert; preventScroll evita que la diapositiva salte.
    afterNextRender(() => this.stepHeadings()[target]?.nativeElement.focus({ preventScroll: true }), {
      injector: this.injector,
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
