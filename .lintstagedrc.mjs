// ESLint's flat config (eslint.config.js) doesn't cascade up from a
// subdirectory the way the old .eslintrc did -- each workspace that gets
// linted needs its own config, so a staged-file glob can't just shell out
// to a single root `eslint --fix`. Route each workspace's files through its
// own `lint:fix` script instead (function form, since a plain package.json
// "lint-staged" field can't express per-workspace routing).
//
// Every entry here is function-form, ignoring the staged-file list lint-staged
// would otherwise append as CLI args -- a large commit (e.g. this repo's own
// monorepo migration, 100+ files in one commit) blows past Windows' ~8K
// command-line length limit otherwise ("command line is too long"). Each
// underlying tool already resolves its own file set from its config, so
// nothing is lost by not passing the staged list explicitly.
export default {
  "apps/betti/**/*.{js,jsx,ts,tsx}": () =>
    "npm run lint:fix --workspace=betti-coaching",
  "packages/coaching-core/**/*.{js,jsx,ts,tsx}": () =>
    "npm run lint:fix --workspace=@coaching/core",
  "**/*.{js,jsx,ts,tsx,json,css,md}": () => "prettier --write .",
};
