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
import { SaveTierInput, Tier, TierFormErrors } from '../../types/tier.model';

const NAME_MAX_LENGTH = 50;
const FOCUSABLE = 'button:not([disabled]), input:not([disabled])';

@Component({
  imports: [FormsModule, Icon],
  selector: 'app-tier-form-drawer',
  templateUrl: './tier-form-drawer.html',
  host: { '(document:keydown.escape)': 'onEscape()' },
})
export class TierFormDrawer {
  /** The tier being edited; `null` to create one. */
  readonly tier = input<Tier | null>(null);
  /** The base tier keeps its points at 0, so they are shown but cannot be changed. */
  readonly isBaseTier = input(false);
  readonly isProcessing = input(false);
  /** Errors the server answered the last save with. */
  readonly errors = input<TierFormErrors>({});

  readonly save = output<SaveTierInput>();
  readonly cancel = output<void>();
  /** Fires when the user edits a field, so its server error can be dropped. */
  readonly fieldEdited = output<'name' | 'minPoints'>();

  protected readonly name = linkedSignal(() => this.tier()?.name ?? '');
  protected readonly minPoints = linkedSignal<number | null>(() => this.tier()?.minPoints ?? null);
  protected readonly submitted = signal(false);

  protected readonly title = computed(() => (this.tier() ? 'Editar tier' : 'Nuevo tier'));

  private readonly clientNameError = computed(() => {
    const name = this.name().trim();
    if (!name) {
      return 'El nombre es obligatorio.';
    }
    return name.length > NAME_MAX_LENGTH ? 'El nombre puede tener hasta 50 caracteres.' : null;
  });

  private readonly clientPointsError = computed(() => {
    const points = this.minPoints();
    if (points === null) {
      return 'Los puntos son obligatorios.';
    }
    if (!Number.isInteger(points)) {
      return 'Los puntos deben ser un número entero.';
    }
    return points < 0 ? 'Los puntos no pueden ser negativos.' : null;
  });

  protected readonly nameError = computed(
    () => this.errors().name ?? (this.submitted() ? this.clientNameError() : null),
  );
  protected readonly pointsError = computed(
    () => this.errors().minPoints ?? (this.submitted() ? this.clientPointsError() : null),
  );

  private readonly panel = viewChild.required<ElementRef<HTMLElement>>('panel');
  private readonly nameInput = viewChild.required<ElementRef<HTMLInputElement>>('nameInput');

  private readonly document = inject(DOCUMENT);

  constructor() {
    const opener = this.document.activeElement as HTMLElement | null;
    afterNextRender(() => this.nameInput().nativeElement.focus());
    inject(DestroyRef).onDestroy(() => {
      if (opener?.isConnected) {
        opener.focus();
      }
    });
  }

  protected onNameChange(value: string): void {
    this.name.set(value);
    this.fieldEdited.emit('name');
  }

  protected onPointsChange(value: number | null): void {
    this.minPoints.set(value);
    this.fieldEdited.emit('minPoints');
  }

  protected onSubmit(event: Event): void {
    event.preventDefault();
    if (this.isProcessing()) {
      return;
    }
    this.submitted.set(true);
    const points = this.isBaseTier() ? 0 : this.minPoints();
    if (
      this.clientNameError() ||
      (!this.isBaseTier() && this.clientPointsError()) ||
      points === null
    ) {
      return;
    }
    this.save.emit({ name: this.name().trim(), minPoints: points });
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
    const focusable = [...this.panel().nativeElement.querySelectorAll<HTMLElement>(FOCUSABLE)];
    if (focusable.length === 0) {
      return;
    }
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = this.document.activeElement;
    if (event.shiftKey && active === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  }
}
