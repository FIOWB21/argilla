import { expect, test } from "@playwright/test";
import {
  CLICK_AWAY_TEXT,
  mockClickAwayAnnotation,
} from "../annotation-mode-page/click-away.fixture";

// The .manual.ts name is excluded from the default automated test discovery.
test("manual annotation session — close Chromium to finish", async ({
  page,
  baseURL,
}) => {
  expect(["localhost", "127.0.0.1"]).toContain(new URL(baseURL).hostname);
  const { dataset } = await mockClickAwayAnnotation(page);

  await page.goto("/sign-in");
  const username = page.getByLabel("Username", { exact: true });
  // Nuxt can expose its loading page before the initial compilation finishes.
  await expect(username).toBeVisible({ timeout: 120000 });
  await username.fill("synthetic-annotator");
  await page.getByLabel("Password", { exact: true }).fill("synthetic-password");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await page.getByRole("heading", { name: dataset.name, exact: true }).click();
  await expect(page.getByText(CLICK_AWAY_TEXT, { exact: true })).toBeVisible();
  const decision = page.locator("[aria-label='Question: decision']");
  await decision.getByText("Yes", { exact: true }).click();
  await expect(decision.locator("input[name='Yes']")).toBeChecked();

  process.stdout.write(
    "MANUAL READY: use the Chromium window freely. Keep Notes empty while " +
      "testing click-away 1/2/3. API data is synthetic. " +
      "Close Chromium or press Ctrl+C in the terminal to finish.\n"
  );
  // Wait only for the user to close the page. No Inspector, keyboard actions,
  // assertions about manual results, or automatic session deadline follow.
  await page.waitForEvent("close", { timeout: 0 });
});
