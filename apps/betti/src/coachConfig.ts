import type { CoachConfig } from "@coaching/core";
import { siteName } from "./content/site";
import { navLinks, contactLink } from "./content/navLinks";
import { services } from "./content/services";
import { freeCallMinutes, priceRows } from "./content/pricing";
import { communityCtaHref } from "./content/community";
import { contactInfo } from "./content/contact";
import brandLogo from "./assets/brand-logo.webp";
import heroArt from "./assets/hero-art.webp";
import heroArtSmall from "./assets/hero-art-560w.webp";
import communityArt from "./assets/community-art.webp";
import communityArtSmall from "./assets/community-art-520w.webp";

export const bettiConfig: CoachConfig = {
  siteName,
  logo: brandLogo,
  heroImage: {
    src: heroArt,
    srcSet: `${heroArtSmall} 560w, ${heroArt} 720w`,
  },
  communityImage: {
    src: communityArt,
    srcSet: `${communityArtSmall} 520w, ${communityArt} 700w`,
  },
  navLinks,
  contactLink,
  services,
  pricing: { freeCallMinutes, priceRows },
  communityCtaHref,
  contact: contactInfo,
};
