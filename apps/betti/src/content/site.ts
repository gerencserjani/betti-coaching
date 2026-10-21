// Set via the VITE_SITE_NAME env var (.env has Betti's current value; a new
// coach's app sets its own) -- the same value index.html's <head> reads for
// og:site_name, so the brand name shown in the UI (header logo alt text,
// footer copyright line, admin sidebar) and the one search engines/social
// previews see never drift apart.
export const siteName = import.meta.env.VITE_SITE_NAME;

// Set via the VITE_SITE_URL env var (.env has the localhost dev default;
// production sets the real domain in the hosting platform's dashboard --
// see issue #26). Everything needing an absolute URL (canonical link,
// OG/Twitter tags, hreflang alternates, sitemap.xml, robots.txt) reads
// from this single constant.
export const siteUrl = import.meta.env.VITE_SITE_URL;
