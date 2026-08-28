// calendar-math — the shared zero-dependency date vocabulary of the
// date-picker family (registry/files/ui/date-picker/calendar-math.ts).
//
// Original request (2026-08-28): “从 date-picker 抽取可嵌入日历片段，供
// Input 组件的 picker 桥消费” — the math moved out of date-picker.svelte so
// the embeddable calendar.svelte (grid fragment) and the popover host share
// one source. Orthogonal intents:
//
// 1. English month/weekday vocabulary — month labels, locale-style
//    display, Monday-first grid headers.
// 2. strict ISO "YYYY-MM-DD" math — hand-rolled leap years, month lengths
//    and day arithmetic over UTC Date (zero date libraries); zero-padded
//    ISO strings compare correctly as plain strings, which is why every
//    bound/range edge in the family is a plain < / > comparison.
//
// Everything here is pure. todayIso() reads the clock on every call —
// never a module-level snapshot (a long-lived host must not freeze
// "today" at bundle time).

/** Full English month names, indexed by 0-based month (0 = January). */
export const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/** Abbreviated months for locale-style display ("Aug 20, 2026"). */
export const MONTHS_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

/** Monday-first two-letter weekday headers (grid column order). */
export const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

/** Full weekday names for the columnheader aria-labels (Monday-first). */
export const WEEKDAYS_FULL = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday',
];

const ISO_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
const MONTH_LENGTHS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

/** 2-digit zero pad ("07"). */
export function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

/** Month length with the leap-year correction (month is 0-based). */
export function daysInMonth(year: number, month: number): number {
  if (month === 1) {
    const leap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
    return leap ? 29 : 28;
  }
  return MONTH_LENGTHS[month];
}

/** ISO "YYYY-MM-DD" of a (year, 0-based month, day) triple. */
export function isoOf(year: number, month: number, day: number): string {
  return `${year}-${pad2(month + 1)}-${pad2(day)}`;
}

/** strict parse — null when malformed or not a real calendar day */
export function parseIso(
  iso: string | undefined
): { year: number; month: number; day: number } | null {
  if (!iso) return null;
  const m = ISO_RE.exec(iso);
  if (!m) return null;
  const year = Number(m[1]);
  const month = Number(m[2]) - 1;
  const day = Number(m[3]);
  if (month < 0 || month > 11 || day < 1 || day > daysInMonth(year, month)) return null;
  return { year, month, day };
}

/** validated-or-undefined ISO (props arrive as trust-but-verify strings) */
export function validIso(iso: string | undefined): string | undefined {
  const p = parseIso(iso);
  return p ? isoOf(p.year, p.month, p.day) : undefined;
}

/** day arithmetic across month/year boundaries (UTC Date, zero-dep);
    internal callers only ever pass validated ISO strings */
export function addDays(iso: string, delta: number): string {
  const p = parseIso(iso)!;
  const d = new Date(Date.UTC(p.year, p.month, p.day + delta));
  return isoOf(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}

/** today as ISO "YYYY-MM-DD" — fresh clock read on every call (the local
    calendar day, never cached across midnights) */
export function todayIso(): string {
  const now = new Date();
  return isoOf(now.getFullYear(), now.getMonth(), now.getDate());
}
