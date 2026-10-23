import {
  Component,
  effect,
  HostListener,
  input,
  output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Icon } from '../../../../shared/components/icon/icon';
import { IconName } from '../../../../shared/components/icon/icon-registry';
import { AdminCategory, CategoryFormData, CategoryStatus } from '../../types/admin-category.model';

export interface AvailableIcon {
  readonly name: IconName;
  readonly label: string;
}

export interface AvailableColor {
  readonly id: string;
  readonly label: string;
  readonly bgClass: string;
  readonly textClass: string;
  readonly ringClass: string;
}

@Component({
  selector: 'app-category-form-modal',
  imports: [FormsModule, Icon],
  templateUrl: './category-form-modal.html',
})
export class CategoryFormModal {
  readonly category = input<AdminCategory | null>(null);
  readonly isProcessing = input<boolean>(false);

  readonly save = output<{ data: CategoryFormData; id?: string }>();
  readonly close = output<void>();

  // Form State Signals
  readonly name = signal<string>('');
  readonly description = signal<string>('');
  readonly icon = signal<IconName>('coffee');
  readonly color = signal<string>('amber');
  readonly status = signal<CategoryStatus>('active');
  readonly touched = signal<boolean>(false);

  readonly availableIcons: readonly AvailableIcon[] = [
    { name: 'coffee', label: 'Café' },
    { name: 'cup', label: 'Taza / Pastelería' },
    { name: 'tag', label: 'Etiqueta' },
    { name: 'store', label: 'Comercio / Tostados' },
    { name: 'zap', label: 'Bebidas Frías' },
    { name: 'shopping-bag', label: 'Granos / Retail' },
    { name: 'star', label: 'Especial / Brunch' },
    { name: 'gift', label: 'Promociones' },
  ];

  readonly availableColors: readonly AvailableColor[] = [
    { id: 'amber', label: 'Ámbar', bgClass: 'bg-amber-100', textClass: 'text-amber-800', ringClass: 'ring-amber-300' },
    { id: 'rose', label: 'Rosa / Frutal', bgClass: 'bg-rose-100', textClass: 'text-rose-800', ringClass: 'ring-rose-300' },
    { id: 'sky', label: 'Cielo / Frío', bgClass: 'bg-sky-100', textClass: 'text-sky-800', ringClass: 'ring-sky-300' },
    { id: 'emerald', label: 'Esmeralda', bgClass: 'bg-emerald-100', textClass: 'text-emerald-800', ringClass: 'ring-emerald-300' },
    { id: 'purple', label: 'Púrpura', bgClass: 'bg-purple-100', textClass: 'text-purple-800', ringClass: 'ring-purple-300' },
    { id: 'orange', label: 'Naranja', bgClass: 'bg-orange-100', textClass: 'text-orange-800', ringClass: 'ring-orange-300' },
  ];

  constructor() {
    effect(() => {
      const cat = this.category();
      if (cat) {
        this.name.set(cat.name);
        this.description.set(cat.description || '');
        this.icon.set(cat.icon || 'coffee');
        this.color.set(cat.color || 'amber');
        this.status.set(cat.status);
      } else {
        this.name.set('');
        this.description.set('');
        this.icon.set('coffee');
        this.color.set('amber');
        this.status.set('active');
      }
      this.touched.set(false);
    });
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (!this.isProcessing()) {
      this.close.emit();
    }
  }

  protected isNameValid(): boolean {
    const trimmed = this.name().trim();
    if (trimmed.length < 2 || trimmed.length > 50) {
      return false;
    }
    // Letters, spaces and accents allowed
    return /^[\p{L}\s]+$/u.test(trimmed);
  }

  protected getNameError(): string | null {
    if (!this.touched()) return null;
    const trimmed = this.name().trim();
    if (trimmed.length === 0) {
      return 'El nombre de la categoría es obligatorio.';
    }
    if (trimmed.length < 2) {
      return 'El nombre debe tener al menos 2 caracteres.';
    }
    if (trimmed.length > 50) {
      return 'El nombre no puede exceder 50 caracteres.';
    }
    if (!/^[\p{L}\s]+$/u.test(trimmed)) {
      return 'El nombre solo puede contener letras y espacios (sin números ni símbolos).';
    }
    return null;
  }

  protected onNameInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.name.set(target.value);
    this.touched.set(true);
  }

  protected onDescriptionInput(event: Event): void {
    const target = event.target as HTMLTextAreaElement;
    this.description.set(target.value);
  }

  protected selectIcon(iconName: IconName): void {
    this.icon.set(iconName);
  }

  protected selectColor(colorId: string): void {
    this.color.set(colorId);
  }

  protected setStatus(newStatus: CategoryStatus): void {
    this.status.set(newStatus);
  }

  protected onSubmit(event: Event): void {
    event.preventDefault();
    this.touched.set(true);

    if (!this.isNameValid() || this.isProcessing()) {
      return;
    }

    const formData: CategoryFormData = {
      name: this.name().trim(),
      description: this.description().trim(),
      icon: this.icon(),
      color: this.color(),
      status: this.status(),
    };

    const currentCat = this.category();
    this.save.emit({
      data: formData,
      id: currentCat ? currentCat.id : undefined,
    });
  }

  protected getPreviewColorClasses(): { bg: string; text: string; ring: string } {
    const c = this.color();
    const found = this.availableColors.find((item) => item.id === c);
    return found
      ? { bg: found.bgClass, text: found.textClass, ring: found.ringClass }
      : { bg: 'bg-amber-100', text: 'text-amber-800', ring: 'ring-amber-300' };
  }
}
