/**
 * Created by BBN on 15/02/2017.
 */
(function($, bbn, kendo){
  "use strict";

  /**
   * Classic input with normalized appearance
   */
  Vue.component('bbn-splitter', {
    mixins: [bbn.vue.basicComponent, bbn.vue.optionComponent, bbn.vue.resizerComponent],
    props: {
      orientation: {
        type: String,
        default: 'auto'
      },
      resizable: {
        type: Boolean,
        default: false
      },
      collapsible: {
        type: Boolean,
        default: false
      },
      scrollable: {
        type: Boolean,
        default: false
      },
      resizerSize: {
        type: Number,
        default: 10
      },
      resizerClass: {
        type: [String, Function]
      },
      minPaneSize: {
        type: Number,
        default: 20
      }
    },
    data(){
      return {
        _mountingTimeout: false,
        resizeTimeout: false,
        initTimeout: 0,
        isResized: false,
        /**
         * An array consisting of each resizer objects (the bars separating resizable panes).
         * @returns {Array}
         */
        resizers: [],
        currentOrientation: this.orientation,
        panes: []
      };
    },
    computed: {
      isResizable(){
        return (this.resizable || this.collapsible) && (bbn.fn.count(this.panes, {resizable: true}) >= 2)
      },
      /**
       * What will be actually in the CSS for grid-template-columns.
       * @returns {string}
       */
      columnsCfg(){
        return this.panes.length && (this.currentOrientation === 'horizontal') ?
          this.getFormatted() : 'auto';
      },
      /**
       * What will be actually in the CSS for grid-template-rows.
       * @returns {string}
       */
      rowsCfg(){
        return this.panes.length && (this.currentOrientation === 'vertical') ?
          this.getFormatted() : 'auto';
      },
      /**
       * x or y.
       * @returns {string}
       */
      currentAxis(){
        return this.currentOrientation === 'horizontal' ? 'x' : 'y'
      },
      /**
       * left or top.
       * @returns {string}
       */
      currentOffType(){
        return this.currentOrientation === 'horizontal' ? 'left' : 'top';
      },
      /**
       * width or height.
       * @returns {string}
       */
      currentSizeType(){
        return this.currentOrientation === 'horizontal' ? 'Width' : 'Height';
      },
      /**
       * Size of the container as given by bbn.
       * @returns {string}
       */
      currentSize(){
        return this['lastKnown' + this.currentSizeType];
      },
      /**
       * Difference between currentSize (container's size) and addition of panes' sizes.
       * @returns {bbn-splitter.computed.currentSize}
       */
      availableSize(){
        let availableSize = this.currentSize;
        $.each(this.resizers, (i, a) => {
          availableSize -= this.resizerSize;
        });
        return availableSize;
      },

    },
    methods: {
      /**
       * Returns the calculated grid-template-rows or grid-template-columns as CSS string.
       * @returns {string}
       */
      getFormatted(){
        /**
         * The position of the panes, starting at 1; gapos will be created for resizers.
         * @type {number}
         */
        let pos = 1,
            lastVisibleResizer = false,
            tmp = this.panes.map((a, i) => {
                  /**
                   * The additions of the 2 differences: difference is the current difference while resizing while oDifference is the original difference resulting from other resizings.
                   * @type {number}
                   */
              let diff = a.difference + a.oDifference + a.addedDiff,
                 /**
                  * The resulting string for the CSS property.
                  * @type {string}
                  */
                  sz = '',
                  rsAdded = false;
              // If position is not the one expected it means a resizer is before so it's added as a column
              while ( a.position > pos ){
                sz += lastVisibleResizer ? '0 ' : '8px ';
                lastVisibleResizer = true;
                pos++;
              }
              // If the pane is collapsed we just mark its size at 0
              if ( a.collapsed ){
                sz += '0 ';
              }
              // If it's a number it will be a sum with the existing diff
              else {
                lastVisibleResizer = false;
                if ( a.addedSize && (a.addedSize === 'auto') ){
                  sz += 'auto';
                }
                else if ( a.size ){
                  if ( a.addedSize || diff ){
                    sz += 'calc( ';
                    sz += a.size + (a.isNumber ? 'px' : '');
                    if ( diff ){
                      sz += ' + ' + diff + 'px';
                    }
                    if ( a.addedSize ){
                      sz += ' + ' + (typeof a.addedSize === 'number' ? a.addedSize + 'px' : a.addedSize);
                    }
                    sz += ')';
                  }
                  else if ( a.size ){
                    sz += a.size + (a.isNumber ? 'px' : '');
                  }
                }
                else {
                  sz += 'auto';
                }
              }
              pos++;
              return sz;
            });
        return tmp.join(' ');
      },
      /**
       * returns the resizer's class according to its resizerClass prop.
       * @param resizer
       * @returns {*}
       */
      realResizerClass(resizer){
        if ( $.isFunction(this.resizerClass) ){
          return this.resizerClass(resizer);
        }
        return '';
      },
      /**
       * Returns orientation based on the largest side.
       * @returns {string}
       */
      getOrientation(){
        return this.lastKnownWidth > this.lastKnownHeight ? 'horizontal' : 'vertical';
      },
      /**
       *
       */
      onResize(){
        if ( this.orientation === 'auto' ){
          let o = this.getOrientation();
          if ( o !== this.currentOrientation ){
            this.currentOrientation = o;
          }
        }
      },
      /**
       * Is used when collapsed
       * @todo check it out
       */
      updatePositions(){
        /*
        $.each(this.panes, (i, pane) => {
          this.$children[pane.index].$el.style.gridColumn = this.currentOrientation === 'horizontal' ? pane.position : 1;
          this.$children[pane.index].$el.style.gridRow = this.currentOrientation === 'vertical' ? pane.position : 1;
        })
        */
      },
      getNextResizable(idx, arr){
        for ( let i = idx+1; i < arr.length; i++ ){
          if ( arr[i].resizable ){
            return i;
          }
        }
        return false;
      },
      getPrevResizable(idx, arr){
        for ( let i = idx-1; i >= 0; i-- ){
          if ( arr[i].resizable ){
            return i;
          }
        }
        return false;
      },
      getNextCollapsible(idx, arr){
        for ( let i = idx+1; i < arr.length; i++ ){
          if ( arr[i].collapsible ){
            return i;
          }
        }
        return false;
      },
      getPrevCollapsible(idx, arr){
        for ( let i = idx-1; i >= 0; i-- ){
          if ( arr[i].collapsible ){
            return i;
          }
        }
        return false;
      },
      /**
       * Triggered by the panes being mounted, analyzes the splitter's content in order to define its panes.
       */
      init(){
        // As we want to execute it only once and as it is triggered multiple times (by each pane)
        // We add a timeout which cancels the previous one so it should be only triggered once at mount
        clearTimeout(this.initTimeout);
        this.initTimeout = setTimeout(() => {
          // Emptying the panes array if it's filled
          this.panes.splice(0, this.panes.length);
          // position starts at 1
          let currentPosition = 1,
              tmp = [];
          // If 1st pane is collapsible we add a resizer at the start
          this.$children.forEach((pane, i) => {
            // Defining the panes base on the content
            if ( pane.$vnode.componentOptions.tag === 'bbn-pane' ){
              let isPercent = false,
                  isFixed = false,
                  isNumber = false,
                  props = JSON.parse(JSON.stringify(pane.$vnode.componentOptions.propsData)),
                  resizable = this.resizable && (props.resizable !== false),
                  collapsible = this.collapsible && (props.collapsible !== false),
                  value = parseInt(props.size) || 0;
              if ( props.size ){
                isFixed = true;
                if ( props.size === 'auto' ){
                  props.size = false;
                }
                else if ( (typeof props.size === 'string') && (props.size.substr(-1) === '%') ){
                  isPercent = true;
                }
                else if ( (typeof props.size === 'string') && (props.size.substr(-2) === 'px') ){
                  isNumber = true;
                  props.size = parseInt(props.size);
                }
                else if ( (typeof props.size === 'number') ){
                  isNumber = true;
                }
              }
              let obj = $.extend({
                index: i,
                value: value,
                difference: 0,
                oDifference: 0,
                addedSize: '',
                addedDiff: 0,
                collapsed: false,
                isPercent: isPercent,
                isFixed: isFixed,
                isNumber: isNumber,
                resizable: resizable,
                collapsible: collapsible,
                isResizable: collapsible || resizable,
              }, props);
              tmp.push(obj);
            }
          });
          /*
          if ( (idx === 0) && pane.collapsible ){
            this.resizers.push({
              position: pos,
              pane1: {
                obj: this.panes[assoc.index],
                cp: bbn.vue.find(this, 'bbn-pane', assoc.index)
              },
              pane2: {
                obj: pane,
                cp: bbn.vue.find(this, 'bbn-pane', i)
              },
            });
            pos++;
          }
          */
          let isResizable = bbn.fn.count(tmp, {isResizable: true}) >= 2;
          // We will populate resizers
          this.resizers.splice(0, this.resizers.length);
          tmp.forEach((pane, idx) => {
            let prev, next, prevc, nextc;
            if ( isResizable && pane.isResizable ){
              prev = this.getPrevResizable(idx, tmp);
              next = this.getNextResizable(idx, tmp);
              prevc = this.getPrevCollapsible(idx, tmp);
              nextc = this.getNextCollapsible(idx, tmp);
              // First collapsible
              if ( (prev !== false) || (prevc !== false) ){
                bbn.fn.log("------ case 2", idx + ' position ' + currentPosition);
                let o = {
                  position: currentPosition,
                  panec1: false,
                  panec2: false,
                  pane1: false,
                  pane2: false
                };
                if ( this.resizable && pane.resizable && (prev !== false) ){
                  o.pane1 = prev;
                  o.pane2 = idx;
                }
                if ( this.collapsible && pane.collapsible && (prevc !== false) ){
                  o.panec1 = prevc;
                  o.panec2 = idx;
                }
                this.resizers.push(o);
                currentPosition++;
              }
            }
            pane.position = currentPosition;
            this.panes.push(pane);
            currentPosition++;
            if ( isResizable && pane.isResizable ){
              // Last collapsible
              let o = {
                position: currentPosition,
                panec1: false,
                panec2: false,
                pane1: false,
                pane2: false
              };
              if (
                ((prev === false) && next && !tmp[idx + 1].resizable) ||
                ((prevc === false) && nextc && !tmp[idx + 1].collapsible)
              ){
                bbn.fn.log("------ case 4", idx + ' position ' + currentPosition);
                if (
                  this.resizable &&
                  pane.resizable &&
                  (prev === false) &&
                  next &&
                  !tmp[idx + 1].resizable
                ){
                  o.pane1 = idx;
                  o.pane2 = next;
                }
                if (
                  this.collapsible &&
                  pane.collapsible &&
                  (prevc === false) &&
                  nextc &&
                  !tmp[idx + 1].collapsible
                ){
                  o.panec1 = idx;
                  o.panec2 = nextc;
                }
              }
              if ( o.panec2 || o.pane2 ){
                this.resizers.push(o);
                currentPosition++;
              }
            }
          });
          this.$forceUpdate();
          if ( this.isResizable ){
            setTimeout(() =>{
              this.resizers.forEach((a, i) => {
                if ( a.pane2 ){
                  //bbn.fn.log("DRAGGABLE?", this.$refs.resizer[i]);
                  let prop = this.currentOrientation === 'horizontal' ? 'left' : 'top',
                      pane1 = bbn.vue.find(this, 'bbn-pane', a.pane1),
                      pane2 = bbn.vue.find(this, 'bbn-pane', a.pane2),
                      max,
                      min;
                  $(this.$refs.resizer[i]).draggable({
                    helper: 'clone',
                    containment: "parent",
                    opacity: 0.1,
                    axis: this.currentAxis,
                    start: (e, ui) => {
                      if ( (a.panec1 && a.panec1.collapsed) || (a.panec2 && a.panec2.collapsed) ){
                        e.preventDefault();
                        return false;
                      }
                      /**
                       * Pane on the left side of the resizer
                       * @type {ClientRect}
                       */
                      let pos1 = pane1.$el.getBoundingClientRect(),
                          /**
                           * Pane on the right side of the resizer
                           * @type {ClientRect}
                           */
                          pos2 = pane2.$el.getBoundingClientRect();
                      min = -pos1.width;
                      max = pos2.width;
                      bbn.fn.log("START", min, max, ui.position[prop] + '/' + ui.originalPosition[prop], "------------");
                    },
                    drag: (e, ui) =>{
                      let diff = ui.position[prop] - ui.originalPosition[prop];
                      //bbn.fn.log(diff, max, min);
                      if ( diff >= max ){
                        diff = max - 5;
                      }
                      else if ( diff <= min ){
                        diff = min + 5;
                      }
                      this.$set(this.panes[a.pane2], 'difference', -diff);
                      this.$set(this.panes[a.pane1], 'difference', diff);
                    },
                    stop: (e, ui) =>{
                      let diff = ui.position[prop] - ui.originalPosition[prop];
                      if ( diff >= max ){
                        diff = max - 5;
                      }
                      else if ( diff <= min ){
                        diff = min + 5;
                      }
                      this.$set(this.panes[a.pane2], 'difference', 0);
                      this.$set(this.panes[a.pane1], 'difference', 0);
                      this.$set(this.panes[a.pane2], 'oDifference', this.panes[a.pane2].oDifference - diff);
                      this.$set(this.panes[a.pane1], 'oDifference', this.panes[a.pane1].oDifference + diff);
                      this.selfEmit(true);
                    }
                  })
                }
              });
            }, 200)
          }
          this.ready = true;
          this.selfEmit(true);
        }, 200);
      },
      collapse(toCollapse, toUpdate, full){
        if ( this.collapsible && this.panes[toCollapse] && this.panes[toUpdate] ){
          let collapsing = !this.panes[toCollapse].collapsed,
              smaller = collapsing ? toCollapse : toUpdate,
              bigger = collapsing ? toUpdate : toCollapse,
              diff1 = this.panes[smaller].oDifference,
              diff2 = this.panes[bigger].oDifference;
          bbn.fn.log(toCollapse, toUpdate, smaller, bigger, diff1, diff2);
          if ( !full && (this.panes[toCollapse].collapsed || this.panes[toUpdate].collapsed) ){
            this.$set(this.panes[smaller], 'addedSize', '');
            this.$set(this.panes[smaller], 'addedSize', '');
            this.$set(this.panes[bigger], 'addedDiff', 0);
            this.$set(this.panes[bigger], 'addedDiff', 0);
            this.$set(this.panes[smaller], 'collapsed', false);
            this.$set(this.panes[bigger], 'collapsed', false);
          }
          // The other is also collapsed and the double arrow is clicked: switching
          else if ( full && (this.panes[toUpdate].collapsed === collapsing) ){
            this.$set(this.panes[bigger], 'addedDiff', diff2);
            this.$set(this.panes[smaller], 'addedDiff', 0);
            if ( this.panes[smaller].size ){
              this.$set(this.panes[bigger], 'addedSize', this.panes[smaller].size)
            }
            this.$set(this.panes[bigger], 'collapsed', false);
            this.$set(this.panes[smaller], 'collapsed', true);
          }
          else{
            if ( this.panes[toCollapse].size && this.panes[toUpdate].size ){
              this.$set(this.panes[bigger], 'addedSize', this.panes[smaller].size);
            }
            else{
              this.$set(this.panes[bigger], 'addedSize', 'auto');
            }
            this.$set(this.panes[bigger], 'addedDiff', diff1);
            this.$set(this.panes[smaller], 'addedDiff', 0);
            this.$set(this.panes[toCollapse], 'collapsed', collapsing);
          }
        }
      },
      hasExpander(paneIdx, resizerIdx){
        return false;
        let pane = this.panes[paneIdx],
            paneBefore = this.panes[paneIdx+1];
        if ( this.collapsible && (pane.collapsible !== false) && paneBefore && (paneBefore.collapsible !== false) && (paneBefore.resizable !== false) ){
          return true;
        }
        return false;
      },
      expanderClass(paneIdx, resizerIdx){
        return '';
        /*
        let direction = this.panes[paneIdx].collapsed || (resizerIdx === 1) ?
              (this.currentOrientation === 'horizontal' ? 'right' : 'down') :
              (this.currentOrientation === 'horizontal' ? 'left' : 'up'),
            icon = (resizerIdx === 1) && this.panes[paneIdx].collapsed ? 'angle-double-' : 'angle-',
            cls = 'bbn-p fa fa-' + icon + direction;
        return cls;
        */
      }
    },
    mounted(){
      bbn.fn.warning('mounted');
      if ( this.currentOrientation === 'auto' ){
        this.currentOrientation = this.getOrientation();
        this.$forceUpdate();
      }
    },
    updated(){
      this.onResize();
    },
    watch: {
      orientation(newVal, oldVal){
        bbn.fn.warning(newVal);
        if ( (newVal !== oldVal) && (newVal !== this.currentOrientation) ){
          this.currentOrientation = newVal === 'auto' ? this.getOrientation() : newVal;
          this.init();
        }
      },
      currentOrientation(){
        this.init();
      },
      isResized(){

      }
    },
  });

})(jQuery, bbn, kendo);
