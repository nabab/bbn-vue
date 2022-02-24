(() => {
  Vue.directive('droppable', {
    inserted: (el, binding) => {
      if (binding.value !== false) {
        if (!el.classList.contains('bbn-droppable')) {
          el.classList.add('bbn-droppable');
        }
        let options = {},
            asArg = !!binding.arg && binding.arg.length,
            asMods = bbn.fn.isObject(binding.modifiers) && bbn.fn.numProperties(binding.modifiers),
            asDataFromMods = asMods && !!binding.modifiers.data,
            data = {},
            dragOver = false,
            mouseOver = false;
        if (asArg) {
          if (binding.arg === 'data') {
            data = binding.arg;
          }
        }
        else if (bbn.fn.isObject(binding.value)) {
          options = binding.value;
          if (asDataFromMods) {
            if ((options.data === undefined)
              || !bbn.fn.isObject(options.data)
            ) {
              throw bbn._('No "data" property found or not an object');
            }
            data = options.data;
          }
        }
        options.data = data;
        el.addEventListener('mouseenter', e => {
          mouseOver = true;
        });
        el.addEventListener('mouseleave', e => {
          let ev = new CustomEvent('dragLeave', {
            cancelable: true,
            bubbles: true,
            detail: dragOver
          });
          mouseOver = false;
          dragOver = false;
          el.dispatchEvent(ev);
          if (!ev.defaultPrevented) {
            if (el.classList.contains('bbn-droppable-over')) {
              el.classList.remove('bbn-droppable-over');
            }
          }
        });
        el.addEventListener('dragOverDroppable', e => {
          if (!e.defaultPrevented && !dragOver && !!mouseOver) {
            dragOver = {
              from: e.detail,
              to: options
            };
            let ev = new CustomEvent('dragOver', {
              cancelable: true,
              bubbles: true,
              detail: dragOver
            });
            bbn.fn.log('dravOver', ev)
            el.dispatchEvent(ev);
            if (!ev.defaultPrevented) {
              if (!el.classList.contains('bbn-droppable-over')) {
                el.classList.add('bbn-droppable-over');
              }
            }
          }
        });
        el.addEventListener('beforeDragDrop', e => {
          bbn.fn.log('ciao')
          if (el.classList.contains('bbn-droppable-over')) {
            el.classList.remove('bbn-droppable-over');
          }
          if (!e.defaultPrevented && !!dragOver) {
            let ev = new CustomEvent('dragDrop', {
              cancelable: true,
              bubbles: true,
              detail: dragOver
            });
            el.dispatchEvent(ev);
            if (!ev.defaultPrevented) {
              el.appendChild(e.detail.originalElement);
            }
            else {
              let ev = new CustomEvent('dragEnd', {
                cancelable: true,
                bubbles: true,
                detail: dragOver
              });
              e.detail.originalElement.dispatchEvent(ev);
              if (!ev.defaultPrevented) {
                if (!!e.detail.mode && (e.detail.mode === 'move')) {
                  e.detail.originalParent.insertBefore(e.detail.originalElement, e.detail.nextElement);
                }
              }
            }
          }
        });
      }
    },
    update: (el, binding) => {
      if (binding.value !== false) {
        if (!el.classList.contains('bbn-droppable')) {
          el.classList.add('bbn-droppable');
        }
      }
    }
  });
})();