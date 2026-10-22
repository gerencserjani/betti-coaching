# coach-monorepo

A monorepo for coach-facing marketing + booking sites, each sharing the same
components, admin dashboard, and booking flow via `packages/coaching-core`,
customized per coach in its own `apps/<coach>` app. This replaces the old
model of forking the whole repo per coach — a new coach's site is
_configured_, not _re-skinned by hand_.

## Layout

```
apps/
  betti/              Gerencsér Bernadett's site — see apps/betti/README.md
packages/
  coaching-core/       shared admin dashboard, booking wizard, components,
                       hooks, API client, i18n infrastructure, and the
                       CoachConfig contract each app supplies
```

Each app in `apps/*` is its own npm workspace with its own `package.json`,
`vite.config.ts`, tests, and Vercel project — see that app's own README for
how to run and deploy it specifically.

## Getting started

```bash
npm install                                  # once, from the repo root -- installs every workspace
npm run dev --workspace=betti-coaching       # or: cd apps/betti && npm run dev
```

Every app's scripts (`dev`, `build`, `lint`, `test`, `test:e2e`, ...) are run
the same way: `npm run <script> --workspace=<app-package-name>` from the
root, or directly from inside that app's folder.

## Nx

This repo uses [Nx](https://nx.dev) for task caching and running tasks
across apps (`npx nx run <project>:<target>`, `npx nx show projects`). It's
a thin layer on top of each app's own npm scripts — nothing here requires
Nx-specific knowledge to work on a single app; it mainly pays off once
`npm run build`/`lint`/`test` are run across _all_ apps at once (e.g. in CI)
and Nx can skip the ones that didn't change.

## Shared backend

All apps talk to the same backend — [coach-calendar](https://github.com/gerencserjani/coach-calendar)
(NestJS, Google Cloud Run), which is already multi-coach: each app's
`VITE_COACH_ID` env var is the join key to that coach's row.

## Adding a new coach

See [`docs/new-coach-runbook.md`](docs/new-coach-runbook.md). There's no
generator/scaffold script yet — `apps/betti` is the template, copied by
hand; the runbook walks through what to replace, what env vars a new app
needs, and the deploy/backend/DNS steps.

