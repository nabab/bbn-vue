(() => {
  var isDragging = false;
  var currentEle = false;

  const fnDrag = e => {
    drag(e, currentEle);
  };

  const fnEnd = e => {
    endDrag(e, currentEle);
    document.removeEventListener('mousemove', fnDrag);
    isDragging = false;
  };

  const startDrag = (e, ele) => {
    if (!isDragging
      && !!ele._bbn.directives.resizable.active
      && !ele._bbn.directives.resizable.resizing
      && !!ele._bbn.directives.resizable.modes
      && bbn.fn.numProperties(ele._bbn.directives.resizable.modes)
    ) {
      isDragging = true;
      currentEle = ele;
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
      ele._bbn.directives.resizable.mouseX = bbn.fn.roundDecimal(e.x, 0);
      ele._bbn.directives.resizable.mouseY = bbn.fn.roundDecimal(e.y, 0);
      if (!ele._bbn.directives.resizable.container) {
        ele._bbn.directives.resizable.container = bbn.fn.isDom(ele.parentElement) ? ele.parentElement : document.body;
      }
      let ev = new CustomEvent('userresizestart', {
        cancelable: true,
        bubbles: true,
        detail: ele._bbn.directives.resizable
      });
      ele.dispatchEvent(ev);
      if (ele.__vue__ !== undefined) {
        ele.__vue__.$emit('userresizestart', ev);
      }
      if (!ev.defaultPrevented) {
        ev.stopImmediatePropagation();
        document.addEventListener('mouseup', fnEnd, {once: true});
        document.addEventListener('mousemove', fnDrag);
      }
    }
  };

  const drag = (e, ele) => {
    if (!!ele._bbn.directives.resizable.active
      && !!ele._bbn.directives.resizable.resizing
    ) {
      // we prevent default from the event
      e.stopImmediatePropagation();
      e.preventDefault();
      let rectCont = ele._bbn.directives.resizable.container.getBoundingClientRect(),
          rectEle = ele.getBoundingClientRect(),
          styleEle = window.getComputedStyle(ele),
          styleContainer = window.getComputedStyle(ele._bbn.directives.resizable.container),
          x = bbn.fn.roundDecimal(e.x, 0),
          y = bbn.fn.roundDecimal(e.y, 0),
          modes = ele._bbn.directives.resizable.modes,
          xMovement = bbn.fn.roundDecimal(ele._bbn.directives.resizable.mouseX - x, 0),
          yMovement = bbn.fn.roundDecimal(ele._bbn.directives.resizable.mouseY - y, 0),
          width = rectEle.width + (!!modes.left ? xMovement : -xMovement),
          height = rectEle.height + (!!modes.top ? yMovement : -yMovement),
          isAbs = styleEle.position === 'absolute',
          isFixed = styleEle.position === 'fixed',
          toSetAbs = false,
          element = {
            minWidth: ((parseFloat(styleEle.paddingLeft) || 0) +
              (parseFloat(styleEle.paddingRight) || 0) +
              (parseFloat(styleEle.borderLeft) || 0) +
              (parseFloat(styleEle.borderRight) || 0)) || 1,
            maxWidth: rectCont.width,
            minHeight: ((parseFloat(styleEle.paddingTop) || 0) +
              (parseFloat(styleEle.paddingBottom) || 0) +
              (parseFloat(styleEle.borderTop) || 0) +
              (parseFloat(styleEle.borderBottom) || 0)) || 1,
            maxHeight: rectCont.height,
            margin: {
              top: parseFloat(styleEle.marginTop) || 0,
              right: parseFloat(styleEle.marginRight) || 0,
              bottom: parseFloat(styleEle.marginBottom) || 0,
              left: parseFloat(styleEle.marginLeft) || 0,
            },
            padding : {
              top: parseFloat(styleEle.paddingTop) || 0,
              right: parseFloat(styleEle.paddingRight) || 0,
              bottom: parseFloat(styleEle.paddingBottom) || 0,
              left: parseFloat(styleEle.paddingLeft) || 0
            },
            border : {
              top: parseFloat(styleEle.borderTop) || 0,
              right: parseFloat(styleEle.borderRight) || 0,
              bottom: parseFloat(styleEle.borderBottom) || 0,
              left: parseFloat(styleEle.borderLeft) || 0
            }
          },
          container = {
            margin: {
              top: parseFloat(styleContainer.marginTop) || 0,
              right: parseFloat(styleContainer.marginRight) || 0,
              bottom: parseFloat(styleContainer.marginBottom) || 0,
              left: parseFloat(styleContainer.marginLeft) || 0,
            },
            padding : {
              top: parseFloat(styleContainer.paddingTop) || 0,
              right: parseFloat(styleContainer.paddingRight) || 0,
              bottom: parseFloat(styleContainer.paddingBottom) || 0,
              left: parseFloat(styleContainer.paddingLeft) || 0
            },
            border : {
              top: parseFloat(styleContainer.borderTop) || 0,
              right: parseFloat(styleContainer.borderRight) || 0,
              bottom: parseFloat(styleContainer.borderBottom) || 0,
              left: parseFloat(styleContainer.borderLeft) || 0
            }
          };
      element.margin.totalX = element.margin.left + element.margin.right;
      element.margin.totalY = element.margin.top + element.margin.bottom;
      container.margin.totalX = container.margin.left + container.margin.right;
      container.margin.totalY = container.margin.top + container.margin.bottom;
      container.padding.totalX = container.padding.left + container.padding.right;
      container.padding.totalY = container.padding.top + container.padding.bottom;
      if (element.maxWidth > (rectCont.width - container.padding.totalX - element.margin.totalX)) {
        element.maxWidth = rectCont.width - container.padding.totalX - element.margin.totalX;
      }

      if (element.maxHeight > (rectCont.height - container.padding.totalY - element.margin.totalY)) {
        element.maxHeight = rectCont.height - container.padding.totalY - element.margin.totalY;
      }

      width = width < element.minWidth ?
        element.minWidth :
        (width > element.maxWidth ? element.maxWidth : width);
      height = height < element.minHeight ?
        element.minHeight :
        (height > element.maxHeight ? element.maxHeight : height);
      if ((!!modes.left || !!modes.right) && xMovement) {
        if (!!modes.left) {
          const minLeft = rectCont.left +
            container.padding.left +
            container.border.left +
            element.margin.left;
          var tmpLeft = rectEle.left - xMovement;
          if (tmpLeft < minLeft) {
            xMovement = minLeft - tmpLeft;
            width -= xMovement;
            tmpLeft = minLeft;
          }
        }

        if (width !== rectEle.width) {
          let ev = makeEvent(!!modes.left ? 'left' : 'right', xMovement, width, rectEle.width);
          ele.dispatchEvent(ev);
          if (!ev.defaultPrevented) {
            if (!!modes.left && xMovement) {
              if (!isAbs && !isFixed) {
                toSetAbs = true;
                isAbs = true;
              }
              if (isAbs) {
                tmpLeft -= rectCont.left;
              }
              ele.style.left = tmpLeft - element.margin.left + 'px';
            }
            setSize(ele, styleEle.height, width + 'px', toSetAbs);
          }
        }
      }
      if ((!!modes.top || !!modes.bottom) && yMovement) {
        if (!!modes.top) {
          const minTop = rectCont.top +
            container.padding.top +
            container.border.top +
            element.margin.top;
          var tmpTop = rectEle.top - yMovement;
          if (tmpTop < minTop) {
            yMovement = minTop - tmpTop;
            height -= yMovement;
            tmpTop = minTop;
          }
        }

        if (height !== rectEle.height) {
          let ev = makeEvent(!!modes.top ? 'top' : 'bottom', yMovement, height, rectEle.height);
          ele.dispatchEvent(ev);
          if (!ev.defaultPrevented) {
            if (!!modes.top && yMovement) {
              if (!isAbs && !isFixed) {
                toSetAbs = true;
                isAbs = true;
              }
              if (isAbs) {
                tmpTop -= rectCont.top;
              }
              ele.style.top = tmpTop - element.margin.top + 'px';
            }
            setSize(ele, height + 'px', styleEle.width, toSetAbs);
          }
        }
      }
      ele._bbn.directives.resizable.mouseX = x;
      ele._bbn.directives.resizable.mouseY = y;
    }
  };

  const makeEvent = (from, movement, size, oldSize) => {
    return new CustomEvent('userresize', {
      cancelable: true,
      bubbles: true,
      detail: bbn.fn.createObject({
        from: from,
        movement: movement,
        size: size,
        oldSize: oldSize
      })
    });
  };

  const setSize = (ele, height, width, abs) => {
    ele.style.height = height;
    ele.style.width = width;
    if (abs) {
      ele.style.position = 'absolute';
    }
    if (ele.__vue__ !== undefined) {
      ele.__vue__.$emit('userresize', ev, detail);
      if (!ev.defaultPrevented
        && (ele.__vue__.parentResizer !== undefined)
        && bbn.fn.isFunction(ele.__vue__.parentResizer.onResize)
      ) {
        ele.__vue__.parentResizer.onResize();
      }
    }
  };

  const endDrag = (e, ele) => {
    if (isDragging
      && !!ele._bbn.directives.resizable.active
      && !!ele._bbn.directives.resizable.resizing
    ) {
      ele._bbn.directives.resizable.resizing = false;
      ele.classList.remove('bbn-resizable-resizing');
      document.body.style.cursor = ele._bbn.directives.resizable.cursor;
      e.preventDefault();
      e.stopImmediatePropagation();
      let ev = new CustomEvent('userresizeend', {
        cancelable: true,
        bubbles: true,
        detail: ele._bbn.directives.resizable
      });
      ele.dispatchEvent(ev);
      if (ele.__vue__ !== undefined) {
        ele.__vue__.$emit('userresizestart', ev);
      }
      document.removeEventListener('mouseup', fnEnd, {once: true});
      document.removeEventListener('mousemove', fnDrag);
      delete ele._bbn.directives.resizable.mouseX;
      delete ele._bbn.directives.resizable.mouseY;
    }
  };

  const inserted = (el, binding) => {
    if (analyzeValue(el, binding)) {
      el._bbn.directives.resizable.onmousemove = ev => {
        if (!!el._bbn.directives.resizable.active
          && !el._bbn.directives.resizable.resizing
        ) {
          let rect = el.getBoundingClientRect(),
              modes = el._bbn.directives.resizable.enabledModes,
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
        if (clickTimeout) {
          clearTimeout(clickTimeout);
        }
        if (!!el._bbn.directives.resizable.active
          && !el._bbn.directives.resizable.resizing
          && !!el._bbn.directives.resizable.modes
          && bbn.fn.numProperties(el._bbn.directives.resizable.modes)
        ) {
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
  };

  const analyzeValue = (el, binding) => {
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
      return true;
    }
    else {
      el.dataset.resizable = false;
      el._bbn.directives.resizable = {
        active: false
      };
      return false;
    }
  };

  const setOff = el => {
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
        else if (!isDragging){
          analyzeValue(el, binding);
        }
      }
      else {
        setOff(el);
      }
    }
  });
})();
