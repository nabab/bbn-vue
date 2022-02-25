(() => {
  const startDrag = (e, ele, options) => {
    if (ele.dataset.draggable === 'true') {
      let ev = new CustomEvent('dragstart', {
        cancelable: true,
        bubbles: true,
        detail: options
      });
      ele.dispatchEvent(ev);
      if (!ev.defaultPrevented) {
        ev.stopImmediatePropagation();
        let isMove = !!options.mode && (options.mode === 'move'),
            helper =  isMove ? ele : ele.cloneNode(true);
        if (options.component) {
          helper = document.createElement('component');
          helper.setAttribute(bbn.fn.isString(options.component) ? 'is' : ':is', options.component);
          if (bbn.fn.isObject(options)
            && bbn.fn.isObject(options.componentOptions)
          ) {
            helper.setAttribute('v-bind', JSON.stringify(options.componentOptions));
          }
        }
        options.originalElement = ele;
        options.originalParent = ele.parentElement;
        options.originalNextElement = ele.nextElementSibling;
        options.helper = document.createElement('div');
        options.helper.setAttribute('id', 'bbn-draggable-current');
        options.helper[isMove ? 'appendChild' : 'append'](helper);
        options.helper.style.left = e.pageX + 'px';
        options.helper.style.top = e.pageY + 'px';
        options.helper.style.position = 'fixed';
        options.helper.style.zIndex = '1000';
        options.helper.style.opacity = 0.7;
        options.helper.style.pointerEvents = 'none';
        if (!options.container) {
          options.container = document.body;
        }
        options.container[isMove ? 'appendChild' : 'append'](options.helper);
        let v = new Vue({
          el: '#bbn-draggable-current > *'
        });
        let fnDrag = e => {
          drag(e, ele, options);
        };
        let fnEnd = e => {
          endDrag(e, ele, options);
          document.removeEventListener('mousemove', fnDrag);
        };
        document.addEventListener('mouseup', fnEnd, {once: true});
        document.addEventListener('mousemove', fnDrag);
      }
    }
  };

  const drag = (e, ele, options) => {
    if (ele.dataset.draggable === 'true') {
      // we prevent default from the event
      e.stopImmediatePropagation();
      e.preventDefault();
      options.helper.style.left = e.pageX + 'px';
      options.helper.style.top = e.pageY + 'px';
      let target = e.target;
      if (!target.classList.contains('bbn-droppable')) {
        target = target.closest('.bbn-droppable');
      }
      if (target && (target !== ele)) {
        let ev = new CustomEvent('dragoverdroppable', {
          cancelable: true,
          bubbles: true,
          detail: options
        });
        target.dispatchEvent(ev)
      }
    }
  };

  const endDrag = (e, ele, options) => {
    if (ele.dataset.draggable === 'true') {
      e.preventDefault();
      e.stopImmediatePropagation();
      let target = e.target;
      if (!target.classList.contains('bbn-droppable-over')) {
        target = target.closest('.bbn-droppable.bbn-droppable-over');
      }
      if (bbn.fn.isDom(target)) {
        let ev = new CustomEvent('beforedrop', {
          cancelable: true,
          bubbles: true,
          detail: options
        });
        target.dispatchEvent(ev);
      }
      else {
        let ev = new CustomEvent('dragend', {
          cancelable: true,
          bubbles: true,
          detail: options
        });
        ele.dispatchEvent(ev);
        if (!ev.defaultPrevented) {
          if (!!options.mode && (options.mode === 'move')) {
            options.originalParent.insertBefore(options.originalElement, options.originalNextElement);
          }
        }
      }
      options.helper.remove();
    }
  };

  Vue.directive('draggable', {
    inserted: (el, binding) => {
      if (binding.value !== false) {
        el.dataset.draggable = true;
        if (!el.classList.contains('bbn-draggable')) {
          el.classList.add('bbn-draggable');
        }
        let options = {},
            asArg = !!binding.arg && binding.arg.length,
            asMods = bbn.fn.isObject(binding.modifiers) && bbn.fn.numProperties(binding.modifiers),
            asComponentFromMods = asMods && !!binding.modifiers.component,
            asContainerFromMods = asMods && !!binding.modifiers.container,
            asModeFromMods = asMods && !!binding.modifiers.mode,
            asDataFromMods = asMods && !!binding.modifiers.data,
            component = false,
            container = false,
            mode = 'clone',
            data = {};

        if (asArg) {
          switch (binding.arg) {
            case 'component':
              component = binding.value;
              break;
            case 'container':
              container = binding.value;
              break;
            case 'data':
              data = binding.value;
              break;
            case 'mode':
              mode = binding.value;
              break;
          }
        }
        else {
          if (bbn.fn.isObject(binding.value)) {
            options = binding.value;
            if (asComponentFromMods) {
              if ((options.component === undefined)
                || (bbn.fn.isObject(options.component) && !bbn.fn.numProperties(options.component))
                || (bbn.fn.isString(options.component) && !options.component.length)
              ) {
                throw bbn._('No "component" property found');
              }
              component = options.component;
            }
            if (asContainerFromMods) {
              if ((options.container === undefined)
                || !bbn.fn.isDom(options.container)
              ) {
                throw bbn._('No "container" property found or not a DOM element');
              }
              container = options.container;
            }
            if (asDataFromMods) {
              if ((options.data === undefined)
                || !bbn.fn.isObject(options.data)
              ) {
                throw bbn._('No "data" property found or not an object');
              }
              data = options.data;
            }
            if (asModeFromMods) {
              if ((options.mode === undefined)
                || !bbn.fn.isString(options.mode)
              ) {
                throw bbn._('No "mode" property found or not a string');
              }
              mode = options.mode;
            }
          }
          else if (bbn.fn.isString(binding.value)) {
            switch (binding.value) {
              case 'clone':
                mode = 'clone';
                break;
              case 'move':
                mode = 'move';
                break;
              default:
                // The helper is a component name
                component = binding.value;
                break;
            }
          }
        }
        if (component) {
          options.component = component;
        }
        options.container = container;
        options.data = data;
        options.mode = mode;
        // Add the events listener to capture the long press click and start the drag
        let clickTimeout = 0,
            holdClick = false;
        el.addEventListener('mousedown', ev => {
          if (el.dataset.draggable === 'true') {
            if (clickTimeout) {
              clearTimeout(clickTimeout);
            }
            if (ev.button === 0) {
              holdClick = true;
              clickTimeout = setTimeout(() => {
                if (holdClick) {
                  startDrag(ev, el, options);
                }
              }, 150);
            }
          }
        });
        el.addEventListener('mouseup', ev => {
          if (el.dataset.draggable === 'true') {
            holdClick = false;
          }
        });
      }
      else {
        el.dataset.draggable = false;
      }
    },
    update: (el, binding) => {
      if (binding.value !== false) {
        el.dataset.draggable = true;
        if (!el.classList.contains('bbn-draggable')) {
          el.classList.add('bbn-draggable');
        }
      }
      else {
        el.dataset.draggable = false;
        if (el.classList.contains('bbn-draggable')) {
          el.classList.remove('bbn-draggable');
        }
      }
    }
  });
})();
