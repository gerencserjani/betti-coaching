import { createContext, useContext } from "react";

export interface NavLink {
  id: string;
  labelKey: string;
}

export interface Service {
  id: string;
  keyPrefix: string;
  hasChips: boolean;
}

export interface PriceRow {
  minutes: number;
  priceHuf: number;
}

export interface CoachImage {
  src: string;
  srcSet?: string;
}

export interface CoachContactInfo {
  address: string;
  street: string;
  mapsUrl: string;
  phoneDisplay: string;
  phoneHref: string;
  email: string;
}

/**
 * Everything a coach's own `apps/<coach>` app supplies to the shared
 * components in this package -- brand identity, images, nav structure, and
 * the structured (non-string) content each section needs. Short marketing
 * *strings* are deliberately NOT here: those stay in i18next (each app's own
 * locale JSON), consumed via `useTranslation()` directly inside the shared
 * components, with the i18n keys themselves as the stable contract. This
 * config exists for everything i18n doesn't fit -- images, structural data,
 * IDs -- see the architecture plan this was split out from for why.
 */
export interface CoachConfig {
  siteName: string;
  logo: string;
  heroImage: CoachImage;
  communityImage: CoachImage;
  navLinks: NavLink[];
  contactLink: NavLink;
  services: Service[];
  pricing: { freeCallMinutes: number; priceRows: PriceRow[] };
  communityCtaHref?: string;
  contact: CoachContactInfo;
}

export const CoachConfigContext = createContext<CoachConfig | null>(null);

export function useCoachConfig(): CoachConfig {
  const config = useContext(CoachConfigContext);
  if (!config) {
    throw new Error(
      "useCoachConfig() was called outside a <CoachConfigProvider> -- every app using @coaching/core must wrap its root in one.",
    );
  }
  return config;
}
