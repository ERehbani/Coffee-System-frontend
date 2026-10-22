import { Component, computed, HostListener, inject, input, output, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Icon } from '../../../../shared/components/icon/icon';
import { ActionFeedback } from '../../services/admin-cafe.store';
import { CreateCafeInput } from '../../types/admin-cafe.model';

export const SAMPLE_CAFE_COVERS = [
  {
    name: 'Café Clásico',
    url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1200&h=600&fit=crop&q=80&auto=format',
  },
  {
    name: 'Tostaduría Urbana',
    url: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1200&h=600&fit=crop&q=80&auto=format',
  },
  {
    name: 'Barra Espresso',
    url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1200&h=600&fit=crop&q=80&auto=format',
  },
  {
    name: 'Café Boutique',
    url: 'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=1200&h=600&fit=crop&q=80&auto=format',
  },
];

export interface DayOption {
  readonly id: string;
  readonly label: string;
  readonly short: string;
}

export const DAYS_OF_WEEK: readonly DayOption[] = [
  { id: 'lun', label: 'Lunes', short: 'Lun' },
  { id: 'mar', label: 'Martes', short: 'Mar' },
  { id: 'mie', label: 'Miércoles', short: 'Mié' },
  { id: 'jue', label: 'Jueves', short: 'Jue' },
  { id: 'vie', label: 'Viernes', short: 'Vie' },
  { id: 'sab', label: 'Sábado', short: 'Sáb' },
  { id: 'dom', label: 'Domingo', short: 'Dom' },
];

export const TIME_SLOTS: readonly string[] = [
  '06:00', '06:30', '07:00', '07:30', '08:00', '08:30', '09:00', '09:30',
  '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
  '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30',
  '22:00', '22:30', '23:00', '23:30', '00:00',
];

const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/;
const PHONE_PATTERN = /^[0-9+\-\s()]{6,20}$/;

function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;
  if (confirmPassword && password !== confirmPassword) {
    return { passwordMismatch: true };
  }
  return null;
}

@Component({
  selector: 'app-cafe-register-modal',
  imports: [ReactiveFormsModule, Icon],
  templateUrl: './cafe-register-modal.html',
})
export class CafeRegisterModal {
  private readonly fb = inject(FormBuilder);

  readonly isProcessing = input<boolean>(false);
  readonly actionMessage = input<ActionFeedback | null>(null);

  readonly register = output<CreateCafeInput>();
  readonly close = output<void>();

  readonly showPassword = signal<boolean>(false);
  readonly showConfirmPassword = signal<boolean>(false);
  readonly sampleCovers = SAMPLE_CAFE_COVERS;

  readonly daysOfWeek = DAYS_OF_WEEK;
  readonly timeSlots = TIME_SLOTS;

  // Días seleccionados para apertura
  readonly selectedDays = signal<string[]>(['lun', 'mar', 'mie', 'jue', 'vie']);
  readonly isDaysDropdownOpen = signal<boolean>(false);

  readonly form: FormGroup = this.fb.group(
    {
      // Credenciales iniciales
      email: ['', [Validators.required, Validators.email]],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(6),
          Validators.pattern(PASSWORD_PATTERN),
        ],
      ],
      confirmPassword: ['', [Validators.required]],

