(() => {
  Vue.directive('droppable', {
    inserted: (el, binding) => {
      if ((binding.value !== false)
      && !el.classList.contains('bbn-undroppable')
      ) {
        el.dataset.bbn_droppable = true;
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
              bbn.fn.error(bbn._('No "data" property found or not an object'));
              throw bbn._('No "data" property found or not an object');
            }
            data = options.data;
          }
        }
        options.data = data;
        el.addEventListener('mouseenter', e => {
          if (el.dataset.bbn_droppable === 'true') {
            mouseOver = true;
          }
        });
        el.addEventListener('mouseleave', e => {
          if (el.dataset.bbn_droppable === 'true') {
            let ev = new CustomEvent('dragleave', {
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
              delete el.dataset.bbn_droppable_over;
            }
          }
        });
        el.addEventListener('dragoverdroppable', e => {
          if ((el.dataset.bbn_droppable === 'true')
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
              el.dataset.bbn_droppable_over = true;
            }
          }
        });
        el.addEventListener('beforedrop', e => {
          if (el.dataset.bbn_droppable === 'true') {
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
                  if (!!e.detail.mode && (e.detail.mode === 'self')) {
                    e.detail.originalParent.insertBefore(e.detail.originalElement, e.detail.nextElement);
                  }
                }
              }
            }
          }
        });
      }
      else {
        el.dataset.bbn_droppable = false;
      }
    },
    update: (el, binding) => {
      if ((binding.value !== false)
      && !el.classList.contains('bbn-undroppable')
      ) {
        el.dataset.bbn_droppable = true;
        if (!el.classList.contains('bbn-droppable')) {
          el.classList.add('bbn-droppable');
        }
      }
      else {
        el.dataset.bbn_droppable = false;
        if (el.classList.contains('bbn-droppable')) {
          el.classList.remove('bbn-droppable');
        }
      }
    }
  });
})();