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

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("hu-HU", { dateStyle: "medium" });
}
