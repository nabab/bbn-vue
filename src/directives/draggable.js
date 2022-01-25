const e = require("express");

(() => {
  let timeout;
  /**
   * Handles the start of dragging of the tree
   * @method startDrag  
   * @param {Event} e The event
   * @memberof bbn-tree-node
   */
  const startDrag = (e, ele, obj) => {
    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(() => {

      if (!this.doubleClk && (this.tree.draggable || this.sortable)  ){
        let ev = new CustomEvent("dragStart", {
          cancelable: true,
          bubbles: true,
          details: obj
        });
        ele.dispatchEvent(ev);
        if (!e.defaultPrevented) {
          e.stopImmediatePropagation();
        }

        let fnDrag = e => {
          drag(e, ele, obj);
        };

        let fnEnd = e => {
          endDrag(e, ele, obj);
          document.removeEventListener('mouseup', fnEnd);
          document.removeEventListener('mousemove', fnDrag);
        };
        document.addEventListener('mouseup', fnEnd);
        document.addEventListener('mousemove', fnDrag);
      }
    }, 100)
  };
  /**
   * Handles the dragging of the node
   * @method drag
   * @param {Event} e The event
   * @emits tree.dragStart
   * @emits  dragOver
   * @memberof bbn-tree-node
   */
  const drag = (e, ele, obj) => {
    // we prevent default from the event
    e.stopImmediatePropagation();
    e.preventDefault();
    // create helper
    let helper = document.createElement('div');
    helper.innerHTML = 
    helper.style.left = (e.pageX + 2) + 'px';
    helper.style.top = (e.pageY + 2) + 'px';
    if ( this.sortable ){
      if ( e.target.classList.contains('bbn-tree-order') ){
        if ( this.tree.overOrder !== e.target ){
          this.tree.overOrder = e.target;
        }
      }
      else {
        this.tree.overOrder = false;
      }
    }
    if ( !this.tree.realDragging ){
      if ( this.tree.selectedNode ){
        //this.tree.selectedNode.isSelected = false;
      }
      let ev = new Event("dragStart");
      this.tree.$emit("dragStart", this, ev);
      if (!ev.defaultPrevented) {
        this.tree.realDragging = true;
        let helper = this.tree.getRef('helper');
        if ( helper ) {
          helper.innerHTML = this.$el.outerHTML;
        }
      }
    }
    else{
      if ( this.tree.droppableTrees.length ){
        bbn.fn.each(this.tree.droppableTrees, a => {
          let v = a && a.$el ? a.$el.querySelector('.dropping') : null;
          if ( v && v.classList ){
            v.classList.remove('dropping');
          }
        });
      }
      let ok = false;
      for ( let a of this.tree.droppableTrees ){
        if (
          a.overNode &&
          (a.dragging !== a.overNode) &&
          !a.isNodeOf(a.overNode, this.tree.dragging) &&
          (!a.overNode.$refs.tree || (a.overNode.$refs.tree[0] !== this.parent))
        ){
          let t = e.target,
              parents = [];
          while (t) {
            parents.unshift(t);
            t = t.parentNode;
          }
          if ( parents.length ){
            bbn.fn.each(parents, (b, i) => {
              if ( b === a.overNode.$el ){
                ok = 1;
                return false;
              }
              else if ( b === this.$el ){
                return false;
              }
            })
          }
        }
        if ( ok ){
          let ev = new Event("dragOver", {cancelable: true});
          a.$emit("dragOver", this, ev, a.overNode);
          if (!ev.defaultPrevented) {
            bbn.fn.each(a.overNode.$el.chilNodes, ele => {
              if ((ele.tagName === 'SPAN') && (ele.classList.contains('node'))) {
                ele.classList.add('dropping');
                return false;
              }
            })
          }
        }
        else{
          a.overNode = false;
        }
      }

      let scroll = this.tree.getRef('scroll');
      if (scroll.hasScrollY && !scroll.isScrolling) {
        let coord = this.tree.$el.getBoundingClientRect();
        let step = Math.ceil(coord.height / 20);
        let margin = step * 4;
        let diff = 0;
        if (e.clientY < (coord.y + margin)) {
          diff = e.clientY - coord.y - margin;
        }
        else if (e.clientY > (coord.y + coord.height - margin)) {
          diff = e.clientY - (coord.y + coord.height - margin);
        }
        if (diff) {
          let approachLevel = Math.round(diff/step);
          scroll.addVertical(Math.round(scroll.$el.offsetHeight / 5) * approachLevel + 1);
          //bbn.fn.log(approachLevel);
        }
      }
    }
  };
  /**
   * Handles the end of dragging
   * @method endDrag
   * @param {Event} e The event
   * @emits tree.dragEnd
   * @memberof bbn-tree-node
   */
  const endDrag = e => {
    e.preventDefault();
    e.stopImmediatePropagation();
    let removed = false;
    if ( this.tree.realDragging ){
      this.tree.getRef('helper').innerHTML = '';
      this.tree.realDragging = false;
      if ( this.tree.droppableTrees.length ){
        for ( let a of this.tree.droppableTrees ){
          if (
            a.overNode &&
            (this.tree.dragging !== a.overNode) &&
            !a.isNodeOf(a.overNode, this.tree.dragging)
          ){
            if ( a.overOrder ){
              let numBefore = this.tree.dragging.source.num,
                  numAfter = a.overOrder.classList.contains('bbn-tree-order-top') ? 1 : a.overNode.source.num + 1;
                  if ( numBefore !== numAfter ){
                    this.reorder(this.tree.dragging.source.num, numAfter);
                  }
            }
            else if ( this.tree.draggable ){
              if( a.overNode.$el.querySelector('span.node') && a.overNode.$el.querySelector('span.node').classList ){
                if ( a.overNode.$el.querySelector('span.node').classList.contains('dropping') ){
                  a.overNode.$el.querySelector('span.node').classList.remove('dropping')
                }
              }
              this.removeDragging();
              removed = true;
              let ev = new Event("dragEnd", {cancelable: true});
              a.tree.$emit("dragEnd", ev, this, a.overNode);
              if ( !ev.defaultPrevented ){
                if ( a === this.tree ){
                  this.tree.move(this, a.overNode);
                }
              }
            }
          }
        }
      }
      else{
        let ev = new Event("dragEnd");
        this.removeDragging();
        removed = true;
        this.tree.$emit("dragEnd", this, ev);
      }
    }
    if ( !removed ){
      this.removeDragging();
    }
  };

  Vue.directive('draggable', {
    bind: function (el, binding, vnode) {


    },
    inserted(el, binding) {
      if (binding.value !== false) {
        let fn = ev => {
          startDrag(ev, el, binding);
        };

        el.addEventListener('mousedown', fn);
      }
    }
  });
})()

