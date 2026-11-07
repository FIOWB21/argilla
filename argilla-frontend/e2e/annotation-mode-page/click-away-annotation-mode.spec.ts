import { test, expect, Page } from "@playwright/test";
import { CLICK_AWAY_TEXT, mockClickAwayAnnotation } from "./click-away.fixture";

type KeyObservation = {
  key: string;
  activeTag: string;
  activeId: string;
  path: string[];
  questionIndex: number | null;
  userComesFromOutside: boolean;
};

declare global {
  interface Window {
    clickAwayKeys: KeyObservation[];
    clickAwayFocus: string[];
  }
}

test.use({ viewport: { width: 1600, height: 1200 } });

const openSyntheticAnnotation = async (page: Page, baseURL: string) => {
  expect(["localhost", "127.0.0.1"]).toContain(new URL(baseURL).hostname);
  const mocked = await mockClickAwayAnnotation(page);

  await page.goto("/sign-in");
  await page
    .getByLabel("Username", { exact: true })
    .fill("synthetic-annotator");
  await page.getByLabel("Password", { exact: true }).fill("synthetic-password");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await page
    .getByRole("heading", { name: mocked.dataset.name, exact: true })
    .click();
  await expect(page.getByText(CLICK_AWAY_TEXT, { exact: true })).toBeVisible();

  // The required Notes question keeps this record incomplete and prevents
  // auto-submit. Decision is last, so selecting an answer keeps it current.
  const decision = page.locator("[aria-label='Question: decision']");
  await decision.getByText("Yes", { exact: true }).click();
  await expect(decision.locator("input[name='Yes']")).toBeChecked();

  await page.evaluate(() => {
    window.clickAwayKeys = [];
    window.clickAwayFocus = [];
    for (const type of ["focusin", "focusout"]) {
      document.addEventListener(type, (event) => {
        const target = event.target as Element;
        window.clickAwayFocus.push(`${type}: ${target.tagName}#${target.id}`);
      });
    }
    document.addEventListener(
      "keydown",
      (event) => {
        const form = document.querySelector<
          HTMLElement & {
            __vue__?: {
              autofocusPosition: number | null;
              userComesFromOutside: boolean;
            };
          }
        >("form.questions-form");
        window.clickAwayKeys.push({
          key: event.key,
          activeTag: document.activeElement?.tagName ?? "",
          activeId: document.activeElement?.id ?? "",
          questionIndex: form?.__vue__?.autofocusPosition,
          userComesFromOutside: form?.__vue__?.userComesFromOutside,
          path: event
            .composedPath()
            .map((node) =>
              node instanceof Element
                ? `${node.tagName}.${Array.from(node.classList).join(".")}`
                : node.constructor.name
            ),
        });
      },
      true
    );
  });

  return { ...mocked, decision };
};

for (const area of ["record text", "background"] as const) {
  for (const [key, answer] of [
    ["1", "Yes"],
    ["2", "No"],
    ["3", "Not sure"],
  ]) {
    test(`select ${answer} with ${key} after clicking ${area} on the same record`, async ({
      page,
      baseURL,
    }, testInfo) => {
      const { decision, unexpectedRequests, responseWrites } =
        await openSyntheticAnnotation(page, baseURL);
      const initialURL = page.url();
      const priorKey = key === "2" ? "3" : "2";
      const priorAnswer = key === "2" ? "Not sure" : "No";

      // First prove that the real keyboard handler works before click-away.
      await page.keyboard.press(priorKey);
      await expect(
        decision.locator(`input[name='${priorAnswer}']`)
      ).toBeChecked();

      const safeArea =
        area === "record text"
          ? page.getByText(CLICK_AWAY_TEXT, { exact: true })
          : page.locator(".wrapper__records__header");
      expect(
        await safeArea.evaluate((element) =>
          element.closest(
            "input, textarea, select, button, a, [contenteditable='true']"
          )
        )
      ).toBeNull();
      await safeArea.click(
        area === "background" ? { position: { x: 4, y: 4 } } : {}
      );
      await expect(
        decision.locator(`input[name='${priorAnswer}']`)
      ).toBeChecked();
      expect(responseWrites).toEqual([]);
      await expect(page).toHaveURL(initialURL);
      await page.keyboard.press(key);

      try {
        await expect(page).toHaveURL(initialURL);
        await expect(
          page.getByText(CLICK_AWAY_TEXT, { exact: true })
        ).toBeVisible();
        expect(responseWrites).toEqual([]);
        expect(unexpectedRequests).toEqual([]);
        await expect(decision.locator(`input[name='${answer}']`)).toBeChecked({
          timeout: 1000,
        });
      } finally {
        await testInfo.attach("keyboard-focus", {
          body: JSON.stringify(
            await page.evaluate(() => ({
              keys: window.clickAwayKeys,
              focus: window.clickAwayFocus,
            })),
            null,
            2
          ),
          contentType: "application/json",
        });
      }
    });
  }
}

