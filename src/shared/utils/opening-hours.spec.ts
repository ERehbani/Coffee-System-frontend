import { formatOpeningHours, hoursOfToday, normalizeOpeningHours, OpeningHours } from './opening-hours';

const WEEKDAYS: OpeningHours[] = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'].map((day) => ({
  day: day as OpeningHours['day'],
  opensAt: '08:00:00',
  closesAt: '20:00:00',
}));

describe('opening hours', () => {
  it('groups the consecutive days that share the same hours', () => {
    const hours = [...WEEKDAYS, { day: 'SATURDAY' as const, opensAt: '09:00', closesAt: '13:00' }];

    expect(formatOpeningHours(hours)).toBe('Lun a Vie 08:00–20:00 · Sáb 09:00–13:00');
  });

  it('does not join days that are not consecutive', () => {
    const hours: OpeningHours[] = [
      { day: 'SUNDAY', opensAt: '10:00', closesAt: '14:00' },
      { day: 'MONDAY', opensAt: '10:00', closesAt: '14:00' },
      { day: 'WEDNESDAY', opensAt: '10:00', closesAt: '14:00' },
    ];

    expect(formatOpeningHours(hours)).toBe('Lun 10:00–14:00 · Mié 10:00–14:00 · Dom 10:00–14:00');
  });

  it('returns an empty text when there are no hours', () => {
    expect(formatOpeningHours([])).toBe('');
    expect(formatOpeningHours(null)).toBe('');
  });

  it('sorts the days and cuts the seconds the backend sends', () => {
    expect(normalizeOpeningHours([{ day: 'FRIDAY', opensAt: '08:00:00', closesAt: '20:00:00' }, WEEKDAYS[0]])).toEqual([
      { day: 'MONDAY', opensAt: '08:00', closesAt: '20:00' },
      { day: 'FRIDAY', opensAt: '08:00', closesAt: '20:00' },
    ]);
  });

  it('tells the hours of today or null when the cafe does not open', () => {
    const saturday = new Date(2026, 10, 14, 12, 0);

    expect(hoursOfToday(WEEKDAYS, new Date(2026, 10, 13, 12, 0))).toBe('08:00–20:00');
    expect(hoursOfToday(WEEKDAYS, saturday)).toBeNull();
  });
});
