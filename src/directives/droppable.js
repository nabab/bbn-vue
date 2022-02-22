(() => {
  Vue.directive('droppable', (el, binding) => {
    if (binding.value !== false) {
      if (!el.classList.contains('bbn-droppable')) {
        el.classList.add('bbn-droppable');
      }
      let dragOver = false,
          mouseOver = false;
      el.addEventListener('mouseenter', e => {
        mouseOver = true;
      });
      el.addEventListener('mouseleave', e => {
        if (el.classList.contains('bbn-droppable-over')) {
          el.classList.remove('bbn-droppable-over');
        }
        mouseOver = false;
        dragOver = false;
      });
      el.addEventListener('dragOverDroppable', e => {
        if (!dragOver && !!mouseOver) {
          dragOver = e.detail;
          let ev = new CustomEvent("dragOver", {
            cancelable: true,
            bubbles: true,
            detail: dragOver
          });
          el.dispatchEvent(ev);
          if (!ev.defaultPrevented) {
            if (!el.classList.contains('bbn-droppable-over')) {
              el.classList.add('bbn-droppable-over');
            }
          }
        }
      });
      el.addEventListener('dragEnd', e => {
        if (el.classList.contains('bbn-droppable-over')) {
          el.classList.remove('bbn-droppable-over');
        }
      })
    }
  });
})();