test("clicking an answer restores the existing keyboard handler", async ({
  page,
  baseURL,
}) => {
  const { decision, unexpectedRequests, responseWrites } =
    await openSyntheticAnnotation(page, baseURL);
  await page.getByText(CLICK_AWAY_TEXT, { exact: true }).click();
  await decision.getByText("No", { exact: true }).click();
  await page.keyboard.press("3");
  await expect(decision.locator("input[name='Not sure']")).toBeChecked();
  expect(responseWrites).toEqual([]);
  expect(unexpectedRequests).toEqual([]);
});

test("repeated safe clicks preserve the current question without selecting or scrolling", async ({
  page,
  baseURL,
}) => {
  const { decision, unexpectedRequests, responseWrites } =
    await openSyntheticAnnotation(page, baseURL);
  const initialURL = page.url();
  const areas = [
    page.getByText(CLICK_AWAY_TEXT, { exact: true }),
    page.locator(".wrapper__records__header"),
    decision.locator(".title-area[aria-label='Decision']"),
  ];
  for (const area of areas) {
    const scroll = await page.evaluate(() => [window.scrollX, window.scrollY]);
    await area.click({ position: { x: 4, y: 4 } });
    await area.click({ position: { x: 4, y: 4 } });
    await expect(decision.locator("input[name='Yes']")).toBeChecked();
    expect(await page.evaluate(() => [window.scrollX, window.scrollY])).toEqual(
      scroll
    );
    await page.keyboard.press("2");
    await expect(decision.locator("input[name='No']")).toBeChecked();
    await page.keyboard.press("1");
    await expect(decision.locator("input[name='Yes']")).toBeChecked();
  }
  await expect(page).toHaveURL(initialURL);
  expect(responseWrites).toEqual([]);
  expect(unexpectedRequests).toEqual([]);
});

test("clicking the text editor keeps digit input in the editor", async ({
  page,
  baseURL,
}) => {
  const { decision, unexpectedRequests, responseWrites } =
    await openSyntheticAnnotation(page, baseURL);
  const editor = page.locator(
    "[aria-label='Question: notes'] [contenteditable='true']"
  );
  await editor.click();
  await page.keyboard.type("123");
  await expect(editor).toHaveText("123");
  await expect(editor).toBeFocused();
  await expect(decision.locator("input[name='Yes']")).toBeChecked();
  expect(responseWrites).toEqual([]);
  expect(unexpectedRequests).toEqual([]);
});

test("modified digits are ignored after clicking away", async ({
  page,
  baseURL,
}) => {
  const { decision, unexpectedRequests, responseWrites } =
    await openSyntheticAnnotation(page, baseURL);
  await page.getByText(CLICK_AWAY_TEXT, { exact: true }).click();
  for (const modifier of ["Control", "Alt", "Meta", "Shift"]) {
    await page.keyboard.press(`${modifier}+2`);
    await expect(decision.locator("input[name='Yes']")).toBeChecked();
  }
  expect(responseWrites).toEqual([]);
  expect(unexpectedRequests).toEqual([]);
});

test("a numeric keypad digit selects once after clicking away", async ({
  page,
  baseURL,
  browserName,
}) => {
  test.skip(browserName !== "chromium", "Numeric keypad uses Chromium CDP");
  const { decision, unexpectedRequests, responseWrites } =
    await openSyntheticAnnotation(page, baseURL);
  await page.getByText(CLICK_AWAY_TEXT, { exact: true }).click();

  // Playwright 1.49 maps keyboard.press('Numpad2') to ArrowDown (NumLock off).
  // Send the OS-level numeric-mode key through the browser protocol instead.
  const keyboard = await page.context().newCDPSession(page);
  await keyboard.send("Input.dispatchKeyEvent", {
    type: "keyDown",
    key: "2",
    code: "Numpad2",
    windowsVirtualKeyCode: 98,
    isKeypad: true,
    text: "2",
  });
  await keyboard.send("Input.dispatchKeyEvent", {
    type: "keyUp",
    key: "2",
    code: "Numpad2",
    windowsVirtualKeyCode: 98,
    isKeypad: true,
  });
  await keyboard.detach();
  await expect(decision.locator("input[name='No']")).toBeChecked();
  expect(responseWrites).toEqual([]);
  expect(unexpectedRequests).toEqual([]);
});
