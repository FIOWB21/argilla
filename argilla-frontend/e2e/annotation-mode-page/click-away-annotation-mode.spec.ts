import { test, expect, Locator, Page } from "@playwright/test";
import {
  CLICK_AWAY_TEXT,
  ClickAwayOptions,
  mockClickAwayAnnotation,
} from "./click-away.fixture";

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
    choiceChanges: string[];
  }
}

test.use({ viewport: { width: 1600, height: 1200 } });

const openSyntheticAnnotation = async (
  page: Page,
  baseURL: string,
  options: ClickAwayOptions = {}
) => {
  expect(["localhost", "127.0.0.1"]).toContain(new URL(baseURL).hostname);
  const mocked = await mockClickAwayAnnotation(page, options);

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
  await decision.locator(".input-button label").first().click();
  await expect(decision.locator(".input-button input").first()).toBeChecked();

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

const observeChoiceChanges = async (page: Page) => {
  await page.evaluate(() => {
    window.choiceChanges = [];
    document.addEventListener("change", (event) => {
      const target = event.target as HTMLInputElement;
      if (target.matches(".input-button input")) {
        window.choiceChanges.push(target.id);
      }
    });
  });
};

const reachChoiceWithTab = async (page: Page, choice: Locator) => {
  // WebKit does not always focus a checkbox when its label is clicked.
  // Establish a real keyboard focus before testing loss of that focus.
  for (let step = 0; step < 30; step++) {
    if (
      await choice.evaluate((element) => element === document.activeElement)
    ) {
      break;
    }
    await page.keyboard.press("Tab");
  }
  await expect(choice).toBeFocused();
};

test("record search accepts digits without selecting answers", async ({
  page,
  baseURL,
}) => {
  const { decision, responseWrites, unexpectedRequests } =
    await openSyntheticAnnotation(page, baseURL);
  await observeChoiceChanges(page);
  await page.locator(".search-area__icon.--search").click();
  const search = page.locator(".search-area__input");
  await expect(search).toBeFocused();
  await page.keyboard.type("123");
  await expect(search).toHaveValue("123");
  await expect(search).toBeFocused();
  await expect(decision.locator("input[name='Yes']")).toBeChecked();
  expect(await page.evaluate(() => window.choiceChanges)).toEqual([]);
  expect(responseWrites).toEqual([]);
  expect(unexpectedRequests).toEqual([]);
});

test("label search keeps digits and forgets the previous choice focus", async ({
  page,
  baseURL,
}) => {
  const { decision, responseWrites, unexpectedRequests } =
    await openSyntheticAnnotation(page, baseURL, { searchable: true });
  await observeChoiceChanges(page);
  const search = decision.locator("input.search-input");
  await search.click();
  await page.keyboard.type("123");
  await expect(search).toHaveValue("123");
  await expect(search).toBeFocused();
  await search.fill("");
  await expect(decision.locator("input[name='Yes']")).toBeChecked();
  await page.getByText(CLICK_AWAY_TEXT, { exact: true }).click();
  await page.keyboard.press("2");
  await expect(decision.locator("input[name='Yes']")).toBeChecked();
  expect(await page.evaluate(() => window.choiceChanges)).toEqual([]);
  expect(responseWrites).toEqual([]);
  expect(unexpectedRequests).toEqual([]);
});

test("an open record dropdown keeps digits away from annotation choices", async ({
  page,
  baseURL,
}) => {
  const { decision, responseWrites, unexpectedRequests } =
    await openSyntheticAnnotation(page, baseURL);
  await observeChoiceChanges(page);
  const menuButton = page.locator("button.record-menu__header");
  await menuButton.click();
  const menu = page.locator(".record-menu .dropdown__content");
  await expect(menu).toBeVisible();
  await expect(menuButton).toBeFocused();
  await page.keyboard.press("2");
  await page
    .locator(".record-menu__content")
    .click({ position: { x: 2, y: 2 } });
  await expect(menu).toBeVisible();
  await page.keyboard.press("3");
  await expect(decision.locator("input[name='Yes']")).toBeChecked();
  expect(await page.evaluate(() => window.choiceChanges)).toEqual([]);
  expect(responseWrites).toEqual([]);
  expect(unexpectedRequests).toEqual([]);
});

test("Tab, Shift+Tab, Space and question arrows retain their existing behavior", async ({
  page,
  baseURL,
}) => {
  const { decision, responseWrites, unexpectedRequests } =
    await openSyntheticAnnotation(page, baseURL);
  const yes = decision.locator("input[name='Yes']");
  const no = decision.locator("input[name='No']");
  const unsure = decision.locator("input[name='Not sure']");
  await page.getByText(CLICK_AWAY_TEXT, { exact: true }).click();
  await expect(yes).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(no).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(yes).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(unsure).toBeFocused();
  await page.keyboard.press("Space");
  await expect(unsure).toBeChecked();
  await page.keyboard.press("ArrowUp");
  const editor = page.locator(
    "[aria-label='Question: notes'] [contenteditable]"
  );
  await expect(editor).toBeFocused();
  await page.keyboard.press("ArrowDown");
  // Editor arrows move the caret; Escape exits editing before question navigation.
  await expect(editor).toBeFocused();
  await page.keyboard.press("Escape");
  await page.keyboard.press("ArrowDown");
  await expect(yes).toBeFocused();
  // The required Notes answer is empty, so Enter must not submit this record.
  await page.keyboard.press("Enter");
  await expect(unsure).toBeChecked();
  expect(responseWrites).toEqual([]);
  expect(unexpectedRequests).toEqual([]);
});

for (const choiceType of ["multi_label_selection", "rating"] as const) {
  test(`${choiceType} handles each digit once after background clicks`, async ({
    page,
    baseURL,
  }) => {
    const { decision, responseWrites, unexpectedRequests } =
      await openSyntheticAnnotation(page, baseURL, { choiceType });
    await observeChoiceChanges(page);
    const choices = decision.locator(".input-button input");
    await reachChoiceWithTab(page, choices.nth(0));
    const text = page.getByText(CLICK_AWAY_TEXT, { exact: true });
    await text.click();
    for (const modifier of ["Control", "Alt", "Meta", "Shift"]) {
      await page.keyboard.press(`${modifier}+2`);
      await expect(choices.nth(0)).toBeChecked();
    }
    expect(await page.evaluate(() => window.choiceChanges)).toEqual([]);
    await page.keyboard.press("2");
    await expect(choices.nth(1)).toBeChecked();
    await expect(choices.nth(0)).toBeChecked({
      checked: choiceType === "multi_label_selection",
    });
    await text.click();
    await page.keyboard.press("2");
    await expect(choices.nth(1)).not.toBeChecked();
    await text.click();
    await page.keyboard.press("3");
    await expect(choices.nth(2)).toBeChecked();
    expect(await page.evaluate(() => window.choiceChanges)).toHaveLength(3);
    await expect(
      page.locator("[aria-label='Question: notes'] [contenteditable]")
    ).toHaveText("");
    expect(responseWrites).toEqual([]);
    expect(unexpectedRequests).toEqual([]);
  });
}

test("single-label repeated digits toggle once and expose the existing shortcut hints", async ({
  page,
  baseURL,
}) => {
  const { decision, responseWrites, unexpectedRequests } =
    await openSyntheticAnnotation(page, baseURL);
  await observeChoiceChanges(page);
  await expect(decision.locator(".key")).toHaveText(["1", "2", "3"]);
  for (const checked of [true, false, true]) {
    await page
      .locator(".wrapper__records__header")
      .click({ position: { x: 4, y: 4 } });
    await page.keyboard.press("3");
    await expect(decision.locator("input[name='Not sure']")).toBeChecked({
      checked,
    });
  }
  expect(await page.evaluate(() => window.choiceChanges)).toEqual([
    "decision_not-sure",
    "decision_not-sure",
    "decision_not-sure",
  ]);
  expect(responseWrites).toEqual([]);
  expect(unexpectedRequests).toEqual([]);
});

test("background clicks retain the selected question when several choice questions exist", async ({
  page,
  baseURL,
}) => {
  const { decision, responseWrites, unexpectedRequests } =
    await openSyntheticAnnotation(page, baseURL, { extraChoice: true });
  const tags = page.locator("[aria-label='Question: tags']");
  const text = page.getByText(CLICK_AWAY_TEXT, { exact: true });
  await tags.getByText("Alpha", { exact: true }).click();
  await reachChoiceWithTab(page, tags.locator("input[name='Alpha']"));
  await text.click();
  await page.keyboard.press("2");
  await expect(tags.locator("input[name='Beta']")).toBeChecked();
  await expect(tags.locator("input[name='Alpha']")).toBeChecked();
  await expect(decision.locator("input[name='Yes']")).toBeChecked();
  await expect(decision.locator("input[name='No']")).not.toBeChecked();
  await decision.getByText("No", { exact: true }).click();
  await reachChoiceWithTab(page, decision.locator("input[name='Yes']"));
  await text.click();
  await page.keyboard.press("3");
  await expect(decision.locator("input[name='Not sure']")).toBeChecked();
  await expect(tags.locator("input[name='Gamma']")).not.toBeChecked();
  expect(responseWrites).toEqual([]);
  expect(unexpectedRequests).toEqual([]);
});

test("leaving and reopening annotation removes the old handlers", async ({
  page,
  baseURL,
}) => {
  test.setTimeout(60000);
  const { responseWrites, unexpectedRequests } = await openSyntheticAnnotation(
    page,
    baseURL
  );
  const annotationURL = page.url();
  await observeChoiceChanges(page);
  for (let cycle = 0; cycle < 3; cycle++) {
    // Browser history exercises Nuxt route unmount/mount without a page reload.
    await page.goBack();
    await expect(page.locator("form.questions-form")).toHaveCount(0);
    const before = await page.evaluate(() => window.choiceChanges.length);
    await page.keyboard.press("2");
    expect(await page.evaluate(() => window.choiceChanges.length)).toBe(before);
    expect(responseWrites).toEqual([]);
    await page.goForward();
    await expect(page).toHaveURL(annotationURL);
    const decision = page.locator("[aria-label='Question: decision']");
    await decision.getByText("Yes", { exact: true }).click();
    const afterClick = await page.evaluate(() => window.choiceChanges.length);
    await page.getByText(CLICK_AWAY_TEXT, { exact: true }).click();
    await page.keyboard.press("2");
    await expect(decision.locator("input[name='No']")).toBeChecked();
    expect(await page.evaluate(() => window.choiceChanges.length)).toBe(
      afterClick + 1
    );
  }
  expect(responseWrites).toEqual([]);
  expect(unexpectedRequests).toEqual([]);
});

test("bulk mode does not restore the focus of a click-away choice", async ({
  page,
  baseURL,
}) => {
  const { responseWrites, unexpectedRequests } = await openSyntheticAnnotation(
    page,
    baseURL
  );
  await page
    .getByRole("button", { name: "Switch to Bulk Mode", exact: true })
    .click();
  await expect(page.locator("[data-annotation-focus]")).toHaveCount(0);
  const decision = page.locator("[aria-label='Question: decision']");
  await decision.getByText("Yes", { exact: true }).click();
  await observeChoiceChanges(page);
  await page.getByText(CLICK_AWAY_TEXT, { exact: true }).click();
  await page.keyboard.press("2");
  expect(await page.evaluate(() => window.choiceChanges)).toEqual([]);
  expect(responseWrites).toEqual([]);
  expect(unexpectedRequests).toEqual([]);
});
