import { priceRows } from "../content/pricing";

// Prices aren't stored on the backend EventType -- they're looked up by
// duration against the same static table the Pricing section uses. A
// service whose duration isn't in that table (a genuinely new offering)
// just won't show a price here, which is fine: the site owner can still
// create it freely, it just won't get an automatic price yet.
export function getPriceHuf(durationMinutes: number): number | undefined {
  return priceRows.find((row) => row.minutes === durationMinutes)?.priceHuf;
}

export function formatHuf(amount: number, language: string): string {
  const locale = language.startsWith("hu") ? "hu-HU" : "en-US";
  return `${new Intl.NumberFormat(locale).format(amount)} HUF`;
}
