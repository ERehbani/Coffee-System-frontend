/** `yyyy-MM-dd` of the date in the browser's time zone; `toISOString()` gives the UTC day instead. */
export function toLocalIsoDate(date: Date = new Date()): string {
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}
