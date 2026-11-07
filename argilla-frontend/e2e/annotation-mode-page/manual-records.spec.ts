import { expect, test } from "@playwright/test";
import {
  MANUAL_TEXTS,
  mockManualRecords,
} from "../manual/manual-records.fixture";

test("manual queue saves ten synthetic responses through the normal UI", async ({
  page,
  baseURL,
}) => {
  test.setTimeout(120000);
  expect(["localhost", "127.0.0.1"]).toContain(new URL(baseURL).hostname);
  const {
    dataset,
    records,
    answers,
    writes,
    unexpectedRequests,
    responseWrites,
  } = await mockManualRecords(page);
  await page.goto("/sign-in");
  const username = page.getByLabel("Username", { exact: true });
  await expect(username).toBeVisible({ timeout: 90000 });
  await username.fill("synthetic-annotator");
  await page.getByLabel("Password", { exact: true }).fill("synthetic-password");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await page.getByRole("heading", { name: dataset.name, exact: true }).click();
  await expect(page.locator("[aria-label='Question: notes']")).toHaveCount(0);
  await expect(page.getByText(MANUAL_TEXTS[0], { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Next (→)", exact: true }).click();
  await expect(page.getByText(MANUAL_TEXTS[1], { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Previous (←)", exact: true }).click();
  await expect(page.getByText(MANUAL_TEXTS[0], { exact: true })).toBeVisible();
  expect(answers.size).toBe(0);
  for (let index = 0; index < records.length; index++) {
    const text = page.getByText(MANUAL_TEXTS[index], { exact: true });
    await expect(text).toBeVisible();
    await text.click({ clickCount: (index % 3) + 1 });
    expect(answers.size).toBe(index);
    const saved = page.waitForResponse(
      (response) =>
        new URL(response.url()).pathname ===
        `/api/v1/records/${records[index].id}/responses`
    );
    await page.keyboard.press(String((index % 3) + 1));
    expect((await saved).status()).toBe(201);
    expect(writes).toHaveLength(index + 1);
    expect(answers.get(records[index].id)).toMatchObject({
      status: "submitted",
      values: { decision: { value: ["yes", "no", "not-sure"][index % 3] } },
    });
  }
  expect(answers.size).toBe(10);
  await page.locator(".filter-status button").click();
  await page.locator(".filter-status .option.submitted label").click();
  await expect(page.getByText(MANUAL_TEXTS[0], { exact: true })).toBeVisible();
  await expect(
    page.locator("[aria-label='Question: decision'] input[name='Yes']")
  ).toBeChecked();
  await page.reload();
  await expect(page.getByText(MANUAL_TEXTS[0], { exact: true })).toBeVisible();
  await expect(
    page.locator("[aria-label='Question: decision'] input[name='Yes']")
  ).toBeChecked();
  expect(unexpectedRequests).toEqual([]);
  expect(responseWrites).toEqual([]);
  expect(writes).toHaveLength(10);
  await page.close();
});
