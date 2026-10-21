export interface Service {
  id: string;
  keyPrefix: string;
  hasChips: boolean;
}

export const services: Service[] = [
  {
    id: "partnership",
    keyPrefix: "services.items.partnership",
    hasChips: false,
  },
  {
    id: "communication",
    keyPrefix: "services.items.communication",
    hasChips: true,
  },
  { id: "parenting", keyPrefix: "services.items.parenting", hasChips: true },
];
