export interface PriceRow {
  minutes: number;
  priceHuf: number;
}

// Keep in sync with the actual Cal.com event types once configured (#17).
export const freeCallMinutes = 30;

export const priceRows: PriceRow[] = [
  { minutes: 60, priceHuf: 10000 },
  { minutes: 75, priceHuf: 12500 },
  { minutes: 90, priceHuf: 15000 },
  { minutes: 105, priceHuf: 17500 },
  { minutes: 120, priceHuf: 20000 },
];
