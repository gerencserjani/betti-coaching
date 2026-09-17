/** Shared by both the admin UI (always hu-HU) and the public booking UI
 * (locale follows the visitor's language) -- keep this as the one
 * implementation so the two don't drift into inconsistent formatting. */
export function formatPriceHuf(
  priceHuf: number,
  language: string,
  freeLabel: string,
): string {
  if (priceHuf <= 0) return freeLabel;
  const locale = language.startsWith("hu") ? "hu-HU" : "en-US";
  return `${new Intl.NumberFormat(locale).format(priceHuf)} HUF`;
}
