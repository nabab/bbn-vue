(() => {
  bbn.vue.directives.focused = {
    inserted(el, binding) {
      if (binding.value === false) {
        return;
      }

      setTimeout(() => {
        el.focus();
        bbn.env.focused = el;
        if (binding.modifiers.selected) {
          bbn.fn.selectElementText(el);
        }
      }, 250);
    }
  };
})()