      // Datos base del comercio
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(80)]],
      address: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(150)]],
      phoneNumber: ['', [Validators.pattern(PHONE_PATTERN)]],

      // Horario comercial desglosado
      openTime: ['08:00', [Validators.required]],
      closeTime: ['20:00', [Validators.required]],

      description: ['', [Validators.maxLength(500)]],
      image: [SAMPLE_CAFE_COVERS[0].url],
    },
    { validators: [passwordMatchValidator] },
  );

  protected readonly passwordValue = signal<string>('');

  protected readonly passwordReqs = computed(() => {
    const p = this.passwordValue();
    return {
      minLength: p.length >= 6,
      hasUpper: /[A-Z]/.test(p),
      hasLower: /[a-z]/.test(p),
      hasNumber: /\d/.test(p),
    };
  });

  protected readonly descriptionLength = computed(() => {
    const desc = this.form.get('description')?.value as string;
    return desc ? desc.length : 0;
  });

  protected readonly daysDisplayLabel = computed(() => {
    const selected = this.selectedDays();
    if (selected.length === 0) {
      return 'Seleccionar días...';
    }
    if (selected.length === 7) {
      return 'Todos los días';
    }

    const isLunVie =
      selected.length === 5 &&
      ['lun', 'mar', 'mie', 'jue', 'vie'].every((d) => selected.includes(d));
    if (isLunVie) {
      return 'Lun a Vie';
    }

    const isLunSab =
      selected.length === 6 &&
      ['lun', 'mar', 'mie', 'jue', 'vie', 'sab'].every((d) => selected.includes(d));
    if (isLunSab) {
      return 'Lun a Sáb';
    }

    const isFinde =
      selected.length === 2 && selected.includes('sab') && selected.includes('dom');
    if (isFinde) {
      return 'Sáb y Dom';
    }

    const order = ['lun', 'mar', 'mie', 'jue', 'vie', 'sab', 'dom'];
    const sorted = [...selected].sort((a, b) => order.indexOf(a) - order.indexOf(b));
    return sorted.map((id) => DAYS_OF_WEEK.find((d) => d.id === id)?.short || id).join(', ');
  });

  protected readonly openTimeValue = signal<string>('08:00');
  protected readonly closeTimeValue = signal<string>('20:00');

  protected readonly formattedSchedule = computed(() => {
    const days = this.daysDisplayLabel();
    if (this.selectedDays().length === 0) {
      return 'Horario no especificado';
    }
    const open = this.openTimeValue();
    const close = this.closeTimeValue();
    return `${days} ${open} - ${close}`;
  });

  constructor() {
    this.form.get('password')?.valueChanges.subscribe((val) => {
      this.passwordValue.set(val || '');
    });
    this.form.get('openTime')?.valueChanges.subscribe((val) => {
      this.openTimeValue.set(val || '08:00');
    });
    this.form.get('closeTime')?.valueChanges.subscribe((val) => {
      this.closeTimeValue.set(val || '20:00');
    });
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.isDaysDropdownOpen()) {
      this.isDaysDropdownOpen.set(false);
      return;
    }
    if (!this.isProcessing()) {
      this.close.emit();
    }
  }

  protected toggleDaysDropdown(): void {
    this.isDaysDropdownOpen.update((prev) => !prev);
  }

  protected closeDaysDropdown(): void {
    this.isDaysDropdownOpen.set(false);
  }

  protected isDaySelected(id: string): boolean {
    return this.selectedDays().includes(id);
  }

  protected toggleDay(id: string): void {
    this.selectedDays.update((current) => {
      if (current.includes(id)) {
        return current.filter((d) => d !== id);
      }
      return [...current, id];
    });
  }

  protected setDaysPreset(preset: 'lun-vie' | 'lun-sab' | 'all' | 'none'): void {
    switch (preset) {
      case 'lun-vie':
        this.selectedDays.set(['lun', 'mar', 'mie', 'jue', 'vie']);
        break;
      case 'lun-sab':
        this.selectedDays.set(['lun', 'mar', 'mie', 'jue', 'vie', 'sab']);
        break;
      case 'all':
        this.selectedDays.set(['lun', 'mar', 'mie', 'jue', 'vie', 'sab', 'dom']);
        break;
      case 'none':
        this.selectedDays.set([]);
        break;
    }
  }

  protected toggleShowPassword(): void {
    this.showPassword.update((prev) => !prev);
  }

  protected toggleShowConfirmPassword(): void {
    this.showConfirmPassword.update((prev) => !prev);
  }

  protected selectCover(url: string): void {
    this.form.patchValue({ image: url });
  }

  protected onSubmit(): void {
    if (this.form.invalid || this.isProcessing()) {
      this.form.markAllAsTouched();
      return;
    }

    const val = this.form.value;
    const computedSchedule = this.formattedSchedule();

    const request: CreateCafeInput = {
      email: val.email.trim(),
      password: val.password,
      name: val.name.trim(),
      address: val.address.trim(),
      phoneNumber: val.phoneNumber?.trim() || undefined,
      schedule:
        computedSchedule !== 'Horario no especificado' ? computedSchedule : undefined,
      description: val.description?.trim() || undefined,
      image: val.image?.trim() || undefined,
    };

    this.register.emit(request);
  }
}
