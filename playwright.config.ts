import { defineConfig, devices } from "@playwright/test";

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: "http://localhost:5173",
    trace: "on-first-retry",
    // The site's real audience is Hungarian; without this the i18n language
    // detector falls back to the browser's default locale (English here),
    // and every Hungarian-text assertion below would need its own ?lang=hu.
    locale: "hu-HU",
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  // --strictPort so a busy 5173 (this repo has had multiple stray dev
  // servers pile up before -- see the audit-fixes session) fails loudly
  // instead of Vite silently picking a different port that baseURL above
  // wouldn't match.
  webServer: {
    command: "npm run dev -- --port 5173 --strictPort",
    url: "http://localhost:5173",
    reuseExistingServer: !process.env.CI,
  },
});
