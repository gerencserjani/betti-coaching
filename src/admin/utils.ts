import { formatPriceHuf as formatPriceHufShared } from "../format";

export const WEEKDAY_LABELS: Record<number, string> = {
  1: "Hétfő",
  2: "Kedd",
  3: "Szerda",
  4: "Csütörtök",
  5: "Péntek",
  6: "Szombat",
  7: "Vasárnap",
};

export const LOCATION_LABELS: Record<string, string> = {
  IN_PERSON: "Személyesen",
  GOOGLE_MEET: "Google Meet",
  PHONE: "Telefon",
};

export const STATUS_LABELS: Record<string, string> = {
  CONFIRMED: "Aktív",
  CANCELLED: "Lemondva",
};

export function minutesToHHmm(minutes: number): string {
  const h = Math.floor(minutes / 60)
    .toString()
    .padStart(2, "0");
  const m = (minutes % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}

export function hhmmToMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("hu-HU", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

/** For a bare "YYYY-MM-DD" date (no time component), e.g. AvailabilityOverride.date. */
export function formatDate(isoDate: string): string {
  // `new Date("YYYY-MM-DD")` parses as UTC midnight, which
  // toLocaleDateString then renders back in the browser's local zone --
  // for a negative UTC offset that shows the previous day. Building the
  // Date from local year/month/day components instead sidesteps that.
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("hu-HU", {
    dateStyle: "medium",
  });
}

/** The admin UI is always Hungarian, unlike the public booking UI's formatPriceHuf. */
export function formatPriceHuf(priceHuf: number): string {
  return formatPriceHufShared(priceHuf, "hu", "Díjmentes");
}
