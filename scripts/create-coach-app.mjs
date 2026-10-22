// Scaffolds apps/<slug> from apps/betti, the reference coach app -- the
// mechanical part of docs/new-coach-runbook.md's step 1. Everything this
// script can't know (real marketing copy, real assets, a real palette,
// backend Coach creation, Vercel/DNS setup) stays a manual step, covered by
// the runbook's steps 2-7; this script never invents content, it only
// copies structure and replaces coach-identifying values with obvious
// "TODO" placeholders so nothing of Betti's gets silently shipped under a
// different coach's name.
//
// Usage: node scripts/create-coach-app.mjs <coach-slug>
import {
  existsSync,
  mkdirSync,
  readdirSync,
  copyFileSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { join, extname } from "node:path";
import { fileURLToPath } from "node:url";

const TEMPLATE_APP = "betti";
const EXCLUDE_NAMES = new Set([
  "node_modules",
  "dist",
  "coverage",
  "playwright-report",
  "test-results",
  ".env.local",
  "CHANGELOG.md",
]);
const TEXT_EXTENSIONS = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".mjs",
  ".css",
  ".html",
  ".md",
]);
// Handled individually below -- skipped by the generic text-replace pass.
const INDIVIDUALLY_HANDLED = new Set([
  "package.json",
  "release.config.js",
  ".env",
  join("src", "content", "contact.ts"),
  join("src", "content", "pricing.ts"),
  join("src", "content", "community.ts"),
  join("src", "i18n", "locales", "hu.json"),
  join("src", "i18n", "locales", "en.json"),
  "README.md",
]);

const slug = process.argv[2];

if (!slug) {
  console.error("Usage: node scripts/create-coach-app.mjs <coach-slug>");
  console.error(
    "  <coach-slug>: lowercase letters/digits/hyphens, starting with a letter (e.g. eszter)",
  );
  process.exit(1);
}
if (!/^[a-z][a-z0-9-]*$/.test(slug)) {
  console.error(
    `Invalid slug "${slug}" -- use lowercase letters, digits, hyphens, starting with a letter.`,
  );
  process.exit(1);
}

const repoRoot = join(fileURLToPath(new URL(".", import.meta.url)), "..");
const templateDir = join(repoRoot, "apps", TEMPLATE_APP);
const targetDir = join(repoRoot, "apps", slug);

if (existsSync(targetDir)) {
  console.error(`apps/${slug} already exists -- refusing to overwrite.`);
  process.exit(1);
}

function copyDir(src, dest) {
  mkdirSync(dest, { recursive: true });
  for (const entry of readdirSync(src, { withFileTypes: true })) {
    if (EXCLUDE_NAMES.has(entry.name)) continue;
    const srcPath = join(src, entry.name);
    const destPath = join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      copyFileSync(srcPath, destPath);
    }
  }
}

function walkTextFiles(dir, relBase, fn) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const abs = join(dir, entry.name);
    const rel = join(relBase, entry.name);
    if (entry.isDirectory()) {
      walkTextFiles(abs, rel, fn);
    } else if (
      TEXT_EXTENSIONS.has(extname(entry.name)) &&
      !INDIVIDUALLY_HANDLED.has(rel)
    ) {
      fn(abs, rel);
    }
  }
}

// TODO-prefixes every string leaf in a locale JSON tree, keeping the key
// structure intact -- the keys are the real contract (packages/coaching-core
// reads them via useTranslation()), the values are Betti's voice and must
// never carry over silently.
function todoPrefixLocale(value) {
  if (typeof value === "string") return `TODO: ${value}`;
  if (Array.isArray(value)) return value.map(todoPrefixLocale);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [k, todoPrefixLocale(v)]),
    );
  }
  return value;
}

console.log(`Scaffolding apps/${slug} from apps/${TEMPLATE_APP}...`);
copyDir(templateDir, targetDir);

// package.json: workspace name + reset version
{
  const pkgPath = join(targetDir, "package.json");
  const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
  pkg.name = `${slug}-coaching`;
  pkg.version = "0.1.0";
  writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
}

// release.config.js: own tagFormat so this app's release tags never collide
// with betti-coaching's unprefixed v* tags or another coach's tags.
{
  const content = `export default {
  branches: ["main"],
  tagFormat: "${slug}-v\${version}",
  plugins: [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    "@semantic-release/changelog",
    [
      "@semantic-release/npm",
      {
        npmPublish: false,
      },
    ],
    "@semantic-release/github",
    [
      "@semantic-release/git",
      {
        assets: ["CHANGELOG.md", "package.json"],
        message: "chore(release): \${nextRelease.version} [skip ci]",
      },
    ],
  ],
};
`;
  writeFileSync(join(targetDir, "release.config.js"), content);
}

// .env: blank the coach-identifying values (name/title/description/coach id)
// -- VITE_SITE_URL/VITE_API_URL stay as localhost dev defaults, same as
// .env.example already has for every var.
{
  const envPath = join(targetDir, ".env");
  let content = readFileSync(envPath, "utf8");
  for (const key of [
    "VITE_SITE_NAME",
    "VITE_SITE_TITLE",
    "VITE_SITE_DESCRIPTION",
    "VITE_COACH_ID",
  ]) {
    content = content.replace(new RegExp(`^${key}=.*$`, "m"), `${key}=`);
  }
  writeFileSync(envPath, content);
}

