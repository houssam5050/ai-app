import { test, expect } from "@playwright/test";

// Main user journey: landing → catalog → sign-in wall → verification page.
// Requires seeded DB for full learning-path assertions; keeps unauthenticated
// flows green without credentials.
test("landing links to catalog", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /learn data skills/i })).toBeVisible();
  await page.getByRole("link", { name: /browse courses/i }).click();
  await expect(page).toHaveURL(/\/courses/);
});

test("dashboard redirects unauthenticated users to sign in", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/signin/);
});

test("certificate verification handles unknown IDs", async ({ page }) => {
  await page.goto("/verify?id=does-not-exist");
  // Without a DB the page reports unavailability; with a DB it reports no match.
  await expect(
    page.getByText(/no valid certificate|temporarily unavailable/i),
  ).toBeVisible();
});
