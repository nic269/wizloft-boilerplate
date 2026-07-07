import { expect, test } from "@playwright/test";
import { createTestSuffix, signUp } from "./support/user-flows";

const SIGN_IN_URL_PATTERN = /\/sign-in$/;

test("user can sign up, view dashboard session, and sign out", async ({
  page,
}, testInfo) => {
  const email = `auth-smoke-${createTestSuffix(testInfo)}@example.com`;

  await signUp({ email, name: "Auth Smoke", page });
  await expect(page.getByText(email, { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page).toHaveURL(SIGN_IN_URL_PATTERN);
  await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible();
});
