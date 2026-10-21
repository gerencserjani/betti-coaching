import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  getMonthRange,
  groupSlotsByDay,
  isPast,
  isSameDay,
  toDateKey,
} from "./dateUtils";
import type { Slot } from "../api/models";

function slot(startAt: string, endAt: string): Slot {
  return { coachId: "coach-1", startAt, endAt };
}

describe("toDateKey", () => {
  it("formats a local date as YYYY-MM-DD, zero-padded", () => {
    expect(toDateKey(new Date(2026, 0, 5))).toBe("2026-01-05");
  });
});

describe("getMonthRange", () => {
  it("returns the first and last day of the given month", () => {
    // month is 0-indexed, so 1 = February
    expect(getMonthRange(2026, 1)).toEqual({
      from: "2026-02-01",
      to: "2026-02-28",
    });
  });

  it("handles a leap-year February correctly", () => {
    expect(getMonthRange(2028, 1)).toEqual({
      from: "2028-02-01",
      to: "2028-02-29",
    });
  });

  it("rolls December over into the next year for the 'to' date", () => {
    expect(getMonthRange(2026, 11)).toEqual({
      from: "2026-12-01",
      to: "2026-12-31",
    });
  });
});

describe("groupSlotsByDay", () => {
  it("groups slots that fall on the same local calendar day", () => {
    const slots = [
      slot("2026-03-10T08:00:00.000Z", "2026-03-10T08:30:00.000Z"),
      slot("2026-03-10T09:00:00.000Z", "2026-03-10T09:30:00.000Z"),
      slot("2026-03-11T08:00:00.000Z", "2026-03-11T08:30:00.000Z"),
    ];
    const grouped = groupSlotsByDay(slots);
    expect(grouped.size).toBe(2);
    expect(grouped.get("2026-03-10")).toHaveLength(2);
    expect(grouped.get("2026-03-11")).toHaveLength(1);
  });

  it("returns an empty map for no slots", () => {
    expect(groupSlotsByDay([]).size).toBe(0);
  });
});

describe("isSameDay", () => {
  it("is true for two Dates on the same local day", () => {
    expect(isSameDay(new Date(2026, 5, 1, 2), new Date(2026, 5, 1, 22))).toBe(
      true,
    );
  });

  it("is false for two Dates on different days", () => {
    expect(isSameDay(new Date(2026, 5, 1), new Date(2026, 5, 2))).toBe(false);
  });
});

describe("isPast", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 5, 15, 12, 0, 0));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("is true for yesterday", () => {
    expect(isPast(new Date(2026, 5, 14))).toBe(true);
  });

  it("is false for today, even before the current time of day", () => {
    // isPast only compares calendar days (zeroes the time), so today at
    // 00:00 must not count as past even though "now" is 12:00.
    expect(isPast(new Date(2026, 5, 15))).toBe(false);
  });

  it("is false for tomorrow", () => {
    expect(isPast(new Date(2026, 5, 16))).toBe(false);
  });
});