// content/contact.ts: Betti's real address/phone must never carry over --
// replace with an obviously-fake placeholder shape, not just reformatted.
{
  const content = `import { siteUrl } from "./site";

// TODO: replace every value below with this coach's real contact info.
const mapsQuery = "TODO: street address, city";
const siteHostname = new URL(siteUrl).hostname;

export const contactInfo = {
  address: "TODO: full postal address",
  street: mapsQuery,
  mapsUrl: \`https://www.google.com/maps/search/?api=1&query=\${encodeURIComponent(mapsQuery)}\`,
  phoneDisplay: "TODO: +36 XX XXX XXXX",
  phoneHref: "tel:+36XXXXXXXXX",
  // Domain and mailbox come once a real domain is bought and email
  // forwarding is set up for it. Until then this reads whatever
  // VITE_SITE_URL currently resolves to.
  email: \`info@\${siteHostname}\`,
};
`;
  writeFileSync(join(targetDir, "src", "content", "contact.ts"), content);
}

// content/pricing.ts: a single obviously-placeholder row, not Betti's real
// prices -- real pricing is this coach's own business decision.
{
  const content = `import type { PriceRow } from "@coaching/core";

// TODO: replace with this coach's real pricing.
export const freeCallMinutes = 30;

export const priceRows: PriceRow[] = [
  { minutes: 60, priceHuf: 0 }, // TODO
];
`;
  writeFileSync(join(targetDir, "src", "content", "pricing.ts"), content);
}

// content/community.ts: no CTA by default -- Betti's Facebook group link
// must never carry over to another coach's site.
{
  const content = `// TODO: set this coach's own community link (Facebook group, Instagram,
// etc.), or leave undefined if there isn't one.
export const communityCtaHref: string | undefined = undefined;
`;
  writeFileSync(join(targetDir, "src", "content", "community.ts"), content);
}

// Locale files: every string value becomes "TODO: <betti's original text>"
// -- keeps the app visibly, obviously unfinished (shows up right in the UI)
// rather than silently shipping Betti's voice under someone else's name,
// while still giving the human a starting point to translate/rewrite from
// instead of an empty key.
for (const lang of ["hu", "en"]) {
  const localePath = join(targetDir, "src", "i18n", "locales", `${lang}.json`);
  const original = JSON.parse(readFileSync(localePath, "utf8"));
  writeFileSync(
    localePath,
    JSON.stringify(todoPrefixLocale(original), null, 2) + "\n",
  );
}

// README.md: replace the Betti-specific title/intro and production-domain
// line; everything else (tech stack, project structure, testing commands)
// is already generic once the text-replace pass below updates workspace
// names and paths.
{
  const readmePath = join(targetDir, "README.md");
  let content = readFileSync(readmePath, "utf8");
  content = content.replace(
    /^# Betti Coaching\n\nWebsite for [\s\S]*?see that repo's own README\)\.\n/,
    `# ${slug}-coaching\n\nTODO: replace this paragraph with a one-line description of this coach's site, same shape as the other apps' READMEs (who it's for, what it is, which backend it talks to).\n`,
  );
  content = content.replace(
    /Production domain: \*\*gerencserbernadettcoaching\.hu\*\*[\s\S]*$/,
    "Production domain: TODO -- fill in once DNS/Vercel are set up (see docs/new-coach-runbook.md step 6).\n",
  );
  content = content.replace(/apps\/betti/g, `apps/${slug}`);
  content = content.replace(/betti-coaching/g, `${slug}-coaching`);
  writeFileSync(readmePath, content);
}

// Generic text-replace pass over everything else: literal references to the
// template app's own folder/workspace name and its CoachConfig symbol name.
walkTextFiles(targetDir, "", (absPath) => {
  let content = readFileSync(absPath, "utf8");
  const replaced = content
    .replaceAll("apps/betti", `apps/${slug}`)
    .replaceAll("betti-coaching", `${slug}-coaching`)
    .replaceAll("bettiConfig", "coachConfig");
  if (replaced !== content) writeFileSync(absPath, replaced);
});

console.log(`Created apps/${slug}.`);
console.log("");
console.log("Next (see docs/new-coach-runbook.md for the full checklist):");
console.log(
  `  1. Fill in the TODOs in apps/${slug}/src/content/*.ts and src/i18n/locales/{hu,en}.json`,
);
console.log(`  2. Replace src/assets/* and public/* with this coach's real images`);
console.log(`  3. Fill in apps/${slug}/.env (VITE_SITE_NAME/TITLE/DESCRIPTION/COACH_ID)`);
console.log(`  4. Check the palette's contrast if colors change (runbook step 4)`);
console.log(`  5. Create the Coach via the invite flow (runbook step 5)`);
console.log(`  6. Set up the Vercel project + DNS (runbook step 6)`);
