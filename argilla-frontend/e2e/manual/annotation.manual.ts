import { expect, test } from "@playwright/test";
import { MANUAL_TEXTS, mockManualRecords } from "./manual-records.fixture";

// The .manual.ts name is excluded from the default automated test discovery.
test("manual annotation session — close Chromium to finish", async ({
  page,
  baseURL,
}) => {
  expect(["localhost", "127.0.0.1"]).toContain(new URL(baseURL).hostname);
  const { dataset } = await mockManualRecords(page);

  await page.goto("/sign-in");
  const username = page.getByLabel("Username", { exact: true });
  // Nuxt can expose its loading page before the initial compilation finishes.
  await expect(username).toBeVisible({ timeout: 120000 });
  await username.fill("synthetic-annotator");
  await page.getByLabel("Password", { exact: true }).fill("synthetic-password");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await page.getByRole("heading", { name: dataset.name, exact: true }).click();
  await expect(page.getByText(MANUAL_TEXTS[0], { exact: true })).toBeVisible();
  await expect(page.locator("[aria-label='Question: notes']")).toHaveCount(0);

  process.stdout.write(
    "MANUAL READY: 10 synthetic records, one question, no Notes. " +
      "Use 1/2/3 to select and submit, or click an answer then Submit. " +
      "Responses live in memory only; restart to reset all records. " +
      "Close Chromium or press Ctrl+C in the terminal to finish.\n"
  );
  // Wait only for the user to close the page. No Inspector, keyboard actions,
  // assertions about manual results, or automatic session deadline follow.
  await page.waitForEvent("close", { timeout: 0 });
});
