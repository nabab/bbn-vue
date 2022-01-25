(() => {
  Vue.directive('focused', {
    inserted(el, binding) {
      el.focus();
      if (binding.modifiers.selected) {
        bbn.fn.selectElementText(el);
      }
    }
  });
})()

