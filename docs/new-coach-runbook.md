# Adding a new coach

What onboarding a new coach's site actually involves today, now that
`packages/coaching-core` holds everything coach-agnostic and `apps/betti`
is the one real example of how a per-coach app is put together.
`scripts/create-coach-app.mjs` (step 1) handles the mechanical scaffolding;
everything genuinely coach-specific (real copy, real assets, a real
palette, backend/Vercel/DNS setup) still needs a human, covered by steps
2-7 below.

## 1. Scaffold the app

```bash
npm run create-coach-app -- <coach-slug>
```

(a short, URL-safe name -- it becomes the npm workspace name too, e.g.
`eszter` -> `apps/eszter`, `eszter-coaching` workspace). This copies
`apps/betti` to `apps/<coach-slug>` (skipping `node_modules`, `dist`,
`coverage`, `playwright-report`, `test-results`, `.env.local`,
`CHANGELOG.md`), then replaces everything coach-identifying with obvious
`TODO` placeholders: `package.json`'s name/version, `release.config.js`'s
`tagFormat` (own tag namespace, so this app's release tags never collide
with `betti-coaching`'s unprefixed ones or another coach's), `.env`'s
site-name/title/description/coach-id, `content/{contact,pricing,community}.ts`,
and every string value in `i18n/locales/{hu,en}.json` (prefixed with
`TODO:` and Betti's original text as a starting point -- the keys are the
real contract, the values are Betti's voice and must never ship silently
under another coach's name). Run `npm install` afterwards to link the new
workspace. See `scripts/create-coach-app.mjs` for exactly what it does and
doesn't touch -- it's mechanical only, never invents real content.

The copy is picked up as its own workspace automatically (root
`package.json`'s `"workspaces": ["apps/*", "packages/*"]` is a glob) -- no
registration step.

## 2. Replace the coach-specific content

Step 1's script already pre-fills the genuinely coach-specific files with
`TODO:`-prefixed placeholders (`contact.ts`, `pricing.ts`, `community.ts`,
every locale string). `navLinks.ts` and `services.ts` are left as copied --
their "values" are structural (anchor ids, i18n key references), not
Betti's voice, so there's usually nothing coach-specific to change there
unless this coach's site needs different sections entirely. Grep for
`TODO:` across `apps/<coach-slug>/src/` to find everything that still needs
a real value:

- **`content/contact.ts`, `pricing.ts`, `community.ts`** -- real address/
  phone, real pricing, real community link (or `undefined`).
- **`i18n/locales/{hu,en}.json`** -- the actual marketing copy (headlines,
  service descriptions, etc.) in this coach's own voice, not Betti's
  original text left behind the `TODO:` prefix. The keys are the contract
  the shared components in `@coaching/core` read via `useTranslation()` --
  keep every key, change every value.
- **`coachConfig.ts`** -- assembles the above plus the images below into the
  `CoachConfig` object `main.tsx` provides via `CoachConfigProvider`. Should
  need no structural changes, just follows `content/*.ts`.
- **`assets/*`** -- logo, hero image (+ a smaller srcset variant), community
  image (+ srcset variant). Same filenames is simplest (fewer places to
  touch), but not required -- `coachConfig.ts` is the only place that
  imports them.
- **`public/`** -- `favicon.png`, `favicon-32.png`, `og-image.png`
  (1200×630, used for social link previews).

## 3. Set this app's environment variables

`apps/<coach-slug>/.env` (committed, no secrets) needs real values for:
`VITE_SITE_URL`, `VITE_API_URL`, `VITE_COACH_ID`, `VITE_SITE_NAME`,
`VITE_SITE_TITLE`, `VITE_SITE_DESCRIPTION` -- see that app's own README
(copied from `apps/betti/README.md`) for what each one does.
`VITE_GOOGLE_PLACES_API_KEY` goes in `.env.local` (gitignored) for local
dev and the hosting platform's dashboard for production, same as Betti's.

`VITE_COACH_ID` doesn't exist yet at this point -- comes from step 5.

## 4. Check the palette's contrast

If the new coach picks different brand colors (`src/index.css`'s
`:root`/`[data-theme="dark"]` custom properties), re-check contrast --
`--ink-soft` on `--bg-panel` has already had to be nudged once for this
exact reason (see that variable's own comment in `index.css`). A tool like
[WebAIM's contrast checker](https://webaim.org/resources/contrastchecker/)
against each `ink`/`ink-soft` + `bg`/`bg-card`/`bg-panel` pairing, in both
light and dark mode, covers it -- no tooling built for this yet, do it by
hand for now.

## 5. Backend: create the Coach

Via the existing invite flow (`coach-admin` tool, or the backend's own
invite endpoint) -- creates the `Coach` + `Settings` row atomically and
emails an accept-invite link. The resulting coach id is this app's
`VITE_COACH_ID` from step 3.

## 6. Deploy

- New Vercel project, **Root Directory** set to `apps/<coach-slug>`
  (Settings → Build and Deployment) -- this is what makes Vercel find that
  app's own `vercel.json`/`package.json` inside the monorepo. Leave
  "Include files outside the root directory in the Build Step" enabled
  (needed to reach `packages/coaching-core`).
- **Also override the Build Command** to `npm run build` on that same
  settings page. Required, not optional: Vercel's own Nx-monorepo
  auto-detection guesses the Nx project name from the _app's folder name_
  rather than its `package.json` name, and those two differ here (folder
  `apps/betti`, package name `betti-coaching`) -- confirmed by hitting
  `NX Cannot find project 'betti'` the first time this was set up. If the
  new app's folder name and `package.json` `"name"` happen to match
  exactly, this override may not be necessary -- but setting it anyway
  costs nothing and sidesteps the question.
- Set `VITE_SITE_URL`, `VITE_API_URL`, `VITE_COACH_ID`, `VITE_SITE_NAME`,
  `VITE_SITE_TITLE`, `VITE_SITE_DESCRIPTION`, `VITE_GOOGLE_PLACES_API_KEY`
  in that Vercel project's own dashboard, overriding the committed `.env`
  defaults for production.
- DNS for the real domain, pointed at Vercel.
- Add both the apex and `www` domains to the backend's `AllowedOrigin`
  allow-list (see `coach-calendar`'s own `CONTEXT.md`).
- **Set a proper "Ignored Build Step"** (Settings → Build and Deployment,
  below Root Directory) on _every_ coach's Vercel project once there are
  two or more apps -- not needed with only one app, since literally
  everything that could change necessarily affects the one app that
  exists. Vercel's own "Skip deployments when there are no changes to the
  root directory or its dependencies" toggle (already on) is **not
  sufficient on its own**: it infers "dependencies" from the package
  manager's dependency graph, but `apps/*` consume `@coaching/core` through
  a Vite/TS path alias (see `vite.config.ts`'s own comment on why), not a
  real `package.json` dependency entry -- so Vercel has no declared edge
  telling it that a `packages/coaching-core` change affects any given app,
  and would likely skip a deploy that should have happened. The correct
  fix is an Ignored Build Step script using Nx's own affected-detection,
  which reads the real import graph instead of package.json:
  ```bash
  npx nx show projects --affected --base=$VERCEL_GIT_PREVIOUS_SHA --head=$VERCEL_GIT_COMMIT_SHA | grep -qx betti-coaching && exit 1 || exit 0
  ```
  (swap `betti-coaching` for the new app's own `package.json` `"name"`;
  exit `1` tells Vercel to proceed with the build, exit `0` tells it to
  skip -- backwards from most CLIs, this is Vercel's own convention for
  this field.) Set this on **every** app's Vercel project, including
  `apps/betti`'s, at the same time -- not just the new one, since the gap
  applies equally to the existing app once a second one exists to diverge
  from it.

## 7. CI/release workflows -- already generic, nothing to do

`.github/workflows/ci.yml` runs `npx nx run-many -t lint test build test:e2e`
-- Nx auto-infers these targets from each project's own `package.json`
scripts and `run-many` silently skips projects that don't define a given
target (e.g. `@coaching/core` has no `build`/`test:e2e`). A new `apps/*`
project is picked up automatically, no workflow edit needed, as long as its
`package.json` has the usual `lint`/`test`/`build`/`test:e2e` scripts (true
by default if scaffolded from the generator, see step 1).

`.github/workflows/release.yml` loops over every `apps/*/` directory that has
its own `release.config.js` and runs `npx semantic-release` in it,
sequentially (avoids git-push races against `main` within the same job).
**Give every new app's `release.config.js` its own `tagFormat`** (e.g.
`tagFormat: "<slug>-v${version}"`, already done by the generator) so its
release tags never collide with another app's -- `apps/betti`'s own
`release.config.js` is the one exception, deliberately left on the default
unprefixed `v*` tag format since it already has 50+ real release tags under
that scheme and renaming it now would break its tag continuity for no
benefit.
