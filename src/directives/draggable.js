(() => {
  const startDrag = (e, ele, options) => {
    let ev = new CustomEvent("dragStart", {
      cancelable: true,
      bubbles: true,
      detail: options
    });
    ele.dispatchEvent(ev);
    if (!e.defaultPrevented) {
      e.stopImmediatePropagation();
      options.helper.style.left = e.pageX + 'px';
      options.helper.style.top = e.pageY + 'px';
      options.helper.style.position = 'fixed';
      options.helper.style.zIndex = '1000';
      options.helper.style.opacity = 0.7;
      options.helper.style.pointerEvents = 'none';
      ele.parentElement.append(options.helper);
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
      bbn.fn.log('startDrag', e, ele, options)
      document.addEventListener('mouseup', fnEnd, {once: true});
      document.addEventListener('mousemove', fnDrag);
    }
  };

  const drag = (e, ele, options) => {
    // we prevent default from the event
    e.stopImmediatePropagation();
    e.preventDefault();
    options.helper.style.left = e.pageX + 'px';
    options.helper.style.top = e.pageY + 'px';
    if (e.target
      && e.target.classList.contains('bbn-droppable')
    ) {
      let ev = new CustomEvent("dragOverDroppable", {
        cancelable: true,
        bubbles: true,
        detail: options
      });
      e.target.dispatchEvent(ev)
    }

  };

  const endDrag = (e, ele, options) => {
    e.preventDefault();
    e.stopImmediatePropagation();
    if (e.target.classList.contains('bbn-droppable-over')) {
      let ev = new CustomEvent("dragEnd", {
        cancelable: true,
        bubbles: true,
        detail: options
      });
      e.target.dispatchEvent(ev);
    }
    options.helper.remove();
  };

  Vue.directive('draggable', (el, binding) => {
    bbn.fn.log('Draggable directive', el, binding)
    if (binding.value !== false) {
      if (!el.classList.contains('bbn-draggable')) {
        el.classList.add('bbn-draggable');
      }
      let options = {},
          isComponent = !!binding.modifiers && !!binding.modifiers.component,
          component = false,
          helper = false;
      if (bbn.fn.isObject(binding.value)) {
        options = binding.value;
        if (!!options.helper) {
          helper = options.helper;
        }
        if (isComponent) {
          if ((options.component === undefined)
            || (bbn.fn.isObject(options.component) && !bbn.fn.numProperties(options.component))
            || (bbn.fn.isString(options.component) && !options.component.length)
          ) {
            throw bbn._('No "component" property found');
          }
          component = options.component;
        }
      }
      else if (bbn.fn.isString(binding.value)) {
        switch (binding.value) {
          case 'clone':
            helper = el.cloneNode(true);
            break;
          default:
            // The helper is a component name
            component = binding.value;
            break;
        }
      }
      if (isComponent && component) {
        helper = document.createElement('component');
        helper.setAttribute(bbn.fn.isString(component) ? 'is' : ':is', component);
        if (bbn.fn.isObject(options)
          && bbn.fn.isObject(options.componentOptions)
        ) {
          helper.setAttribute('v-bind', JSON.stringify(options.componentOptions));
        }
      }
      // If the helper is not defined we crate a clone of the dragged node
      if (!helper) {
        helper = el.cloneNode(true);
      }
      options.helper = document.createElement('div');
      options.helper.setAttribute('id', 'bbn-draggable-current');
      options.helper.append(helper);
      // Add the events listener to capture the long press click and start the drag
      let clickTimeout = 0,
          holdClick = false;
      el.addEventListener('mousedown', ev => {
        if (clickTimeout) {
          clearTimeout(clickTimeout);
        }
        holdClick = true;
        clickTimeout = setTimeout(() => {
          if (holdClick) {
            startDrag(ev, el, options);
          }
        }, 150);
      });
      el.addEventListener('mouseup', ev => {
        holdClick = false;
      });
    }
  });
})();
