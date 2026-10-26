import { computed, inject, Injectable, signal } from '@angular/core';
import {
  BENEFIT_FORMAT_CODES,
  BenefitFormat,
  BenefitFormatFormErrors,
  SaveBenefitFormatInput,
} from '../types/benefit-format.model';
import { toBenefitFormatFormErrors } from '../utils/benefit-format-error';
import { sortBenefitFormats } from '../utils/benefit-format.mapper';
import { BenefitFormatRepository } from './benefit-format.repository';

export type BenefitFormatListStatus = 'loading' | 'ready' | 'error';
export type BenefitFormatDrawerMode = 'create' | 'edit';

@Injectable()
export class AdminBenefitFormatStore {
  private readonly repository = inject(BenefitFormatRepository);

  readonly formats = signal<readonly BenefitFormat[]>([]);
  readonly status = signal<BenefitFormatListStatus>('loading');
  readonly isProcessing = signal(false);
  readonly actionMessage = signal<{ type: 'success' | 'error'; text: string } | null>(null);
  readonly formErrors = signal<BenefitFormatFormErrors>({});

  readonly isDrawerOpen = signal(false);
  readonly drawerMode = signal<BenefitFormatDrawerMode>('create');
  readonly editingFormat = signal<BenefitFormat | null>(null);

  readonly isEmpty = computed(() => this.status() === 'ready' && this.formats().length === 0);
  /** The formats that are not in the catalog yet, so the ones a new type can register. */
  readonly availableCodes = computed(() => {
    const registered = new Set(this.formats().map((format) => format.code));
    return BENEFIT_FORMAT_CODES.filter((code) => !registered.has(code));
  });
  /** A new type needs the catalog loaded and at least one format left to register. */
  readonly canCreate = computed(
    () => this.status() === 'ready' && this.availableCodes().length > 0,
  );

  constructor() {
    this.loadFormats();
  }

  loadFormats(): void {
    this.status.set('loading');
    this.repository.getFormats().subscribe({
      next: (formats) => {
        this.formats.set(sortBenefitFormats(formats));
        this.status.set('ready');
      },
      error: () => this.status.set('error'),
    });
  }

  openCreateDrawer(): void {
    if (!this.canCreate()) {
      return;
    }
    this.drawerMode.set('create');
    this.editingFormat.set(null);
    this.formErrors.set({});
    this.isDrawerOpen.set(true);
  }

  openEditDrawer(format: BenefitFormat): void {
    this.drawerMode.set('edit');
    this.editingFormat.set(format);
    this.formErrors.set({});
    this.isDrawerOpen.set(true);
  }

  closeDrawer(): void {
    this.isDrawerOpen.set(false);
    this.editingFormat.set(null);
    this.formErrors.set({});
  }

  saveFormat(input: SaveBenefitFormatInput): void {
    if (this.isProcessing()) {
      return;
    }
    const editing = this.editingFormat();
    const request$ = editing
      ? this.repository.updateFormat(editing.id, input)
      : this.repository.createFormat(input);

    this.isProcessing.set(true);
    this.formErrors.set({});
    request$.subscribe({
      next: (saved) => {
        this.formats.update((formats) =>
          sortBenefitFormats(
            editing
              ? formats.map((format) => (format.id === saved.id ? saved : format))
              : [...formats, saved],
          ),
        );
        this.closeDrawer();
        this.isProcessing.set(false);
        this.actionMessage.set({
          type: 'success',
          text: editing ? 'Tipo de beneficio actualizado.' : 'Tipo de beneficio creado.',
        });
      },
      error: (error: unknown) => {
        this.isProcessing.set(false);
        this.formErrors.set(toBenefitFormatFormErrors(error));
      },
    });
  }

  /** Drops the server error of a field the user is editing. */
  clearFormError(field: keyof BenefitFormatFormErrors): void {
    this.formErrors.update(({ [field]: _removed, ...rest }) => rest);
  }

  dismissActionMessage(): void {
    this.actionMessage.set(null);
  }
}
