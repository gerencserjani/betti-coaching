import { siteUrl } from "./site";

const mapsQuery = "Üstökös utca, Szeged";
const siteHostname = new URL(siteUrl).hostname;

export const contactInfo = {
  address: "6724 Szeged, Üstökös utca",
  street: mapsQuery,
  mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapsQuery)}`,
  phoneDisplay: "+36 30 548 8351",
  phoneHref: "tel:+36305488351",
  // Domain and mailbox both come once a real domain is bought and email
  // forwarding is set up for it (see issue #26) -- until then this reads
  // whatever VITE_SITE_URL currently resolves to.
  email: `info@${siteHostname}`,
};
