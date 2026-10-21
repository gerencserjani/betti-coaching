import { describe, expect, it } from "vitest";
import {
  formatDate,
  formatPriceHuf,
  hhmmToMinutes,
  minutesToHHmm,
} from "./utils";

describe("minutesToHHmm / hhmmToMinutes", () => {
  it("round-trips whole hours", () => {
    expect(minutesToHHmm(540)).toBe("09:00");
    expect(hhmmToMinutes("09:00")).toBe(540);
  });

  it("round-trips a time with a non-zero minute part", () => {
    expect(minutesToHHmm(75)).toBe("01:15");
    expect(hhmmToMinutes("01:15")).toBe(75);
  });

  it("pads single-digit hours and minutes", () => {
    expect(minutesToHHmm(5)).toBe("00:05");
  });
});

describe("formatDate", () => {
  it("does not shift the date backward for a bare YYYY-MM-DD string", () => {
    // Regression test for a bug where `new Date("YYYY-MM-DD")` parses as
    // UTC midnight, which a negative-UTC-offset browser would then render
    // as the previous day -- formatDate must build the Date from local
    // year/month/day components instead, so this must show Jan 1, never
    // Dec 31.
    expect(formatDate("2026-01-01")).toBe("2026. jan. 1.");
  });

  it("formats an arbitrary date correctly", () => {
    expect(formatDate("2026-03-29")).toBe("2026. márc. 29.");
  });

  it("handles a full ISO datetime, not just a bare date -- the real shape AvailabilityOverride.date comes back as", () => {
    // Regression test: this used to produce "Invalid Date" because
    // splitting "2026-11-05T00:00:00.000Z" on "-" leaves the time/timezone
    // suffix glued onto the day ("05T00:00:00.000Z"), which Number()
    // can't parse.
    expect(formatDate("2026-11-05T00:00:00.000Z")).toBe("2026. nov. 5.");
  });
});

// hu-HU's Intl.NumberFormat grouping separator is a non-breaking space,
// visually indistinguishable from a regular space but not equal to one --
// built via fromCharCode rather than a literal/escaped character in source,
// since either is easy for tooling to silently mangle.
const NBSP = String.fromCharCode(160);

describe("formatPriceHuf (admin)", () => {
  it("returns null for null -- no price shown at all", () => {
    expect(formatPriceHuf(null)).toBeNull();
  });

  it("always formats in Hungarian regardless of caller", () => {
    expect(formatPriceHuf(0)).toBe("Díjmentes");
    expect(formatPriceHuf(12500)!.split(NBSP).join(" ")).toBe("12 500 HUF");
  });
});
