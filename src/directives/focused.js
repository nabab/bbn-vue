(() => {
  Vue.directive('focused', {
    inserted(el, binding) {
      bbn.fn.log("INSERTED FOCUSED DIRECTIVE", el, binding);
      if (binding.value === false) {
        return;
      }

      el.focus();
      if (binding.modifiers.selected) {
        bbn.fn.selectElementText(el);
      }
    }
  });
})()

