/// <reference types="vitest/config" />
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: [
      // Resolves straight to packages/coaching-core/src as ordinary app
      // source (not a real npm dependency under node_modules) -- avoids any
      // question of whether Vite applies its usual TSX/JSX transform to
      // node_modules content. A subpath import like
      // "@coaching/core/admin/AdminApp.tsx" resolves the same way, which is
      // how apps/betti's own lazy()-loaded admin routes reach it without
      // pulling admin code into this app's main chunk via the barrel.
      {
        find: "@coaching/core",
        replacement: fileURLToPath(
          new URL("../../packages/coaching-core/src", import.meta.url),
        ),
      },
    ],
  },
  test: {
    // No unit/component tests live in this app -- they all moved to
    // packages/coaching-core along with the code they test. Keeping this
    // block (rather than deleting it) means `npm test` here still works, it
    // just currently has nothing to run.
    passWithNoTests: true,
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "**/cypress/**",
      "**/.{idea,git,cache,output,temp}/**",
      "**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build,playwright}.config.*",
      "**/e2e/**",
    ],
  },
});
