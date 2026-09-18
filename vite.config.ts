/// <reference types="vitest/config" />
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    css: false,
    // Vitest's default include glob is project-wide and would otherwise
    // also pick up e2e/*.spec.ts -- those use @playwright/test's own
    // test()/expect(), which fail confusingly (not a clean "wrong runner"
    // error) when executed through Vitest instead of `playwright test`.
    // Keeping Vitest's own default excludes and adding e2e/ to them,
    // rather than replacing the list outright.
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "**/cypress/**",
      "**/.{idea,git,cache,output,temp}/**",
      "**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build,playwright}.config.*",
      "**/e2e/**",
    ],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
    },
  },
});
