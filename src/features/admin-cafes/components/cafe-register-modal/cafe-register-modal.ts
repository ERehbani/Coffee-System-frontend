import { Component, computed, input, output, signal } from '@angular/core';
import { FormField, email, form, maxLength, minLength, pattern, required } from '@angular/forms/signals';
import { Icon } from '../../../../shared/components/icon/icon';
import { CreateCafeAccountRequest } from '../../../home/model/cafe.model';

@Component({
  selector: 'app-cafe-register-modal',
  imports: [FormField, Icon],
  templateUrl: './cafe-register-modal.html',
  styleUrl: './cafe-register-modal.css',
  host: {
    '(document:keydown.escape)': 'onCancel()',
  },
})
export class CafeRegisterModal {
  readonly isOpen = input.required<boolean>();
  readonly isSubmitting = input(false);
  readonly errorMessage = input<string | null>(null);

  readonly submitted = output<CreateCafeAccountRequest>();
  readonly cancelled = output<void>();

  readonly weekDays = [
    { id: 'Lun', label: 'Lunes' },
    { id: 'Mar', label: 'Martes' },
    { id: 'Mié', label: 'Miércoles' },
    { id: 'Jue', label: 'Jueves' },
    { id: 'Vie', label: 'Viernes' },
    { id: 'Sáb', label: 'Sábado' },
    { id: 'Dom', label: 'Domingo' },
  ];

  readonly timeOptions: string[] = [
    '06:00', '06:30', '07:00', '07:30', '08:00', '08:30',
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
    '18:00', '18:30', '19:00', '19:30', '20:00', '20:30',
    '21:00', '21:30', '22:00', '22:30', '23:00', '23:30', '00:00',
  ];

  selectedDays = signal<string[]>(['Lun', 'Mar', 'Mié', 'Jue', 'Vie']);
  isDaysDropdownOpen = signal(false);
  openingTime = signal('08:00');
  closingTime = signal('20:00');

  cafeModel = signal<CreateCafeAccountRequest>({
    email: '',
    password: '',
    name: '',
    address: '',
    phoneNumber: '',
    schedule: 'Lun a Vie 08:00 - 20:00',
    description: '',
  });

  attemptedSubmit = signal(false);
  showPassword = signal(false);

  cafeForm = form(this.cafeModel, (field) => {
    required(field.email, { message: 'El correo electrónico es obligatorio.' });
    email(field.email, { message: 'Ingresá un correo electrónico válido.' });

    required(field.password, { message: 'La contraseña es obligatoria.' });
    minLength(field.password, 6, { message: 'La contraseña debe tener al menos 6 caracteres.' });
    pattern(field.password, /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, {
      message: 'Debe incluir al menos una mayúscula, una minúscula y un número.',
    });

    required(field.name, { message: 'El nombre de la cafetería es obligatorio.' });
    minLength(field.name, 2, { message: 'El nombre debe tener al menos 2 caracteres.' });
    maxLength(field.name, 80, { message: 'El nombre no puede superar los 80 caracteres.' });

    required(field.address, { message: 'La dirección es obligatoria.' });
    minLength(field.address, 5, { message: 'La dirección debe tener al menos 5 caracteres.' });
    maxLength(field.address, 150, { message: 'La dirección no puede superar los 150 caracteres.' });

    maxLength(field.schedule, 150, { message: 'El horario no puede superar los 150 caracteres.' });
    maxLength(field.description, 500, { message: 'La descripción no puede superar los 500 caracteres.' });
  });

  emailError = computed(() => this.cafeForm.email().errors()[0]?.message ?? null);
  passwordError = computed(() => this.cafeForm.password().errors()[0]?.message ?? null);
  nameError = computed(() => this.cafeForm.name().errors()[0]?.message ?? null);
  addressError = computed(() => this.cafeForm.address().errors()[0]?.message ?? null);
  scheduleError = computed(() => this.cafeForm.schedule().errors()[0]?.message ?? null);
  descriptionError = computed(() => this.cafeForm.description().errors()[0]?.message ?? null);

