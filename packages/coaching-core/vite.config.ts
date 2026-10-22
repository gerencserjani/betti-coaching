/// <reference types="vitest/config" />
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// This package has no app build/dev target of its own -- apps/betti (and
// future apps/<coach> apps) consume its source directly via a Vite alias
// (see their own vite.config.ts), so this config exists only to run this
// package's own unit/component tests.
export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    css: false,
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
    },
  },
});
