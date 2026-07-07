/**
 * All date math uses LOCAL calendar days, never UTC — a player in Sydney and a
 * player in Los Angeles each roll over to the next puzzle at their own midnight.
 */

export function toDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function parseDateKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/** Whole local days from a to b (b - a). Math.round absorbs DST's 23/25-hour days. */
export function daysBetween(a: Date, b: Date): number {
  const startA = new Date(a.getFullYear(), a.getMonth(), a.getDate()).getTime();
  const startB = new Date(b.getFullYear(), b.getMonth(), b.getDate()).getTime();
  return Math.round((startB - startA) / 86_400_000);
}

export function getTodayDateKey(): string {
  return toDateKey(new Date());
}

export function getYesterdayDateKey(todayKey = getTodayDateKey()): string {
  const t = parseDateKey(todayKey);
  t.setDate(t.getDate() - 1);
  return toDateKey(t);
}

export function msUntilNextMidnight(now = new Date()): number {
  const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  return next.getTime() - now.getTime();
}

/** "1974-10-30" → "Oct 30, 1974" (for the end-game timeline) */
export function formatDisplayDate(dateKey: string): string {
  return parseDateKey(dateKey).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
