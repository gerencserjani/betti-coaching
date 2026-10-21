// ESLint's flat config (eslint.config.js) doesn't cascade up from a
// subdirectory the way the old .eslintrc did -- each workspace that gets
// linted needs its own config, so a staged-file glob can't just shell out
// to a single root `eslint --fix`. Route each app's files through its own
// `lint:fix` script instead (function form, since a plain package.json
// "lint-staged" field can't express per-workspace routing).
export default {
  "apps/betti/**/*.{js,jsx,ts,tsx}": () =>
    "npm run lint:fix --workspace=betti-coaching",
  "**/*.{js,jsx,ts,tsx,json,css,md}": "prettier --write",
};
