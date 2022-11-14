(() => {
  const startDrag = (e, ele, options) => {
    if (!!ele._bbn.directives.draggable.active) {
      let ev = new CustomEvent('dragstart', {
        cancelable: true,
        bubbles: true,
        detail: options
      });
      ele.dispatchEvent(ev);
      if (!ev.defaultPrevented) {
        ev.stopImmediatePropagation();
        let isMove = !!options.mode && (options.mode === 'move'),
            isSelf = !!options.mode && (options.mode === 'self'),
            helper = isMove ? false : (isSelf ? ele : ele.cloneNode(true)),
            rect = ele.getBoundingClientRect();
        options.originalElement = ele;
        options.originalParent = ele.parentElement;
        options.originalNextElement = ele.nextElementSibling;
        options.helper = options.helperElement || ele;
        if (!options.container) {
          options.container = bbn.fn.isDom(options.originalParent) ? options.originalParent : document.body;
        }
        if (!isMove) {
          if (options.component) {
            helper = document.createElement('component');
            helper.setAttribute(bbn.fn.isString(options.component) ? 'is' : ':is', options.component);
            if (bbn.fn.isObject(options)
              && bbn.fn.isObject(options.componentOptions)
            ) {
              helper.setAttribute('v-bind', JSON.stringify(options.componentOptions));
            }
          }
          if (!!options.helperElement) {
            rect = options.helperElement.getBoundingClientRect();
            helper = isSelf ? options.helperElement : options.helperElement.cloneNode(true)
          }
          options.helper = document.createElement('div');
          options.helper.setAttribute('id', 'bbn-draggable-current');
          options.helper[isSelf ? 'appendChild' : 'append'](helper);
          options.helper.style.left = e.pageX + 'px';
          options.helper.style.top = e.pageY + 'px';
          options.helper.style.position = 'fixed';
          options.helper.style.zIndex = '1000';
          options.helper.style.opacity = 0.7;
          options.helper.style.width = rect.width + 'px';
          options.helper.style.height = rect.height + 'px';
          options.container[isSelf ? 'appendChild' : 'append'](options.helper);
          let scroll = options.container.closest('.bbn-scroll');
          options.scroll = !!scroll && (scroll.__vue__ !== undefined) ? scroll.__vue__ : false;
          let v = new Vue({
            el: '#bbn-draggable-current > *'
          });
        }
        ele._bbn.directives.draggable.pointerEvents = window.getComputedStyle(options.helper).pointerEvents;
        options.helper.style.pointerEvents = 'none';
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
    if (!!ele._bbn.directives.draggable.active) {
      // we prevent default from the event
      e.stopImmediatePropagation();
      e.preventDefault();
      if (options.mode === 'move') {
        let rectContainer = options.container.getBoundingClientRect(),
            rectHelper = options.helper.getBoundingClientRect(),
            rectEle = ele.getBoundingClientRect(),
            x = bbn.fn.roundDecimal(e.x, 0),
            y = bbn.fn.roundDecimal(e.y, 0),
            minLeft = bbn.fn.roundDecimal(-rectHelper.width + (rectHelper.right - rectEle.right) + 20, 0),
            minLeftPos = bbn.fn.roundDecimal(rectContainer.left + minLeft - (rectEle.left - rectHelper.left), 0),
            maxLeft = bbn.fn.roundDecimal(rectContainer.width - (rectEle.left - rectHelper.left) - 20, 0),
            maxLeftPos = bbn.fn.roundDecimal((rectEle.left + rectEle.width - rectHelper.left) + rectContainer.left + maxLeft, 0),
            minTop = bbn.fn.roundDecimal(-rectHelper.height + (rectHelper.bottom - rectEle.bottom) + 20, 0),
            minTopPos = bbn.fn.roundDecimal(rectContainer.top + minTop - (rectEle.top - rectHelper.top), 0),
            maxTop = bbn.fn.roundDecimal(rectContainer.height - (rectEle.top - rectHelper.top) - 20, 0),
            maxTopPos = bbn.fn.roundDecimal((rectEle.top + rectEle.height - rectHelper.top) + rectContainer.top + maxTop, 0),
            left = options.helper.offsetLeft - (ele._bbn.directives.draggable.mouseX - x),
            top = options.helper.offsetTop - (ele._bbn.directives.draggable.mouseY - y);

        if ((x < minLeftPos) || (options.helper.offsetLeft < minLeft)) {
          left = minLeft;
        }
        else if ((options.helper.offsetLeft > maxLeft)
          || ((x > (maxLeftPos - 20))
            && (options.helper.offsetLeft === maxLeft)
          )
        ) {
          left = maxLeft;
        }
        if ((y < minTopPos) || (options.helper.offsetTop < minTop)) {
          top = minTop;
        }
        else if ((options.helper.offsetTop > maxTop)
          || ((y > (maxTopPos - 20))
            && (options.helper.offsetTop === maxTop)
          )
        ) {
          top = maxTop;
        }
        if ((options.helper.offsetLeft === minLeft)) {
          if (ele._bbn.directives.draggable.mouseMinX === undefined) {
            ele._bbn.directives.draggable.mouseMinX = x;
          }
          else if (x >= minLeftPos) {
            if (x >= ele._bbn.directives.draggable.mouseMinX) {
              delete ele._bbn.directives.draggable.mouseMinX;
            }
            else {
              left = minLeft;
            }
          }
        }
        if ((options.helper.offsetLeft === maxLeft)) {
          if (ele._bbn.directives.draggable.mouseMaxX === undefined) {
            ele._bbn.directives.draggable.mouseMaxX = x;
          }
          else if (x <= maxLeftPos) {
            if (x <= ele._bbn.directives.draggable.mouseMaxX) {
              delete ele._bbn.directives.draggable.mouseMaxX;
            }
            else {
              left = maxLeft;
            }
          }
        }
        if ((options.helper.offsetTop === minTop)) {
          if (ele._bbn.directives.draggable.mouseMinY === undefined) {
            ele._bbn.directives.draggable.mouseMinY = y;
          }
          else if (y >= minTopPos) {
            if (y >= ele._bbn.directives.draggable.mouseMinY) {
              delete ele._bbn.directives.draggable.mouseMinY;
            }
            else {
              top = minTop;
            }
          }
        }
        if ((options.helper.offsetTop === maxTop)) {
          if (ele._bbn.directives.draggable.mouseMaxY === undefined) {
            ele._bbn.directives.draggable.mouseMaxY = y;
          }
          else if (y <= maxTopPos) {
            if (y <= ele._bbn.directives.draggable.mouseMaxY) {
              delete ele._bbn.directives.draggable.mouseMaxY;
            }
            else {
              top = maxTop;
            }
          }
        }
        if (left < minLeft) {
          left = minLeft;
        }
        if (top < minTop) {
          top = minTop;
        }
        if (left > maxLeft) {
          left = maxLeft;
        }
        if (top > maxTop) {
          top = maxTop;
        }
        options.helper.style.left = left + 'px';
        options.helper.style.top = top + 'px';
        let style = window.getComputedStyle(options.helper);
        if ((style.position !== 'absolute') && (style.position !== 'fixed') ) {
          options.helper.style.position = 'absolute';
        }
        ele._bbn.directives.draggable.mouseX = x;
        ele._bbn.directives.draggable.mouseY = y;
      }
      else {
        options.helper.style.left = e.pageX + 'px';
        options.helper.style.top = e.pageY + 'px';
      }
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
      if (options.mode !== 'move') {
        let target = e.target;
        if (target.dataset.bbn_droppable !== 'true') {
          target = target.closest('[data-bbn_droppable=true]');
        }
        if (target
          && (target !== ele)
          && !target.classList.contains('bbn-undroppable')
          && !!target._bbn
          && !!target._bbn.directives
          && !!target._bbn.directives.droppable
          && !!target._bbn.directives.droppable.active
        ) {
          let ev = new CustomEvent('dragoverdroppable', {
            cancelable: true,
            bubbles: true,
            detail: options
          });
          target.dispatchEvent(ev)
        }
      }
    }
  };

  const endDrag = (e, ele, options) => {
    if (!!ele._bbn.directives.draggable.active) {
      e.preventDefault();
      e.stopImmediatePropagation();
      options.helper.style.pointerEvents = ele._bbn.directives.draggable.pointerEvents;
      let target = options.mode !== 'move' ? e.target : false;
      if (bbn.fn.isDom(target)
        && (target.dataset.bbn_droppable_over !== 'true')
      ) {
        target = target.closest('[data-bbn_droppable_over=true]');
      }
      if (bbn.fn.isDom(target)
        && !target.classList.contains('bbn-undroppable')
        && !!target._bbn.directives.droppable
        && !!target._bbn.directives.droppable.active
      ) {
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
          if (!!options.mode && (options.mode === 'self')) {
            options.originalParent.insertBefore(options.originalElement, options.originalNextElement);
          }
        }
      }
      if (options.mode !== 'move') {
        options.helper.remove();
      }
      else {
        delete ele._bbn.directives.draggable.mouseX;
        delete ele._bbn.directives.draggable.mouseY;
        delete ele._bbn.directives.draggable.mouseMinX;
        delete ele._bbn.directives.draggable.mouseMaxX;
        delete ele._bbn.directives.draggable.mouseMinY;
        delete ele._bbn.directives.draggable.mouseMaxY;
      }
    }
  };

  const inserted = (el, binding) => {
    if (el._bbn === undefined) {
      el._bbn = {};
    }
    if (el._bbn.directives === undefined) {
      el._bbn.directives = {};
    }
    if (el._bbn.directives.draggable === undefined) {
      el._bbn.directives.draggable = {};
    }
    if ((binding.value !== false)
      && !el.classList.contains('bbn-undraggable')
    ) {
      el.dataset.bbn_draggable = true;
      el._bbn.directives.draggable = {
        active: true
      };
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
              bbn.fn.error(bbn._('No "component" property found'));
              throw bbn._('No "component" property found');
            }
            component = options.component;
          }
          if (asContainerFromMods) {
            if ((options.container === undefined)
              || !bbn.fn.isDom(options.container)
            ) {
              bbn.fn.error(bbn._('No "container" property found or not a DOM element'));
              throw bbn._('No "container" property found or not a DOM element');
            }
            container = options.container;
          }
          if (asDataFromMods) {
            if ((options.data === undefined)
              || !bbn.fn.isObject(options.data)
            ) {
              bbn.fn.error(bbn._('No "data" property found or not an object'));
              throw bbn._('No "data" property found or not an object');
            }
            data = options.data;
          }
          if (asModeFromMods) {
            if ((options.mode === undefined)
              || !bbn.fn.isString(options.mode)
            ) {
              bbn.fn.error(bbn._('No "mode" property found or not a string'));
              throw bbn._('No "mode" property found or not a string');
            }
            mode = options.mode;
          }
          if (asHelperFromMods) {
            if ((options.helper === undefined)
              || (!bbn.fn.isString(options.helper)
                && !bbn.fn.isDom(options.helper))
            ) {
              bbn.fn.error(bbn._('No "helper" property found or not a string or not a DOM element'));
              throw bbn._('No "helper" property found or not a string or not a DOM element');
            }
            helper = options.helper;
          }
        }
        else if (bbn.fn.isString(binding.value)) {
          switch (binding.value) {
            case 'clone':
            case 'move':
            case 'self':
              mode = binding.value;
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
      el._bbn.directives.draggable.options = options;
      // Add the events listener to capture the long press click and start the drag
      let clickTimeout = 0,
          holdClick = false;
      el._bbn.directives.draggable.onmousedown = ev => {
        if (!!el._bbn.directives.draggable.active) {
          el._bbn.directives.draggable.mouseX = ev.x;
          el._bbn.directives.draggable.mouseY = ev.y;
          if (clickTimeout) {
            clearTimeout(clickTimeout);
          }
          if (ev.button === 0) {
            holdClick = true;
            clickTimeout = setTimeout(() => {
              if (holdClick) {
                startDrag(ev, el, el._bbn.directives.draggable.options);
              }
            }, 150);
          }
        }
      };
      el.addEventListener('mousedown', el._bbn.directives.draggable.onmousedown);
      el._bbn.directives.draggable.onmouseup = ev => {
        if (!!el._bbn.directives.draggable.active) {
          holdClick = false;
        }
      };
      el.addEventListener('mouseup', el._bbn.directives.draggable.onmouseup);
    }
    else {
      el.dataset.bbn_draggable = false;
      el._bbn.directives.draggable = {
        active: false
      };
    }
  };

  bbn.vue.directive.draggable = {
    inserted: inserted,
    update: (el, binding) => {
      if ((binding.value !== false)
        && !el.classList.contains('bbn-undraggable')
      ) {
        if (binding.oldValue === false) {
          inserted(el, binding);
        }
        else {
          el.dataset.bbn_draggable = true;
          if (!el.classList.contains('bbn-draggable')) {
            el.classList.add('bbn-draggable');
          }
        }
      }
      else {
        el.dataset.bbn_draggable = false;
        if (el._bbn === undefined) {
          el._bbn = {};
        }
        if (el._bbn.directives === undefined) {
          el._bbn.directives = {};
        }
        if (el._bbn.directives.draggable === undefined) {
          el._bbn.directives.draggable = {};
        }
        if (!!el._bbn.directives.draggable.active) {
          if (bbn.fn.isFunction(el._bbn.directives.draggable.onmousedown)) {
            el.removeEventListener('mousedown', el._bbn.directives.draggable.onmousedown);
          }
          if (bbn.fn.isFunction(el._bbn.directives.draggable.onmouseup)) {
            el.removeEventListener('mouseup', el._bbn.directives.draggable.onmouseup);
          }
        }
        el._bbn.directives.draggable = {
          active: false
        };
        if (el.classList.contains('bbn-draggable')) {
          el.classList.remove('bbn-draggable');
        }
      }
    }
  };
})();
