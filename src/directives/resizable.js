(() => {
  const startDrag = (e, ele) => {
    if (!!ele._bbn.directives.resizable.active
      && !ele._bbn.directives.resizable.resizing
    ) {
      ele._bbn.directives.resizable.resizing = true;
      let cursor = ''
          modes = ele._bbn.directives.resizable.modes;
      if (!!modes.left) {
        cursor = !!modes.top ? 'nwse-resize' : (!!modes.bottom ? 'nesw-resize' : 'ew-resize');
      }
      else if (!!modes.right) {
        cursor = !!modes.top ? 'nesw-resize' : (!!modes.bottom ? 'nwse-resize' : 'ew-resize');
      }
      else if (!!modes.top) {
        cursor = !!modes.right ? 'nesw-resize' : (!!modes.left ? 'nwse-resize' : 'ns-resize');
      }
      else if (!!modes.bottom) {
        cursor = !!modes.right ? 'nwse-resize' : (!!modes.left ? 'nesw-resize' : 'ns-resize');
      }
      ele._bbn.directives.resizable.cursor = window.getComputedStyle(document.body).cursor;
      document.body.style.cursor = cursor;
      ele.classList.add('bbn-resizable-resizing');
      if (!ele._bbn.directives.resizable.container) {
        ele._bbn.directives.resizable.container = bbn.fn.isDom(ele.parentElement) ? ele.parentElement : document.body;
      }
      let ev = new CustomEvent('resizestart', {
        cancelable: true,
        bubbles: true,
        detail: ele._bbn.directives.resizable
      });
      ele.dispatchEvent(ev);
      if (!ev.defaultPrevented) {
        ev.stopImmediatePropagation();
        let fnDrag = e => {
          drag(e, ele);
        };
        let fnEnd = e => {
          endDrag(e, ele);
          document.removeEventListener('mousemove', fnDrag);
        };
        document.addEventListener('mouseup', fnEnd, {once: true});
        document.addEventListener('mousemove', fnDrag);
      }
    }
  };

  const drag = (e, ele) => {
    if (!!ele._bbn.directives.resizable.active) {
      // we prevent default from the event
      e.stopImmediatePropagation();
      e.preventDefault();
      let rectContainer = ele._bbn.directives.resizable.container.getBoundingClientRect(),
          rectEle = ele.getBoundingClientRect(),
          x = bbn.fn.roundDecimal(e.x, 0),
          y = bbn.fn.roundDecimal(e.y, 0),
          modes = ele._bbn.directives.resizable.modes,
          minWidth = 10,
          maxWidth = rectContainer.width,
          minHeight = 10,
          maxHeight = rectContainer.height,
          xMovement = ele._bbn.directives.resizable.mouseX - x,
          yMovement = ele._bbn.directives.resizable.mouseY - y,
          width = ele.offsetWidth + (!!modes.left ? xMovement : -xMovement),
          height = ele.offsetHeight + (!!modes.top ? yMovement : -yMovement);

      width = width < minWidth ? minWidth : (width > maxWidth ? maxWidth : width);
      height = height < minHeight ? minHeight : (height > maxHeight ? maxHeight : height);

      let style = window.getComputedStyle(ele);
      if ((!!modes.left && xMovement)
        || (!!modes.top && yMovement)
      ) {
        if ((style.position !== 'absolute')
          && (style.position !== 'fixed')
        ) {
          ele.style.position = 'absolute';
        }
        if (!!modes.left && xMovement && (width !== rectEle.width)) {
          bbn.fn.log('aaa', xMovement, width, rectEle.width)
          ele.style.left = ele.offsetLeft - xMovement + 'px';
        }
        if (!!modes.top && yMovement) {
          ele.style.top = ele.offsetTop - yMovement + 'px';
        }
      }
      if (!!modes.left || !!modes.right) {
        ele.style.width = width + 'px';
      }
      if (!!modes.top || !!modes.bottom) {
        ele.style.height = height + 'px';
      }
      ele._bbn.directives.resizable.mouseX = x;
      ele._bbn.directives.resizable.mouseY = y;
    }
  };

  const endDrag = (e, ele) => {
    if (!!ele._bbn.directives.resizable.active) {
      ele._bbn.directives.resizable.resizing = false;
      ele.classList.remove('bbn-resizable-resizing');
      document.body.style.cursor = ele._bbn.directives.resizable.cursor;
      e.preventDefault();
      e.stopImmediatePropagation();
      let ev = new CustomEvent('resizeend', {
        cancelable: true,
        bubbles: true,
        detail: ele._bbn.directives.resizable
      });
      ele.dispatchEvent(ev);
      delete ele._bbn.directives.resizable.mouseX;
      delete ele._bbn.directives.resizable.mouseY;
    }
  };

  const inserted = (el, binding) => {
    bbn.fn.log('binding', binding)
    if (el._bbn === undefined) {
      el._bbn = {};
    }
    if (el._bbn.directives === undefined) {
      el._bbn.directives = {};
    }
    if (el._bbn.directives.resizable === undefined) {
      el._bbn.directives.resizable = {};
    }
    if ((binding.value !== false)
      && !el.classList.contains('bbn-unresizable')
    ) {
      let options = {},
          asMods = bbn.fn.isObject(binding.modifiers) && bbn.fn.numProperties(binding.modifiers),
          asContainerFromMods = asMods && !!binding.modifiers.container,
          asArg = !!binding.arg && binding.arg.length,
          modes = {
            top: !asMods || !!binding.modifiers.top,
            right: !asMods || !!binding.modifiers.right,
            bottom: !asMods || !!binding.modifiers.bottom,
            left: !asMods || !!binding.modifiers.left
          },
          container = false;
      el.dataset.bbn_resizable = true;
      el._bbn.directives.resizable = {
        active: true,
        resizing: false,
        enabledModes: modes
      };
      if (!el.classList.contains('bbn-resizable')) {
        el.classList.add('bbn-resizable');
      }

      if (asArg) {
        switch (binding.arg) {
          case 'container':
            container = binding.value;
            break;
        }
      }
      else {
        if (bbn.fn.isObject(binding.value)) {
          options = binding.value;
          if (asContainerFromMods) {
            if ((options.container === undefined)
              || !bbn.fn.isDom(options.container)
            ) {
              bbn.fn.error(bbn._('No "container" property found or not a DOM element'));
              throw bbn._('No "container" property found or not a DOM element');
            }
            container = options.container;
          }
        }
      }
      el._bbn.directives.resizable.container = container;
      el._bbn.directives.resizable.options = options;
      el._bbn.directives.resizable.onmousemove = ev => {
        if (!!el._bbn.directives.resizable.active
          && !el._bbn.directives.resizable.resizing
        ) {
          let rect = el.getBoundingClientRect(),
              m = {};
          if (modes.left
            && (ev.x >= (rect.left - 2))
            && (ev.x <= (rect.left + 2))
          ) {
            m.left = true;
            el.classList.add('bbn-resizable-over-left');
          }
          else {
            el.classList.remove('bbn-resizable-over-left');
          }
          if (modes.right
            && (ev.x >= (rect.left + rect.width - 2))
            && (ev.x <= (rect.left + rect.width + 2))
          ) {
            m.right = true;
            el.classList.add('bbn-resizable-over-right');
          }
          else {
            el.classList.remove('bbn-resizable-over-right');
          }
          if (modes.top
            && (ev.y >= (rect.top - 2))
            && (ev.y <= (rect.top + 2))
          ) {
            m.top = true;
            el.classList.add('bbn-resizable-over-top');
          }
          else {
            el.classList.remove('bbn-resizable-over-top');
          }
          if (modes.bottom
            && (ev.y >= (rect.top + rect.height - 2))
            && (ev.y <= (rect.top + rect.height + 2))
          ) {
            m.bottom = true;
            el.classList.add('bbn-resizable-over-bottom');
          }
          else {
            el.classList.remove('bbn-resizable-over-bottom');
          }
          if (!el._bbn.directives.resizable.resizing) {
            el._bbn.directives.resizable.modes = m;
          }
        }
      };
      el.addEventListener('mousemove', el._bbn.directives.resizable.onmousemove);

      // Add the events listener to capture the long press click and start the drag
      let clickTimeout = 0,
          holdClick = false;
      el._bbn.directives.resizable.onmousedown = ev => {
        if (!!el._bbn.directives.resizable.active
          && !el._bbn.directives.resizable.resizing
          && !!el._bbn.directives.resizable.modes
          && bbn.fn.numProperties(el._bbn.directives.resizable.modes)
        ) {
          if (clickTimeout) {
            clearTimeout(clickTimeout);
          }
          if (ev.button === 0) {
            holdClick = true;
            clickTimeout = setTimeout(() => {
              if (holdClick) {
                startDrag(ev, el);
              }
            }, 150);
          }
        }
      };
      el.addEventListener('mousedown', el._bbn.directives.resizable.onmousedown);
      el._bbn.directives.resizable.onmouseup = ev => {
        if (!!el._bbn.directives.resizable.active) {
          holdClick = false;
        }
      };
      el.addEventListener('mouseup', el._bbn.directives.resizable.onmouseup);
    }
    else {
      el.dataset.resizable = false;
      el._bbn.directives.resizable = {
        active: false
      };
    }
  };

  Vue.directive('resizable', {
    inserted: inserted,
    update: (el, binding) => {
      if ((binding.value !== false)
        && !el.classList.contains('bbn-unresizable')
      ) {
        if (binding.oldValue === false) {
          inserted(el, binding);
        }
        else {
          el.dataset.bbn_resizable = true;
          if (!el.classList.contains('bbn-resizable')) {
            el.classList.add('bbn-resizable');
          }
        }
      }
      else {
        el.dataset.bbn_resizable = false;
        if (el._bbn === undefined) {
          el._bbn = {};
        }
        if (el._bbn.directives === undefined) {
          el._bbn.directives = {};
        }
        if (el._bbn.directives.resizable === undefined) {
          el._bbn.directives.resizable = {};
        }
        if (!!el._bbn.directives.resizable.active) {
          if (bbn.fn.isFunction(el._bbn.directives.resizable.onmousedown)) {
            el.removeEventListener('mousedown', el._bbn.directives.resizable.onmousedown);
          }
          if (bbn.fn.isFunction(el._bbn.directives.resizable.onmouseup)) {
            el.removeEventListener('mouseup', el._bbn.directives.resizable.onmouseup);
          }
          if (bbn.fn.isFunction(el._bbn.directives.resizable.onmousemove)) {
            el.removeEventListener('mousemove', el._bbn.directives.resizable.onmousemove);
          }
        }
        el._bbn.directives.resizable = {
          active: false
        };
        if (el.classList.contains('bbn-resizable')) {
          el.classList.remove('bbn-resizable');
        }
      }
    }
  });
})();
