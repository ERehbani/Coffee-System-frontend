import { DOCUMENT } from '@angular/common';
import {
  afterNextRender,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  input,
  linkedSignal,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Icon } from '../../../../shared/components/icon/icon';
import {
  BenefitFormat,
  BenefitFormatCode,
  BenefitFormatFormErrors,
  SaveBenefitFormatInput,
} from '../../types/benefit-format.model';
import { benefitFormatLabel } from '../../utils/benefit-format-labels';

const NAME_MAX_LENGTH = 40;
const DESCRIPTION_MAX_LENGTH = 200;
const FOCUSABLE =
  'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled])';

/** Whether the element is on the page and can take the focus. */
function isFocusable(element: HTMLElement | null): element is HTMLElement {
  return element !== null && element.isConnected && !(element as HTMLButtonElement).disabled;
}

type EditableField = 'code' | 'displayName' | 'description';

@Component({
  imports: [FormsModule, Icon],
  selector: 'app-benefit-format-drawer',
  templateUrl: './benefit-format-drawer.html',
  host: { '(document:keydown.escape)': 'onEscape()' },
})
export class BenefitFormatDrawer {
  /** The format being edited; `null` to register one. */
  readonly format = input<BenefitFormat | null>(null);
  /** The formats a new type can register: the ones not yet in the catalog. */
  readonly availableCodes = input.required<readonly BenefitFormatCode[]>();
  readonly isProcessing = input(false);
  /** Errors the server answered the last save with. */
  readonly errors = input<BenefitFormatFormErrors>({});
  /** The button that opened the drawer; it gets the focus back when the drawer goes away. */
  readonly returnFocusTo = input<HTMLElement | null>(null);
  /** Gets the focus instead when that button is gone or disabled by the very change that closed the drawer. */
  readonly fallbackFocus = input<HTMLElement | null>(null);

  readonly save = output<SaveBenefitFormatInput>();
  readonly cancel = output<void>();
  /** Fires when the user edits a field, so its server error can be dropped. */
  readonly fieldEdited = output<EditableField>();

  protected readonly nameMaxLength = NAME_MAX_LENGTH;
  protected readonly descriptionMaxLength = DESCRIPTION_MAX_LENGTH;
  protected readonly formatLabel = benefitFormatLabel;

  protected readonly code = linkedSignal<BenefitFormatCode | ''>(() => this.format()?.code ?? '');
  protected readonly displayName = linkedSignal(() => this.format()?.displayName ?? '');
  protected readonly description = linkedSignal(() => this.format()?.description ?? '');
  protected readonly active = linkedSignal(() => this.format()?.active ?? true);
  protected readonly submitted = signal(false);

  protected readonly title = computed(() => (this.format() ? 'Editar tipo' : 'Nuevo tipo'));

  /** Deactivating a type that benefits already use does not touch them; it only stops new ones. */
  protected readonly showInactiveNote = computed(() => {
    const format = this.format();
    return format !== null && format.usageCount > 0 && !this.active();
  });

  /** Characters that count against the limit: the text is trimmed before it is validated. */
  protected readonly descriptionLength = computed(() => this.description().trim().length);

  protected readonly descriptionTooLong = computed(
    () => this.descriptionLength() > DESCRIPTION_MAX_LENGTH,
  );

  private readonly clientCodeError = computed(() =>
    this.format() || this.code() ? null : 'Elige un formato.',
  );

  private readonly clientNameError = computed(() => {
    const name = this.displayName().trim();
    if (!name) {
      return 'El nombre es obligatorio.';
    }
    return name.length > NAME_MAX_LENGTH ? 'El nombre puede tener hasta 40 caracteres.' : null;
  });

  private readonly clientDescriptionError = computed(() => {
    if (this.descriptionLength() === 0) {
      return 'La descripción es obligatoria.';
    }
    return this.descriptionLength() > DESCRIPTION_MAX_LENGTH
      ? 'La descripción puede tener hasta 200 caracteres.'
      : null;
  });

  protected readonly codeError = computed(
    () => this.errors().code ?? (this.submitted() ? this.clientCodeError() : null),
  );
  protected readonly nameError = computed(
    () => this.errors().displayName ?? (this.submitted() ? this.clientNameError() : null),
  );
  protected readonly descriptionError = computed(
    () => this.errors().description ?? (this.submitted() ? this.clientDescriptionError() : null),
  );

  private readonly panel = viewChild.required<ElementRef<HTMLElement>>('panel');

  private readonly document = inject(DOCUMENT);

  constructor() {
    afterNextRender(() =>
      this.panel().nativeElement.querySelector<HTMLElement>('[data-autofocus]')?.focus(),
    );
    inject(DestroyRef).onDestroy(() => {
      const target = [this.returnFocusTo(), this.fallbackFocus()].find(isFocusable);
      target?.focus();
    });
  }

  protected onCodeChange(value: BenefitFormatCode | ''): void {
    this.code.set(value);
    this.fieldEdited.emit('code');
  }

  protected onNameChange(value: string): void {
    this.displayName.set(value);
    this.fieldEdited.emit('displayName');
  }

  protected onDescriptionChange(value: string): void {
    this.description.set(value);
    this.fieldEdited.emit('description');
  }

  protected onSubmit(event: Event): void {
    event.preventDefault();
    if (this.isProcessing()) {
      return;
    }
    this.submitted.set(true);
    if (this.clientCodeError() || this.clientNameError() || this.clientDescriptionError()) {
      return;
    }
    this.save.emit({
      code: this.format()?.code ?? (this.code() || null),
      displayName: this.displayName().trim(),
      description: this.description().trim(),
      active: this.active(),
    });
  }

  protected onCancel(): void {
    if (!this.isProcessing()) {
      this.cancel.emit();
    }
  }

  protected onEscape(): void {
    this.onCancel();
  }

  /** Keeps Tab inside the drawer while it is open. */
  protected onKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Tab') {
      return;
    }
    const panel = this.panel().nativeElement;
    const focusable = [...panel.querySelectorAll<HTMLElement>(FOCUSABLE)];
    if (focusable.length === 0) {
      return;
    }
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = this.document.activeElement;
    if (!active || !panel.contains(active)) {
      event.preventDefault();
      first.focus();
    } else if (event.shiftKey && active === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  }
}
