import { shallowMount } from "@vue/test-utils";
import QuestionsForm from "./QuestionsForm.vue";

describe("QuestionsForm click-away focus", () => {
  let wrapper;
  let host;
  let choice;

  beforeEach(async () => {
    host = document.createElement("div");
    host.setAttribute("data-annotation-focus", "");
    document.body.appendChild(host);
    const mountPoint = document.createElement("div");
    host.appendChild(mountPoint);
    wrapper = shallowMount(QuestionsForm, {
      attachTo: mountPoint,
      propsData: {
        datasetId: "synthetic-dataset",
        record: {
          id: "synthetic-record",
          questions: [{ isTextType: true }, { isSingleLabelType: true }],
          questionAreCompletedCorrectly: () => false,
        },
        isSubmitting: false,
        isDiscarding: false,
        isDraftSaving: false,
      },
      mocks: { $platform: { isMac: false }, $t: (key) => key },
      directives: { "click-outside": {} },
      stubs: {
        BaseButton: true,
        QuestionsComponent: {
          template:
            '<div class="input-button"><input type="checkbox" @focus="$emit(\'on-focus\', 1)" /></div>',
        },
      },
    });
    choice = wrapper.find('input[type="checkbox"]').element;
    // JSDOM has no layout; real focus loss and geometry are tested in Playwright.
    jest.spyOn(choice, "getClientRects").mockReturnValue([{}]);
    choice.focus();
    choice.blur();
    await wrapper.vm.$nextTick();
  });

  afterEach(() => {
    wrapper.destroy();
    host.remove();
    jest.restoreAllMocks();
  });

  const click = (target, overrides = {}) => ({
    target,
    button: 0,
    ...overrides,
  });

  it("restores the last choice without selecting, scrolling, or submitting", () => {
    const focus = jest.spyOn(choice, "focus");
    wrapper.vm.onClickOutside(click(host));
    expect(focus).toHaveBeenCalledWith({ preventScroll: true });
    expect(document.activeElement).toBe(choice);
    expect(choice.checked).toBe(false);
    expect(wrapper.vm.autofocusPosition).toBe(1);
    expect(wrapper.emitted("on-submit-responses")).toBeUndefined();
  });

  it.each([
    "input",
    "textarea",
    "select",
    "button",
    "a",
    "label",
    '[contenteditable="true"]',
    '[role="combobox"]',
    '[tabindex="0"]',
    ".search-area",
  ])("does not restore focus for a click inside %s", (selector) => {
    const target = document.createElement(
      selector.match(/^[a-z]+/)?.[0] || "div"
    );
    if (selector.startsWith("[")) {
      const [, name, value] = selector.match(/\[(.+)="(.+)"\]/);
      target.setAttribute(name, value);
    }
    if (selector.startsWith(".")) target.className = selector.slice(1);
    const child = document.createElement("span");
    target.appendChild(child);
    host.appendChild(target);
    expect(wrapper.vm.restoreChoiceFocus(click(child))).toBe(false);
    expect(document.activeElement).not.toBe(choice);
  });

  it.each(["modal-mask", "dropdown__content", "span-entity__dropdown"])(
    "does not restore focus with a visible %s",
    (className) => {
      const overlay = document.createElement("div");
      overlay.className = className;
      host.appendChild(overlay);
      jest.spyOn(overlay, "getClientRects").mockReturnValue([{}]);
      expect(wrapper.vm.restoreChoiceFocus(click(host))).toBe(false);
      wrapper.vm.userComesFromOutside = true;
      wrapper.vm.focusOnFirstQuestionFromOutside(click(wrapper.element));
      expect(document.activeElement).not.toBe(choice);
      expect(wrapper.vm.autofocusPosition).toBe(1);
    }
  );

  it.each(["ctrlKey", "altKey", "metaKey", "shiftKey", "defaultPrevented"])(
    "does not restore focus with %s",
    (property) => {
      expect(
        wrapper.vm.restoreChoiceFocus(click(host, { [property]: true }))
      ).toBe(false);
    }
  );

  it("leaves a text selection intact", () => {
    jest.spyOn(window, "getSelection").mockReturnValue({ isCollapsed: false });
    expect(wrapper.vm.restoreChoiceFocus(click(host))).toBe(false);
  });

  it("does not restore focus outside focus annotation mode", () => {
    host.removeAttribute("data-annotation-focus");
    expect(wrapper.vm.restoreChoiceFocus(click(host))).toBe(false);
  });

  it("does not restore focus when actions are disabled or saving", async () => {
    await wrapper.setProps({ areActionsEnabled: false });
    expect(wrapper.vm.restoreChoiceFocus(click(host))).toBe(false);
    await wrapper.setProps({ areActionsEnabled: true, isSubmitting: true });
    expect(wrapper.vm.restoreChoiceFocus(click(host))).toBe(false);
  });

  it("forgets the choice after focusing an editor", () => {
    const editor = document.createElement("textarea");
    wrapper.element.appendChild(editor);
    editor.focus();
    expect(wrapper.vm.lastFocusedChoice).toBeNull();
    expect(wrapper.vm.restoreChoiceFocus(click(host))).toBe(false);
    expect(document.activeElement).toBe(editor);
  });

  it("does not focus a detached choice", () => {
    choice.remove();
    expect(wrapper.vm.restoreChoiceFocus(click(host))).toBe(false);
  });

  it.each(["inert", "aria-hidden"])(
    "does not focus a choice inside an %s region",
    (attribute) => {
      wrapper.element.setAttribute(attribute, "true");
      expect(wrapper.vm.restoreChoiceFocus(click(host))).toBe(false);
    }
  );

  it("does not focus a hidden choice", () => {
    choice.style.visibility = "hidden";
    expect(wrapper.vm.restoreChoiceFocus(click(host))).toBe(false);
  });

  it("does not take focus from another control", () => {
    const editor = document.createElement("input");
    host.appendChild(editor);
    editor.focus();
    expect(wrapper.vm.restoreChoiceFocus(click(host))).toBe(false);
    expect(document.activeElement).toBe(editor);
  });
});
