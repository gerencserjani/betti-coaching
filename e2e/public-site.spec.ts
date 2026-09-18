import { expect, test } from "@playwright/test";

// Backend-independent smoke tests: real browser, real routing, real static
// content, but nothing here talks to the calendar backend -- exercising the
// booking/admin flows for real needs a seeded backend reachable from CI,
// which is a separate infrastructure decision (see #65's PR description).

test("homepage loads with the hero heading and nav", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Időpontfoglalás" }),
  ).toBeVisible();
});

test("nav link scrolls to the booking section", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("link", { name: "Időpontfoglalás" }).click();
  await expect(page.locator("#idopontfoglalas")).toBeInViewport();
});

test("language switcher changes visible text and updates the URL", async ({
  page,
}) => {
  await page.goto("/");

  await expect(
    page.getByRole("link", { name: "Időpontfoglalás" }),
  ).toBeVisible();

  await page.getByRole("button", { name: "en", exact: true }).click();

  await expect(
    page.getByRole("link", { name: "Book a session" }),
  ).toBeVisible();
  await expect(page).toHaveURL(/lang=en/);
});

test("theme toggle switches the color scheme", async ({ page }) => {
  await page.goto("/");

  const toggle = page.getByRole("button", {
    name: /dark|light|sötét|világos/i,
  });
  const before = await page.locator("html").getAttribute("data-theme");

  await toggle.click();

  await expect
    .poll(() => page.locator("html").getAttribute("data-theme"))
    .not.toBe(before);
});

test("bare /admin redirects to the login page instead of a blank screen", async ({
  page,
}) => {
  // Regression test for a routing bug found while deploying today: AdminApp
  // had no route for the bare /admin path, and App.tsx's Suspense fallback
  // is null, so the page went completely blank with no console error.
  await page.goto("/admin");

  await expect(page).toHaveURL(/\/admin\/login$/);
  await expect(
    page.getByRole("heading", { name: "Bejelentkezés" }),
  ).toBeVisible();
});

test("admin login page has no failed requests and no console errors on load", async ({
  page,
}) => {
  const consoleErrors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });
  const failedRequests: string[] = [];
  page.on("requestfailed", (req) => failedRequests.push(req.url()));

  await page.goto("/admin/login");
  await expect(
    page.getByRole("heading", { name: "Bejelentkezés" }),
  ).toBeVisible();

  expect(consoleErrors).toEqual([]);
  expect(failedRequests).toEqual([]);
});
