import { expect, test } from "@playwright/test";

const DASHBOARD_URL_PATTERN = /\/dashboard$/;
const INVITE_URL_PATTERN = /\/invite\//;

test("owner can invite a member who signs up and accepts access", async ({ browser, page }, testInfo) => {
  const suffix = `${testInfo.project.name}-${Date.now()}`;
  const ownerEmail = `invite-owner-${suffix}@example.com`;
  const memberEmail = `invite-member-${suffix}@example.com`;
  const password = "Password123!";
  const organizationName = `Invite Studio ${suffix}`;

  await page.goto("/sign-up");
  await page.getByPlaceholder("Full name").fill("Invite Owner");
  await page.getByPlaceholder("you@example.com").fill(ownerEmail);
  await page.getByPlaceholder("Password").fill(password);
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page).toHaveURL(DASHBOARD_URL_PATTERN);

  await page.getByPlaceholder("Organization name").fill(organizationName);
  await page.getByRole("button", { exact: true, name: "Create" }).click();
  await expect(page.getByText(organizationName, { exact: true })).toBeVisible();

  await page.goto("/settings/members");
  await page.getByPlaceholder("member@example.com").fill(memberEmail);
  await page.getByRole("button", { name: "Send invite" }).click();
  const inviteLink = page.getByRole("link", { name: INVITE_URL_PATTERN });
  await expect(inviteLink).toBeVisible();
  const inviteUrl = await inviteLink.getAttribute("href");
  if (!inviteUrl) {
    throw new Error("Invitation URL was not returned.");
  }

  const memberContext = await browser.newContext();
  const memberPage = await memberContext.newPage();
  try {
    await memberPage.goto(inviteUrl);
    await memberPage.getByRole("button", { name: "Accept invitation" }).click();
    await memberPage.getByRole("link", { name: "Create account" }).click();
    await memberPage.getByPlaceholder("Full name").fill("Invited Member");
    await memberPage.getByPlaceholder("you@example.com").fill(memberEmail);
    await memberPage.getByPlaceholder("Password").fill(password);
    await memberPage.getByRole("button", { name: "Create account" }).click();
    await expect(memberPage).toHaveURL(INVITE_URL_PATTERN);

    await memberPage.getByRole("button", { name: "Accept invitation" }).click();
    await expect(memberPage).toHaveURL(DASHBOARD_URL_PATTERN);
    await expect(memberPage.getByText(organizationName, { exact: true })).toBeVisible();
  } finally {
    await memberContext.close();
  }
});
