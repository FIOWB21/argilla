<template>
  <div @keydown="answerRatingFor">
    <slot></slot>
  </div>
</template>

<script>
export default {
  data() {
    return {
      timer: null,
      keyCode: "",
    };
  },
  computed: {
    options() {
      return this.$slots.default[0].context?.question.answer.values;
    },
  },
  methods: {
    selectByKeyCode(keyCode) {
      const target = this.options.find(({ value }) => value == keyCode);

      if (target) document.getElementById(target.id).click();

      this.reset();
    },
    hasJustOneCoincidence(keyCode) {
      return (
        this.options.filter((o) => o.value.toString().startsWith(keyCode))
          .length == 1
      );
    },
    reset() {
      this.keyCode = "";
      this.timer = null;
    },
    answerRatingFor(event) {
      if (
        event.shiftKey ||
        event.ctrlKey ||
        event.metaKey ||
        event.altKey ||
        event.isComposing
      )
        return;

      if (this.timer) clearTimeout(this.timer);
      if (event.key == "Tab") return;

      if (event.code == "Space") {
        event.preventDefault();
        return document.activeElement.click();
      }

      if (!/^\d$/.test(event.key)) return this.reset();

      event.preventDefault();
      this.keyCode += event.key;

      if (this.hasJustOneCoincidence(this.keyCode)) {
        return this.selectByKeyCode(this.keyCode);
      }

      this.timer = setTimeout(() => {
        this.selectByKeyCode(this.keyCode);
      }, 300);
    },
  },
};
</script>
