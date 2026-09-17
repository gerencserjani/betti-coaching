export function formatPriceHuf(
  priceHuf: number,
  language: string,
  freeLabel: string,
): string {
  if (priceHuf <= 0) return freeLabel;
  const locale = language.startsWith("hu") ? "hu-HU" : "en-US";
  return `${new Intl.NumberFormat(locale).format(priceHuf)} HUF`;
}
