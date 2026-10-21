// Generates robots.txt and sitemap.xml into dist/ after the production
// build, using VITE_SITE_URL so the real domain never has to be hardcoded
// or hand-edited in a static file. Writes to dist/ (not public/) so a
// local build with the .env dev default never dirties tracked source
// files -- see the "SEO basics" issue (#24) and its env-var follow-up.
import { writeFileSync } from "node:fs";
import { loadEnv } from "vite";

const env = loadEnv("production", process.cwd(), "VITE_");
const siteUrl = env.VITE_SITE_URL;

if (!siteUrl) {
  console.error("VITE_SITE_URL is not set -- skipping robots.txt/sitemap.xml generation.");
  process.exit(1);
}

const robotsTxt = `User-agent: *
Allow: /

Sitemap: ${siteUrl}/sitemap.xml
`;

const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <url>
    <loc>${siteUrl}/</loc>
    <xhtml:link rel="alternate" hreflang="hu" href="${siteUrl}/?lang=hu" />
    <xhtml:link rel="alternate" hreflang="en" href="${siteUrl}/?lang=en" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${siteUrl}/" />
  </url>
</urlset>
`;

writeFileSync("dist/robots.txt", robotsTxt);
writeFileSync("dist/sitemap.xml", sitemapXml);

console.log(`Generated dist/robots.txt and dist/sitemap.xml for ${siteUrl}`);
