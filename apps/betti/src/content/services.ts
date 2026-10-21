import type { Service } from "@coaching/core";

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
