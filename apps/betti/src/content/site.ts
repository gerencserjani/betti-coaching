export const siteName = "Gerencsér Bernadett";

// Set via the VITE_SITE_URL env var (.env has the localhost dev default;
// production sets the real domain in the hosting platform's dashboard --
// see issue #26). Everything needing an absolute URL (canonical link,
// OG/Twitter tags, hreflang alternates, sitemap.xml, robots.txt) reads
// from this single constant.
export const siteUrl = import.meta.env.VITE_SITE_URL;
