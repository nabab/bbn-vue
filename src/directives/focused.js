(() => {
  Vue.directive('focused', {
    inserted(el, binding) {
      if (binding.value === false) {
        return;
      }

      bbn.fn.log("INSERTED FOCUSED DIRECTIVE", el, binding);
      el.focus();
      if (binding.modifiers.selected) {
        bbn.fn.selectElementText(el);
      }
    }
  });
})()

