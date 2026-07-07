import { expect, type Page, type TestInfo } from "@playwright/test";

export const DASHBOARD_URL_PATTERN = /\/dashboard$/;
export const E2E_PASSWORD = "Password123!";

export const createTestSuffix = (testInfo: TestInfo) =>
  [
    testInfo.project.name,
    testInfo.parallelIndex,
    testInfo.retry,
    Date.now(),
  ].join("-");

export const signUp = async ({
  email,
  name,
  page,
}: {
  email: string;
  name: string;
  page: Page;
}) => {
  await page.goto("/sign-up");
  await page.getByPlaceholder("Full name").fill(name);
  await page.getByPlaceholder("you@example.com").fill(email);
  await page.getByPlaceholder("Password").fill(E2E_PASSWORD);
  const [response] = await Promise.all([
    page.waitForResponse((candidate) =>
      candidate.url().includes("/api/auth/sign-up/email")
    ),
    page.getByRole("button", { name: "Create account" }).click(),
  ]);

  if (!response.ok()) {
    throw new Error(
      `Signup failed with ${response.status()}: ${await response.text()}`
    );
  }

  await expect(page).toHaveURL(DASHBOARD_URL_PATTERN, { timeout: 15_000 });
};

export const createOrganization = async ({
  name,
  page,
}: {
  name: string;
  page: Page;
}) => {
  await page.getByPlaceholder("Organization name").fill(name);
  await page.getByRole("button", { exact: true, name: "Create" }).click();
  await expect(page.getByText(name, { exact: true })).toBeVisible();
};
