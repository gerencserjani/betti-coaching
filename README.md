# Betti Coaching

Website for **Gerencsér Bernadett**, a family & couples communication coach based in Szeged, Hungary. One-page marketing site covering her services, pricing, and booking, built to replace an earlier static HTML/CSS prototype with a proper React app.

## Tech stack

- **React 19** + **TypeScript**
- **Vite** — dev server & build
- **Tailwind CSS v4**
- **Cal.com** — booking/scheduling (planned integration, replacing the old prototype's mock calendar)
- **react-i18next** — Hungarian (default) / English localization (planned)
- **ESLint + Prettier + Husky/lint-staged** — linting & formatting on commit
- **semantic-release** — automated versioning and changelog from conventional commits, on every push to `main`

## Getting started

```bash
npm install
npm run dev       # start the dev server
npm run build     # type-check and build for production
npm run lint       # run ESLint
npm run preview    # preview the production build locally
```

## Project structure

```
src/
  components/   shared UI pieces (Header, Footer, ThemeToggle, icons, ...)
  sections/     one component per page section (Hero, Services, Pricing, Booking, Contact, ...)
  hooks/        custom hooks (theme, scroll-spy, reveal-on-scroll)
  content/      site copy & data, per locale (hu/en)
  i18n/         i18n setup and locale resources
  assets/       images, logo
```

## Project workflow

Work is tracked as [GitHub issues](https://github.com/gerencserjani/betti-coaching/issues) on the [project board](https://github.com/users/gerencserjani/projects/1), one issue per feature/section. This repo includes a few Claude Code slash commands to drive that workflow end to end:

- **`/start-issue <number>`** — creates a feature branch from a GitHub issue and moves it to "In Progress" on the board.
- **`/test-issue [number]`** — checks the current branch's changes against the issue's acceptance criteria (plus lint/build) and reports whether it's ready to ship.
- **`/end-issue [number]`** — runs `/test-issue` as a gate, then commits, pushes, opens a PR, and moves the issue to "Done" on the board.

Commit messages follow [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `chore:`, ...) so `semantic-release` can version and release automatically.

## Deployment

Not yet configured — see the "Set up production deployment" issue on the board.
