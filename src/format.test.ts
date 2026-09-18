import { describe, expect, it } from "vitest";
import { formatPriceHuf } from "./format";

// hu-HU's Intl.NumberFormat grouping separator is a non-breaking space,
// visually indistinguishable from a regular space but not equal to one --
// built via fromCharCode rather than a literal/escaped character in source,
// since either is easy for tooling to silently mangle.
const NBSP = String.fromCharCode(160);

function withPlainSpaces(s: string): string {
  return s.split(NBSP).join(" ");
}

describe("formatPriceHuf", () => {
  it("returns the free label for zero", () => {
    expect(formatPriceHuf(0, "hu", "Díjmentes")).toBe("Díjmentes");
  });

  it("returns the free label for negative prices", () => {
    expect(formatPriceHuf(-100, "en", "Free")).toBe("Free");
  });

  it("formats a positive price with hu-HU grouping for a hu language tag", () => {
    expect(withPlainSpaces(formatPriceHuf(12500, "hu", "Díjmentes"))).toBe(
      "12 500 HUF",
    );
  });

  it("formats a positive price with en-US grouping for a non-hu language tag", () => {
    expect(formatPriceHuf(12500, "en", "Free")).toBe("12,500 HUF");
  });

  it("treats any hu-prefixed language tag (e.g. hu-HU) as Hungarian", () => {
    // Below 10,000 hu-HU's Intl grouping doesn't insert a separator at all
    // (a real ICU quirk, not a bug in formatPriceHuf) -- use a value well
    // above that threshold so this test actually exercises the grouping.
    expect(withPlainSpaces(formatPriceHuf(12500, "hu-HU", "Díjmentes"))).toBe(
      "12 500 HUF",
    );
  });
});
