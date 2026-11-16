export const DAYS_OF_WEEK = [
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
  'SUNDAY',
] as const;

export type DayOfWeek = (typeof DAYS_OF_WEEK)[number];

export interface OpeningHours {
  readonly day: DayOfWeek;
  readonly opensAt: string;
  readonly closesAt: string;
}

export const DAY_LABELS: Readonly<Record<DayOfWeek, string>> = {
  MONDAY: 'Lunes',
  TUESDAY: 'Martes',
  WEDNESDAY: 'Miércoles',
  THURSDAY: 'Jueves',
  FRIDAY: 'Viernes',
  SATURDAY: 'Sábado',
  SUNDAY: 'Domingo',
};

const SHORT_LABELS: Readonly<Record<DayOfWeek, string>> = {
  MONDAY: 'Lun',
  TUESDAY: 'Mar',
  WEDNESDAY: 'Mié',
  THURSDAY: 'Jue',
  FRIDAY: 'Vie',
  SATURDAY: 'Sáb',
  SUNDAY: 'Dom',
};

const JS_DAY_TO_DAY: readonly DayOfWeek[] = [
  'SUNDAY',
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
];

interface DayGroup {
  readonly days: DayOfWeek[];
  readonly range: string;
}

export function toHourMinute(time: string): string {
  return time.slice(0, 5);
}

export function normalizeOpeningHours(hours: readonly OpeningHours[] | null | undefined): OpeningHours[] {
  return [...(hours ?? [])]
    .map((h) => ({ day: h.day, opensAt: toHourMinute(h.opensAt), closesAt: toHourMinute(h.closesAt) }))
    .sort((a, b) => DAYS_OF_WEEK.indexOf(a.day) - DAYS_OF_WEEK.indexOf(b.day));
}

function rangeOf(hours: OpeningHours): string {
  return `${toHourMinute(hours.opensAt)}–${toHourMinute(hours.closesAt)}`;
}

function isNextDay(previous: DayOfWeek, current: DayOfWeek): boolean {
  return DAYS_OF_WEEK.indexOf(current) === DAYS_OF_WEEK.indexOf(previous) + 1;
}

function groupByRange(hours: readonly OpeningHours[]): DayGroup[] {
  const groups: DayGroup[] = [];
  for (const item of normalizeOpeningHours(hours)) {
    const last = groups.at(-1);
    const range = rangeOf(item);
    if (last && last.range === range && isNextDay(last.days.at(-1)!, item.day)) {
      last.days.push(item.day);
    } else {
      groups.push({ days: [item.day], range });
    }
  }
  return groups;
}

function daysLabel(days: readonly DayOfWeek[]): string {
  if (days.length === 1) {
    return SHORT_LABELS[days[0]];
  }
  return `${SHORT_LABELS[days[0]]} a ${SHORT_LABELS[days.at(-1)!]}`;
}

export function formatOpeningHours(hours: readonly OpeningHours[] | null | undefined): string {
  return groupByRange(hours ?? [])
    .map((group) => `${daysLabel(group.days)} ${group.range}`)
    .join(' · ');
}

export function hoursOfToday(
  hours: readonly OpeningHours[] | null | undefined,
  now: Date = new Date(),
): string | null {
  const today = JS_DAY_TO_DAY[now.getDay()];
  const found = (hours ?? []).find((h) => h.day === today);
  return found ? rangeOf(found) : null;
}

export function isValidRange(hours: OpeningHours): boolean {
  return Boolean(hours.opensAt) && Boolean(hours.closesAt) && hours.opensAt < hours.closesAt;
}

export function hasValidOpeningHours(hours: readonly OpeningHours[]): boolean {
  return hours.length > 0 && hours.every(isValidRange);
}
