import { Component, computed, input, model } from '@angular/core';
import {
  DAY_LABELS,
  DAYS_OF_WEEK,
  DayOfWeek,
  isValidRange,
  OpeningHours,
} from '../../utils/opening-hours';

interface DayRow {
  readonly day: DayOfWeek;
  readonly label: string;
  readonly hours: OpeningHours | null;
  readonly invalid: boolean;
}

const DEFAULT_OPENS_AT = '08:00';
const DEFAULT_CLOSES_AT = '20:00';

@Component({
  selector: 'app-opening-hours-editor',
  templateUrl: './opening-hours-editor.html',
  host: { class: 'block' },
})
export class OpeningHoursEditor {
  readonly hours = model<OpeningHours[]>([]);
  readonly showErrors = input(false);

  readonly rows = computed<DayRow[]>(() =>
    DAYS_OF_WEEK.map((day) => {
      const hours = this.hours().find((h) => h.day === day) ?? null;
      return { day, label: DAY_LABELS[day], hours, invalid: hours !== null && !isValidRange(hours) };
    }),
  );

  readonly hasNoDays = computed(() => this.hours().length === 0);

  toggleDay(day: DayOfWeek, open: boolean): void {
    if (!open) {
      this.hours.update((list) => list.filter((h) => h.day !== day));
      return;
    }
    this.hours.update((list) => this.sorted([...list, { day, opensAt: DEFAULT_OPENS_AT, closesAt: DEFAULT_CLOSES_AT }]));
  }

  changeTime(day: DayOfWeek, field: 'opensAt' | 'closesAt', value: string): void {
    this.hours.update((list) => list.map((h) => (h.day === day ? { ...h, [field]: value } : h)));
  }

  copyToAll(day: DayOfWeek): void {
    const source = this.hours().find((h) => h.day === day);
    if (!source) {
      return;
    }
    this.hours.update((list) => list.map((h) => ({ ...h, opensAt: source.opensAt, closesAt: source.closesAt })));
  }

  private sorted(list: OpeningHours[]): OpeningHours[] {
    return list.sort((a, b) => DAYS_OF_WEEK.indexOf(a.day) - DAYS_OF_WEEK.indexOf(b.day));
  }
}
