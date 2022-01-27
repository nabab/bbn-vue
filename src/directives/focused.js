(() => {
  Vue.directive('focused', {
    inserted(el, binding) {
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