  phoneError = computed(() => {
    const phone = this.cafeModel().phoneNumber?.trim();
    if (phone && !/^[0-9+\-\s()]{6,20}$/.test(phone)) {
      return 'El formato de teléfono no es válido.';
    }
    return null;
  });

  scheduleTimeError = computed(() => {
    const open = this.openingTime();
    const close = this.closingTime();
    if (!open || !close) {
      return null;
    }
    const openMinutes = this.timeToMinutes(open);
    const closeMinutes = this.timeToMinutes(close);
    if (closeMinutes <= openMinutes) {
      return 'El horario de cierre no puede ser anterior o igual al horario de apertura.';
    }
    return null;
  });

  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    if (hours === 0 && minutes === 0) {
      return 24 * 60;
    }
    return hours * 60 + minutes;
  }

  selectedDaysText = computed(() => {
    const days = this.selectedDays();
    if (days.length === 0) {
      return '';
    }
    if (days.length === 7) {
      return 'Lun a Dom';
    }
    const weekdaysOrder = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie'];
    if (days.length === 5 && weekdaysOrder.every((d) => days.includes(d))) {
      return 'Lun a Vie';
    }
    const sorted = this.weekDays
      .filter((w) => days.includes(w.id))
      .map((w) => w.id);
    return sorted.join(', ');
  });

  toggleShowPassword(): void {
    this.showPassword.update((value) => !value);
  }

  toggleDaysDropdown(): void {
    this.isDaysDropdownOpen.update((open) => !open);
  }

  closeDaysDropdown(): void {
    this.isDaysDropdownOpen.set(false);
  }

  toggleDay(dayId: string): void {
    this.selectedDays.update((current) =>
      current.includes(dayId) ? current.filter((d) => d !== dayId) : [...current, dayId]
    );
    this.updateSchedule();
  }

  selectAllDays(): void {
    this.selectedDays.set(this.weekDays.map((d) => d.id));
    this.updateSchedule();
  }

  selectWeekdays(): void {
    this.selectedDays.set(['Lun', 'Mar', 'Mié', 'Jue', 'Vie']);
    this.updateSchedule();
  }

  clearDays(): void {
    this.selectedDays.set([]);
    this.updateSchedule();
  }

  onOpeningTimeChange(value: string): void {
    this.openingTime.set(value);
    this.updateSchedule();
  }

  onClosingTimeChange(value: string): void {
    this.closingTime.set(value);
    this.updateSchedule();
  }

  updateSchedule(): void {
    const days = this.selectedDaysText();
    const open = this.openingTime();
    const close = this.closingTime();

    if (!days && !open && !close) {
      this.cafeModel.update((model) => ({ ...model, schedule: '' }));
      return;
    }

    const parts: string[] = [];
    if (days) {
      parts.push(days);
    }
    if (open && close) {
      parts.push(`${open} - ${close}`);
    }

    this.cafeModel.update((model) => ({
      ...model,
      schedule: parts.join(' '),
    }));
  }

  onSubmit(event: Event): void {
    event.preventDefault();
    this.attemptedSubmit.set(true);

    if (
      this.cafeForm().invalid() ||
      this.phoneError() ||
      this.scheduleTimeError() ||
      this.isSubmitting()
    ) {
      return;
    }

    const current = this.cafeModel();
    this.submitted.emit({
      email: current.email.trim(),
      password: current.password,
      name: current.name.trim(),
      address: current.address.trim(),
      phoneNumber: current.phoneNumber.trim(),
      schedule: current.schedule.trim(),
      description: current.description.trim(),
    });
  }

  reset(): void {
    this.selectedDays.set(['Lun', 'Mar', 'Mié', 'Jue', 'Vie']);
    this.isDaysDropdownOpen.set(false);
    this.openingTime.set('08:00');
    this.closingTime.set('20:00');
    this.cafeModel.set({
      email: '',
      password: '',
      name: '',
      address: '',
      phoneNumber: '',
      schedule: 'Lun a Vie 08:00 - 20:00',
      description: '',
    });
    this.attemptedSubmit.set(false);
    this.showPassword.set(false);
  }

  onCancel(): void {
    if (this.isSubmitting()) {
      return;
    }
    this.reset();
    this.cancelled.emit();
  }
}
