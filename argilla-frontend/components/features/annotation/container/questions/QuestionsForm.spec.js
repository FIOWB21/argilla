import { mount, shallowMount } from "@vue/test-utils";
import BaseModal from "~/components/base/base-modal/BaseModal.vue";
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

  it("focuses an actually clicked choice when the browser leaves focus on BODY", () => {
    const focus = jest.spyOn(choice, "focus");
    wrapper.vm.focusOnFirstQuestionFromOutside(click(choice));
    expect(focus).toHaveBeenCalledWith({ preventScroll: true });
    expect(document.activeElement).toBe(choice);
    expect(choice.checked).toBe(false);
    expect(wrapper.emitted("on-submit-responses")).toBeUndefined();
  });

  it.each(["ctrlKey", "altKey", "metaKey", "shiftKey", "defaultPrevented"])(
    "does not focus a modified choice click with %s",
    (property) => {
      const focus = jest.spyOn(choice, "focus");
      wrapper.vm.focusOnFirstQuestionFromOutside(
        click(choice, { [property]: true })
      );
      expect(focus).not.toHaveBeenCalled();
    }
  );

  it("does not move focus from the current control for a generated choice click", () => {
    const editor = document.createElement("input");
    host.appendChild(editor);
    editor.focus();
    const focus = jest.spyOn(choice, "focus");
    wrapper.vm.focusOnFirstQuestionFromOutside(click(choice));
    expect(focus).not.toHaveBeenCalled();
    expect(document.activeElement).toBe(editor);
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

  it("does not restore focus while the real BaseModal is open", () => {
    const modalHost = document.createElement("div");
    host.appendChild(modalHost);
    const modal = mount(BaseModal, {
      attachTo: modalHost,
      propsData: { preventBodyScroll: true, modalTitle: "Synthetic dialog" },
      slots: { default: "<p>Dialog text</p>" },
      stubs: { BaseButton: true },
    });
    try {
      const mask = modal.find(".modal-mask").element;
      jest.spyOn(mask, "getClientRects").mockReturnValue([{}]);
      const focus = jest.spyOn(choice, "focus");
      wrapper.vm.onClickOutside(click(modal.find("p").element));
      expect(focus).not.toHaveBeenCalled();
      expect(choice.checked).toBe(false);
      expect(wrapper.emitted("on-submit-responses")).toBeUndefined();
    } finally {
      modal.destroy();
    }
    wrapper.vm.onClickOutside(click(host));
    expect(document.activeElement).toBe(choice);
  });

  it.each(["dialog", "menu", "listbox"])(
    "does not restore focus with a visible ARIA %s",
    (role) => {
      const overlay = document.createElement("div");
      overlay.setAttribute("role", role);
      host.appendChild(overlay);
      jest.spyOn(overlay, "getClientRects").mockReturnValue([{}]);
      expect(wrapper.vm.restoreChoiceFocus(click(host))).toBe(false);
      overlay.style.visibility = "hidden";
      expect(wrapper.vm.restoreChoiceFocus(click(host))).toBe(true);
    }
  );

  it("ignores a disabled choice without emitting answer or submit events", () => {
    choice.disabled = true;
    const focus = jest.spyOn(choice, "focus");
    wrapper.vm.onClickOutside(click(host));
    expect(focus).not.toHaveBeenCalled();
    expect(wrapper.emitted("on-submit-responses")).toBeUndefined();
  });
});

describe("QuestionsForm document keyboard lifecycle", () => {
  it("handles Enter and auto-submit once per mount and removes each listener", () => {
    const add = jest.spyOn(document, "addEventListener");
    const remove = jest.spyOn(document, "removeEventListener");
    const forms = [];
    try {
      for (let cycle = 0; cycle < 3; cycle++) {
        const form = shallowMount(QuestionsForm, {
          propsData: {
            datasetId: "synthetic-dataset",
            record: {
              id: "synthetic-record",
              isModified: true,
              questions: [{ isSingleLabelType: true }],
              questionAreCompletedCorrectly: () => true,
            },
            isSubmitting: false,
            isDiscarding: false,
            isDraftSaving: false,
            enableAutoSubmitWithKeyboard: true,
          },
          mocks: { $platform: { isMac: false }, $t: (key) => key },
          directives: { "click-outside": {} },
          stubs: { BaseButton: true, QuestionsComponent: true },
        });
        forms.push(form);
        const handler = form.vm.handleGlobalKeys;
        expect(add).toHaveBeenCalledWith("keydown", handler);
        for (const modifier of [
          "ctrlKey",
          "altKey",
          "metaKey",
          "shiftKey",
          "isComposing",
        ]) {
          document.dispatchEvent(
            new KeyboardEvent("keydown", {
              key: "2",
              code: "Digit2",
              [modifier]: true,
            })
          );
        }
        expect(form.emitted("on-submit-responses")).toBeUndefined();
        document.dispatchEvent(
          new KeyboardEvent("keydown", { code: "Enter", key: "Enter" })
        );
        document.dispatchEvent(
          new KeyboardEvent("keydown", { code: "Digit2", key: "2" })
        );
        expect(form.emitted("on-submit-responses")).toHaveLength(2);
        form.destroy();
        expect(remove).toHaveBeenCalledWith("keydown", handler);
        document.dispatchEvent(
          new KeyboardEvent("keydown", { code: "Enter", key: "Enter" })
        );
        expect(form.emitted("on-submit-responses")).toHaveLength(2);
      }
      // Destroyed forms must also remain inactive during subsequent mounts.
      forms.forEach((form) => {
        expect(form.emitted("on-submit-responses")).toHaveLength(2);
      });
    } finally {
      forms.forEach((form) => form.destroy());
      jest.restoreAllMocks();
    }
  });
});
