/** Shared by both the admin UI (always hu-HU) and the public booking UI
 * (locale follows the visitor's language) -- keep this as the one
 * implementation so the two don't drift into inconsistent formatting.
 *
 * `null` returns `null` (render nothing -- the coach chose not to show a
 * price for this service at all, e.g. because they price things on a
 * separate page of their own site), distinct from `0` (render the free
 * label -- an explicit, deliberate "this costs nothing"). Callers must
 * render nothing themselves when this returns `null`, not fall back to any
 * other label. */
export function formatPriceHuf(
  priceHuf: number | null,
  language: string,
  freeLabel: string,
): string | null {
  if (priceHuf === null) return null;
  if (priceHuf <= 0) return freeLabel;
  const locale = language.startsWith("hu") ? "hu-HU" : "en-US";
  return `${new Intl.NumberFormat(locale).format(priceHuf)} HUF`;
}
