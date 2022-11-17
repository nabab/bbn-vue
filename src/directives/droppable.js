(() => {
  const inserted = (el, binding) => {
    if (el._bbn === undefined) {
      el._bbn = {};
    }
    if (el._bbn.directives === undefined) {
      el._bbn.directives = {};
    }
    if (el._bbn.directives.droppable === undefined) {
      el._bbn.directives.droppable = {};
    }
    if ((binding.value !== false)
      && !el.classList.contains('bbn-undroppable')
    ) {
      el.dataset.bbn_droppable = true;
      el._bbn.directives.droppable = {
        active: true
      };
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
      el._bbn.directives.droppable.options = options;
      el._bbn.directives.droppable.onmouseenter = e => {
        if (!!el._bbn.directives.droppable.active) {
          mouseOver = true;
        }
      };
      el.addEventListener('mouseenter', el._bbn.directives.droppable.onmouseenter);
      el._bbn.directives.droppable.onmouseleave = e => {
        if (!!el._bbn.directives.droppable.active) {
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
      };
      el.addEventListener('mouseleave', el._bbn.directives.droppable.onmouseleave);
      el._bbn.directives.droppable.ondragoverdroppable = e => {
        if (!!el._bbn.directives.droppable.active
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
      };
      el.addEventListener('dragoverdroppable', el._bbn.directives.droppable.ondragoverdroppable);
      el._bbn.directives.droppable.onbeforedrop = e => {
        if (!!el._bbn.directives.droppable.active) {
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
      };
      el.addEventListener('beforedrop', el._bbn.directives.droppable.onbeforedrop);
    }
    else {
      el.dataset.bbn_droppable = false;
      el._bbn.directives.droppable = {
        active: false
      };
    }
  };

  bbn.vue.directives.droppable = {
    inserted: inserted,
    update: (el, binding) => {
      if ((binding.value !== false)
      && !el.classList.contains('bbn-undroppable')
      ) {
        if (binding.oldValue === false) {
          inserted(el, binding);
        }
        else {
          el.dataset.bbn_droppable = true;
          if (!el.classList.contains('bbn-droppable')) {
            el.classList.add('bbn-droppable');
          }
        }
      }
      else {
        el.dataset.bbn_droppable = false;
        if (el._bbn === undefined) {
          el._bbn = {};
        }
        if (el._bbn.directives === undefined) {
          el._bbn.directives = {};
        }
        if (el._bbn.directives.droppable === undefined) {
          el._bbn.directives.droppable = {};
        }
        if (!!el._bbn.directives.droppable.active) {
          if (bbn.fn.isFunction(el._bbn.directives.droppable.onmouseenter)) {
            el.removeEventListener('mouseenter', el._bbn.directives.droppable.onmouseenter);
          }
          if (bbn.fn.isFunction(el._bbn.directives.droppable.onmouseleave)) {
            el.removeEventListener('mouseleave', el._bbn.directives.droppable.onmouseleave);
          }
          if (bbn.fn.isFunction(el._bbn.directives.droppable.ondragoverdroppable)) {
            el.removeEventListener('dragoverdroppable', el._bbn.directives.droppable.ondragoverdroppable);
          }
          if (bbn.fn.isFunction(el._bbn.directives.droppable.onbeforedrop)) {
            el.removeEventListener('beforedrop', el._bbn.directives.droppable.onbeforedrop);
          }
        }
        el._bbn.directives.droppable = {
          active: false
        };
        if (el.classList.contains('bbn-droppable')) {
          el.classList.remove('bbn-droppable');
        }
      }
    }
  };
})();