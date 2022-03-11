(() => {
  const startDrag = (e, ele, options) => {
    if (ele.dataset.bbn_draggable === 'true') {
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
        let rect = ele.getBoundingClientRect();
        if (!!options.helperElement) {
          rect = options.helperElement.getBoundingClientRect();
          helper = isMove ? options.helperElement : options.helperElement.cloneNode(true)
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
        options.helper.style.width = rect.width + 'px';
        options.helper.style.height = rect.height + 'px';
        if (!options.container) {
          options.container = bbn.fn.isDom(options.originalParent) ? options.originalParent : document.body;
        }
        options.container[isMove ? 'appendChild' : 'append'](options.helper);
        let scroll = options.container.closest('.bbn-scroll');
        options.scroll = !!scroll && (scroll.__vue__ !== undefined) ? scroll.__vue__ : false;
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
    if (ele.dataset.bbn_draggable === 'true') {
      // we prevent default from the event
      e.stopImmediatePropagation();
      e.preventDefault();
      options.helper.style.left = e.pageX + 'px';
      options.helper.style.top = e.pageY + 'px';
      if (!!options.scroll
        && (options.scroll.hasScrollY || options.scroll.hasScrollX)
        && !options.scroll.isScrolling
      ) {
        let getDiff = axis => {
          let coord = options.scroll.$el.getBoundingClientRect(),
              client = 'client' + axis.toUpperCase(),
              dim = axis === 'y' ? 'height' : 'width',
              step = Math.ceil(coord[dim] / 20),
              margin = step * 4,
              diff = 0;
          if (e[client] < (coord[axis] + margin)) {
            diff = e[client] - coord[axis] - margin;
          }
          else if (e[client] > (coord[axis] + coord[dim] - margin)) {
            diff = e[client] - (coord[axis] + coord[dim] - margin);
          }
          if (diff) {
            let approachLevel = Math.round(diff/step);
            return Math.round(options.scroll.$el['offset' + dim.charAt(0).toUpperCase() + dim.slice(1)] / 5) * approachLevel + 1;
          }
        };
        if (options.scroll.hasScrollY) {
          let diff = getDiff('y');
          if (diff) {
            options.scroll.addVertical(diff);
          }
        }
        if (options.scroll.hasScrollX) {
          let diff = getDiff('x');
          if (diff) {
            options.scroll.addHorizontal(diff);
          }
        }
      }
      let target = e.target;
      if (target.dataset.bbn_droppable !== 'true') {
        target = target.closest('[data-bbn_droppable=true]');
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
    if (ele.dataset.bbn_draggable === 'true') {
      e.preventDefault();
      e.stopImmediatePropagation();
      let target = e.target;
      if (target.dataset.bbn_droppable_over !== 'true') {
        target = target.closest('[data-bbn_droppable_over=true]');
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
      if ((binding.value !== false)
        && !el.classList.contains('bbn-undraggable')
      ) {
        el.dataset.bbn_draggable = true;
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
            asHelperFromMods = asMods && !!binding.modifiers.helper,
            component = false,
            container = false,
            mode = 'clone',
            data = {},
            helper = false;

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
            case 'helper':
              helper = binding.value;
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
            if (asHelperFromMods) {
              if ((options.helper === undefined)
                || (!bbn.fn.isString(options.helper)
                  && !bbn.fn.isDom(options.helper))
              ) {
                throw bbn._('No "helper" property found or not a string or not a DOM element');
              }
              helper = options.helper;
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
        if (helper) {
          options.helperElement = helper;
        }
        // Add the events listener to capture the long press click and start the drag
        let clickTimeout = 0,
            holdClick = false;
        el.addEventListener('mousedown', ev => {
          if (el.dataset.bbn_draggable === 'true') {
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
          if (el.dataset.bbn_draggable === 'true') {
            holdClick = false;
          }
        });
      }
      else {
        el.dataset.bbn_draggable = false;
      }
    },
    update: (el, binding) => {
      if ((binding.value !== false)
        && !el.classList.contains('bbn-undraggable')
      ) {
        el.dataset.bbn_draggable = true;
        if (!el.classList.contains('bbn-draggable')) {
          el.classList.add('bbn-draggable');
        }
      }
      else {
        el.dataset.bbn_draggable = false;
        if (el.classList.contains('bbn-draggable')) {
          el.classList.remove('bbn-draggable');
        }
      }
    }
  });
})();
