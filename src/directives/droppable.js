(() => {
  Vue.directive('droppable', {
    inserted: (el, binding) => {
      if (binding.value !== false) {
        el.dataset.droppable = true;
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
          if (el.dataset.droppable === 'true') {
            mouseOver = true;
          }
        });
        el.addEventListener('mouseleave', e => {
          if (el.dataset.droppable === 'true') {
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
          }
        });
        el.addEventListener('dragoverdroppable', e => {
          if ((el.dataset.droppable === 'true')
            && !e.defaultPrevented
            && !dragOver
            && !!mouseOver
          ) {
            dragOver = {
              from: e.detail,
              to: options
            };
            let ev = new CustomEvent('dragover', {
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
        el.addEventListener('beforedrop', e => {
          if (el.dataset.droppable === 'true') {
            if (el.classList.contains('bbn-droppable-over')) {
              el.classList.remove('bbn-droppable-over');
            }
            if (!e.defaultPrevented && !!dragOver) {
              let ev = new CustomEvent('drop', {
                cancelable: true,
                bubbles: true,
                detail: dragOver
              });
              el.dispatchEvent(ev);
              if (!ev.defaultPrevented) {
                el.appendChild(e.detail.originalElement);
              }
              else {
                let ev = new CustomEvent('dragend', {
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
          }
        });
      }
      else {
        el.dataset.droppable = false;
      }
    },
    update: (el, binding) => {
      if (binding.value !== false) {
        el.dataset.droppable = true;
        if (!el.classList.contains('bbn-droppable')) {
          el.classList.add('bbn-droppable');
        }
      }
      else {
        el.dataset.droppable = false;
        if (el.classList.contains('bbn-droppable')) {
          el.classList.remove('bbn-droppable');
        }
      }
    }
  });
})();