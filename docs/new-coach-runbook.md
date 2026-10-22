# Adding a new coach

What onboarding a new coach's site actually involves today, now that
`packages/coaching-core` holds everything coach-agnostic and `apps/betti`
is the one real example of how a per-coach app is put together. There's no
generator/scaffold script yet -- `apps/betti` **is** the template, copied
by hand. Build one once this runbook has actually been run at least once
for real; writing it against zero real second-coach requirements would be
guessing.

## 1. Scaffold the app

Copy `apps/betti` to `apps/<coach-slug>` (a short, URL-safe name -- it
becomes the npm workspace name too, e.g. `apps/eszter`). Don't copy:
`node_modules`, `dist`, `coverage`, `playwright-report`, `test-results`,
`.env.local`, `CHANGELOG.md` (semantic-release generates a fresh one).

The copy is picked up as its own workspace automatically (root
`package.json`'s `"workspaces": ["apps/*", "packages/*"]` is a glob) -- no
registration step.

## 2. Replace the coach-specific content

Everything in `apps/<coach-slug>/src/`:

- **`content/*.ts`** -- `navLinks.ts`, `services.ts`, `pricing.ts`,
  `community.ts`, `contact.ts`. Keep the shape (the types come from
  `@coaching/core`), replace the values.
- **`coachConfig.ts`** -- assembles the above plus the images below into the
  `CoachConfig` object `main.tsx` provides via `CoachConfigProvider`. Should
  need no structural changes, just follows `content/*.ts`.
- **`i18n/locales/{hu,en}.json`** -- the actual marketing copy (headlines,
  service descriptions, etc.) in this coach's own voice, not Betti's with
  find-replace. The keys are the contract the shared components in
  `@coaching/core` read via `useTranslation()` -- keep every key, change
  every value.
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

## 7. CI/release workflows -- not yet generic

`.github/workflows/ci.yml` and `release.yml` currently hardcode
`--workspace=betti-coaching` / `working-directory: apps/betti`. They need a
matching block added for the new app (or turning into an
Nx-affected-based/matrix workflow that covers every `apps/*` automatically)
-- not done proactively here since there was only one real app to write
these against. Do this as part of adding the second app, not before.
