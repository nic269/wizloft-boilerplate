import { expect, test } from "@playwright/test";

const DASHBOARD_URL_PATTERN = /\/dashboard$/;
const SIGN_IN_URL_PATTERN = /\/sign-in$/;

test("user can sign up, view dashboard session, and sign out", async ({
  page,
}, testInfo) => {
  const email = `auth-smoke-${testInfo.project.name}-${Date.now()}@example.com`;
  const password = "Password123!";

  await page.goto("/sign-up");
  await page.getByPlaceholder("Full name").fill("Auth Smoke");
  await page.getByPlaceholder("you@example.com").fill(email);
  await page.getByPlaceholder("Password").fill(password);
  await page.getByRole("button", { name: "Create account" }).click();

  await expect(page).toHaveURL(DASHBOARD_URL_PATTERN);
  await expect(page.getByText(email, { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page).toHaveURL(SIGN_IN_URL_PATTERN);
  await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible();
});
