import type { Slot } from "../api/models";

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

export function toDateKey(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** First/last calendar date of the given month, as "YYYY-MM-DD" strings. */
export function getMonthRange(
  year: number,
  month: number,
): { from: string; to: string } {
  const from = new Date(year, month, 1);
  const to = new Date(year, month + 1, 0);
  return { from: toDateKey(from), to: toDateKey(to) };
}

export function groupSlotsByDay(slots: Slot[]): Map<string, Slot[]> {
  const map = new Map<string, Slot[]>();
  for (const slot of slots) {
    const key = toDateKey(new Date(slot.startAt));
    const existing = map.get(key);
    if (existing) {
      existing.push(slot);
    } else {
      map.set(key, [slot]);
    }
  }
  return map;
}

export function isSameDay(a: Date, b: Date): boolean {
  return toDateKey(a) === toDateKey(b);
}

export function isPast(date: Date): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date < today;
}
