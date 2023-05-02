/**
 * @file bbn-splitter component
 *
 * @description bbn-splitter is a component that can interact dynamically, allowing the division of a layout into resizable areas.
 * To do so it needs another component, the "bbn-pane" that represents the portion of the single area that the splitter contains.
 *
 * @copyright BBN Solutions
 *
 * @author BBN Solutions
 * 
 * @created 15/02/2017
 */

return {
    /**
     * @mixin bbn.wc.mixins.basic 
     * @mixin bbn.wc.mixins.resizer
     */
    mixins: [bbn.wc.mixins.basic, bbn.wc.mixins.resizer],
    props: {
      /**
       * The orientation of the splitter ('horizontal', 'vertical', 'auto').
       * @prop {String} ['auto'] orientation
       */
      orientation: {
        type: String,
        default: 'auto'
      },
      /**
       * Set to true allows the splitter to be resizable. 
       * @prop {boolean} [false] resizable
       */
      resizable: {
        type: Boolean,
        default: false
      },
       /**
       * Set to true allows the panes inside the splitter to be collapsible. 
       * @prop {boolean} [false] collapsible
       */
      collapsible: {
        type: Boolean,
        default: false
      },
      // @todo not used
      scrollable: {
        type: Boolean,
        default: false
      },
      /**
       * Defines the size of the resizer element, width if vertical, height if horizontal.
       * @prop {number} [15] resizerSize
       */
      resizerSize: {
        type: Number,
        default: 15
      },
      /**
       * A class name to add on the resizer element.
       * @prop {String|Function} resizerClass
       */
      resizerClass: {
        type: [String, Function]
      },
      /**
       * The minimum size that can have a pane (non collapsed).
       * @prop {Number} [40] minPaneSize
       */
      minPaneSize: {
        type: Number,
        default: 40
      },
      fullSize: {
        type: Boolean,
        default: true
      }
    },
    data() {
      bbn.fn.log("LAUNCHIN data FN")
      return  {
        /**
         * The timeout used to launch the initial process (reset each time a new pane is added).
         * @data {Number} [0] initTimeout
         */
        initTimeout: 0,
        /**
         * Will be set to true once the splitter has been resized.
         * @data {Boolean} [false] isResized
         */
        isResized: false,
        /**
         * An object containing info about current user resizing when it occurs.
         * @data {Boolean} [null] resizeCfg
         */
        resizeCfg: null,
        /**
         * An array consisting of each resizer objects (the bars separating resizable panes).
         * @data {Array} [[]] resizers
         */
        resizers: [],
        /**
         * The content of the prop orientation.
         * @data {String} currentOrientation
         */
        currentOrientation: this.orientation,
        /**
         * The configuration of the panes.
         * @data {Array} [[]] panes
         */
        panes: [],
        drag: this.resizeDrag.bind(this),
        dragEnd: this.resizeEnd.bind(this),
        isSplitterResizing: false
      };
    },
    computed: {
      isHorizontal() {
        return this.currentOrientation === 'horizontal';
      },
      /**
       * Return true if at least 2 panes are resizable - and so is the splitter.
       * @computed isResizable
       * @return {Boolean}
       */
      isResizable(){
        return (this.resizable || this.collapsible) && (bbn.fn.count(this.panes, {resizable: true}) >= 2)
      },
      /**
       * What will be actually in the CSS for grid-template-columns.
       * @computed columnsCfg
       * @return {String}
       */
      columnsCfg(){
        return this.panes.length && this.isHorizontal ? this.getFormatted() : 'auto';
      },
      /**
       * What will be actually in the CSS for grid-template-rows.
       * @computed rowsCfg
       * @return {String}
       */
      rowsCfg(){
        return this.panes.length && !this.isHorizontal ? this.getFormatted() : 'auto';
      },
      /**
       * X or y depending on the current orientation.
       * @computed currentAxis
       * @return {String}
       */
      currentAxis(){
        return this.isHorizontal ? 'x' : 'y'
      },
      /**
       * Width or height depending on the current orientation.
       * @computed currentSizeType
       * @return {String}
       */
      currentSizeType(){
        return this.isHorizontal ? 'Width' : 'Height';
      },
      /**
       * Width or height depending on the current orientation.
       * @computed currentOffsetType
       * @return {String}
       */
      currentOffsetType(){
        return this.isHorizontal ? 'left' : 'top';
      },
      /**
       * Size of the container as given by bbn.
       * @computed currentSize
       * @return {String}
       */
      currentSize(){
        return this['lastKnown' + this.currentSizeType];
      },
      /**
       * Available for the panes: difference between currentSize (container's size) and the total of resizers' sizes.
       * @computed availableSize
       * @return {bbn-splitter.computed.currentSize}
       */
      availableSize(){
        let availableSize = this.currentSize;
        bbn.fn.each(this.resizers, () => {
          availableSize -= this.resizerSize;
        });
        return availableSize;
      },

    },
    methods: {
      /**
       * Returns the calculated grid-template-rows or grid-template-columns as CSS string.
       * @method getFormatted
       * @return {String}
       */
      getFormatted() {
        /**
         * The position of the panes, starting at 1; gapos will be created for resizers.
         * 
         * @type {Number}
         */
        let pos = 1,
            lastVisibleResizer = false,
            tmp = this.panes.map(a => {
                  /**
                   * The additions of the 3 differences:
                   * - currentDiff is the current difference while resizing
                   * - savedDiff is the original difference resulting from other resizings
                   * - tmpDiff is the temporary difference applied from other(s) collapsed pane(s)
                   * @type {number}
                   */
              let diff = a.currentDiff + a.savedDiff + a.tmpDiff,
                 /**
                  * The resulting string for the CSS property.
                  * @type {string}
                  */
                  sz = '';
              // If position is not the one expected it means a resizer is before so it's added as a column
              while ( a.position > pos ){
                sz += lastVisibleResizer && !a.title ? '0 ' : 'max-content ';
                lastVisibleResizer = true;
                pos++;
              }
              // If the pane is collapsed we just mark its size at 0
              if ( a.collapsed ){
                sz += a.title ? 'max-content ' : '0 ';
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
       * Returns the resizer's class according to its resizerClass prop.
       * @method realResizerClass
       * @param resizer
       * @return {String}
       */
      realResizerClass(resizer){
        if (bbn.fn.isFunction(this.resizerClass) ){
          return this.resizerClass(resizer);
        }
        return this.resizerClass || '';
      },
      /**
       * Returns orientation based on the largest side.
       * @method getOrientation
       * @return {String}
       */
      getOrientation(){
        return this.lastKnownWidth > this.lastKnownHeight ? 'horizontal' : 'vertical';
      },
      /**
       * Handles the resize of the splitter
       * @method onResize
       * @fires getOrientation
       */
      onResize(){
        if ( !this.resizing && !this.isSplitterResizing){
          this.isResizing = true;
          this.setContainerMeasures();
          this.setResizeMeasures();
          if ( this.orientation === 'auto' ){
            let o = this.getOrientation();
            if ( o !== this.currentOrientation ){
              this.currentOrientation = o;
            }
          }
          /** @todo so far only fuckin way to make it re-render the right dimensions */
          let w = this.$el.style.width;
          let h = this.$el.style.height;
          this.$el.style.width = '100%';
          this.$el.style.height = '100%';
          setTimeout(() => {
            this.$el.style.width = w;
            this.$el.style.height = h;
            this.isResizing = false;
            this.$emit('resize');
          }, 100)
        }
      },
      /**
       * Is used when collapsed
       * @todo check it out
       * @ignore
       */
      updatePositions(){
        /*
        bbn.fn.each(this.panes, (pane, i) => {
          this.$children[pane.index].$el.style.gridColumn = this.currentOrientation === 'horizontal' ? pane.position : 1;
          this.$children[pane.index].$el.style.gridRow = this.currentOrientation === 'vertical' ? pane.position : 1;
        })
        */
      },
      /**
       * Gets the next resizable pane.
       * @method getNextResizable
       * @param {Number} idx 
       * @param {Array} arr 
       * @return {Boolean|Number}
       */
      getNextResizable(idx, arr){
        for ( let i = idx+1; i < arr.length; i++ ){
          if ( arr[i].resizable ){
            return i;
          }
        }
        return false;
      },
      /**
       * Gets the previous resizable pane.
       * @method getPrevResizable
       * @param {Number} idx 
       * @param {Array} arr 
       * @return {Boolean|Number}
       */
      getPrevResizable(idx, arr){
        for ( let i = idx-1; i >= 0; i-- ){
          if ( arr[i].resizable ){
            return i;
          }
        }
        return false;
      },
      /**
       * Gets the next collapsible pane.
       * @method getNextCollapsible
       * @param {Number} idx 
       * @param {Array} arr 
       * @return {Boolean|Number}
       */
      getNextCollapsible(idx, arr){
        for ( let i = idx+1; i < arr.length; i++ ){
          if ( arr[i].collapsible ){
            return i;
          }
        }
        return false;
      },
      /**
       * Gets the previous collassible pane.
       * @method getPrevCollapsible
       * @param {Number} idx 
       * @param {Array} arr 
       * @return {Boolean|Number}
       */
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
       * @method init
       * @fires getPrevResizable
       * @fires getNextResizable
       * @fires getPrevCollapsible
       * @fires getNextCollapsible
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
              tmp             = [],
              hasAuto         = false,
              hasPercent      = false,
              hasResizers     = false;
          // If 1st pane is collapsible we add a resizer at the start
          this.$children.forEach((pane, i) => {
            // Defining the panes base on the content
            if ( pane.$options.name === 'bbn-pane' ){
              let isPercent   = false,
                  isFixed     = false,
                  isNumber    = false,
                  props       = pane.$props,
                  resizable   = (this.resizable || props.resizable) && (props.resizable !== false),
                  collapsible = (this.collapsible || props.collapsible) && (props.collapsible !== false),
                  value       = parseInt(props.size) || 0;
              if ( props.size ){
                isFixed = true;
                if ( props.size === 'auto' ){
                  props.size = false;
                  hasAuto = true;
                }
                else if ( (typeof props.size === 'string') && (bbn.fn.substr(props.size, -1) === '%') ){
                  isPercent = true;
                  hasPercent = true;
                }
                else if ( (typeof props.size === 'string') && (bbn.fn.substr(props.size, -2) === 'px') ){
                  isNumber = true;
                  props.size = parseInt(props.size);
                }
                else if ( (typeof props.size === 'number') ){
                  isNumber = true;
                }
              }
              else {
                hasAuto = true;
              }
              let obj = bbn.fn.extend({
                index: i,
                value: value,
                currentDiff: 0,
                savedDiff: 0,
                addedSize: '',
                tmpDiff: 0,
                collapsed: false,
                isPercent: isPercent,
                isFixed: isFixed,
                isNumber: isNumber,
                resizable: resizable,
                collapsible: collapsible,
                isResizable: collapsible || resizable,
                pane: pane
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
                cp: this.find('bbn-pane', assoc.index)
              },
              pane2: {
                obj: pane,
                cp: this.find('bbn-pane', i)
              },
            });
            pos++;
          }
          */
          let isResizable = bbn.fn.count(tmp, {isResizable: true}) >= 2;
          let hasPanes = tmp.length > 1;
          // We will populate resizers
          this.resizers.splice(0, this.resizers.length);
          tmp.forEach((pane, idx) => {
            let prev, next, prevc, nextc;
            if ( hasPanes && isResizable && pane.isResizable ){
              prev = this.getPrevResizable(idx, tmp);
              next = this.getNextResizable(idx, tmp);
              prevc = this.getPrevCollapsible(idx, tmp);
              nextc = this.getNextCollapsible(idx, tmp);
              // First collapsible
              if ( (prev !== false) || (prevc !== false) ){
                //bbn.fn.log("------ case 2", idx + ' position ' + currentPosition);
                let o = {
                  position: currentPosition,
                  panec1: false,
                  panec2: false,
                  pane1: false,
                  pane2: false
                };
                if ( pane.resizable && (prev !== false) ){
                  o.pane1 = prev;
                  o.pane2 = idx;
                }
                if ( pane.collapsible && (prevc !== false) ){
                  o.panec1 = prevc;
                  o.panec2 = idx;
                }
                this.resizers.push(o);
                hasResizers = true;
                currentPosition++;
              }
            }
            pane.position = currentPosition;
            /*
            if ( pane.size === undefined ){
              pane.isNumber = true;
              pane.size = Math.floor(this.availableSize / tmp.length) + (idx < tmp.length - 1 ? 0 : this.availableSize % tmp.length)
            }
            */
            this.panes.push(pane);
            currentPosition++;
            if ( hasPanes && isResizable && pane.isResizable ){
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
                //bbn.fn.log("------ case 4", idx + ' position ' + currentPosition);
                if (
                  pane.resizable &&
                  (prev === false) &&
                  next &&
                  !tmp[idx + 1].resizable
                ){
                  o.pane1 = idx;
                  o.pane2 = next;
                }
                if (
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
                hasResizers = true;
                currentPosition++;
              }
            }
          });
          if ( hasPercent && hasResizers && !hasAuto ){
            throw bbn._('In a resizable splitter, if a pane has a percentage measure, at least one pane must be meausreless or set at "auto"');
          }
          else {
            this.$forceUpdate();
            this.ready = true;
            this.selfEmit(true);
          }
        }, 200);
      },
      /**
       * Return true if one of the two panes given is collassible.
       * @method areCollapsible
       * @param {Number} idxPane1 
       * @param {Number} idxPane2 
       * @return {Boolean}
       */
      areCollapsible(idxPane1, idxPane2){
        return this.panes[idxPane1] &&
          this.panes[idxPane2] && (
            this.panes[idxPane1].collapsible ||
            this.panes[idxPane2].collapsible
          );
      },
      /**
       * Returns true if the previous pane is collapsible.
       * @method isCollapsiblePrev
       * @param {Number} idxPane1 
       * @param {Number} idxPane2 
       * @return {Boolean}
       */
      isCollapsiblePrev(idxPane1, idxPane2){
        return this.panes[idxPane2].collapsed || (
          !this.panes[idxPane1].collapsed && (
            (idxPane2 === (this.panes.length - 1)) ||
            !this.panes[idxPane2].collapsed
          )
        )
      },
      /**
       * Returns true if the next pane is collapsible.
       * @method isCollapsibleNext
       * @param {Number} idxPane1 
       * @param {Number} idxPane2 
       * @return {Boolean}
       */
      isCollapsibleNext(idxPane1, idxPane2){
        return this.panes[idxPane1].collapsed || (
          !this.panes[idxPane2].collapsed && (
            (idxPane1 === 0) ||
            !this.panes[idxPane2].collapsed
          )
        )
      },
      /**
       * Returns true if teh previous pane is fully collapsible.
       * @method isFullyCollapsiblePrev
       * @param {Number} idxPane1 
       * @param {Number} idxPane2 
       * @param {Number} idxResizer 
       * @return {Boolean}
       */
      isFullyCollapsiblePrev(idxPane1, idxPane2, idxResizer){
        return this.panes[idxPane2].collapsed && (
          (
            (idxPane2 === (this.panes.length - 1)) &&
            (idxResizer === (this.resizers.length - 1))
          ) ||
          (idxPane1 === (idxPane2 - 1)) ||
          this.panes[idxPane1+1].collapsible
        )
      },
      /**
       * Returns true if the next pane is fully collapsible.
       * @method isFullyCollapsibleNext
       * @param {Number} idxPane1 
       * @param {Number} idxPane2 
       * @param {Number} idxResizer 
       * @return {Boolean}
       */
      isFullyCollapsibleNext(idxPane1, idxPane2, idxResizer){
        return this.panes[idxPane1].collapsed && (
          ((idxPane1 === 0) && (idxResizer === 0)) ||
          (idxPane1 === (idxPane2 - 1)) ||
          (this.panes[idxPane2-1].collapsible)
        )
      },
      /**
       * Handles the resize of panes on dragging the resizer
       * @method resizeDrag
       * @param {Event} e 
       */
      resizeDrag(e){
        if ( this.isSplitterResizing && this.resizeCfg && this.resizeCfg.panes ){
          e.preventDefault();
          e.stopImmediatePropagation();
          let diff = (e['client' + this.currentAxis.toUpperCase()] || (e.touches.length ? e.touches[0] : e.changedTouches[0])['page' + this.currentAxis.toUpperCase()]) - this.resizeCfg[this.currentOffsetType];
          if ( diff >= this.resizeCfg.max ){
            diff = this.resizeCfg.max;
          }
          else if ( diff <= this.resizeCfg.min ){
            diff = this.resizeCfg.min;
          }
          this.panes[this.resizeCfg.resizer.pane1].currentDiff = diff;
          this.panes[this.resizeCfg.resizer.pane2].currentDiff = - diff;
          this.$updateComponent();
        }
      },
      /**
       * Ends the resize
       * @method resizeEnd
       * @param {Event} e 
       */  
      resizeEnd(e){
        bbn.fn.log("ENDING RESIZE", this);
        if ( this.isSplitterResizing && this.resizeCfg && this.resizeCfg.panes ){
          let diff = (e['client' + this.currentAxis.toUpperCase()] || (e.touches.length ? e.touches[0] : e.changedTouches[0])['page' + this.currentAxis.toUpperCase()]) - this.resizeCfg[this.currentOffsetType];
          if ( diff >= this.resizeCfg.max ){
            diff = this.resizeCfg.max;
          }
          else if ( diff <= this.resizeCfg.min ){
            diff = this.resizeCfg.min;
          }
          this.panes[this.resizeCfg.resizer.pane1].currentDiff = 0;
          this.panes[this.resizeCfg.resizer.pane2].currentDiff = 0;
          this.panes[this.resizeCfg.resizer.pane1].savedDiff = this.panes[this.resizeCfg.resizer.pane1].savedDiff + diff;
          this.panes[this.resizeCfg.resizer.pane2].savedDiff = this.panes[this.resizeCfg.resizer.pane2].savedDiff - diff;
          bbn.fn.log("JHJHHJHHJ");
          this.isSplitterResizing = false;
          document.body.removeEventListener("touchmove", this.drag);
          document.body.removeEventListener("mousemove", this.drag);
          document.body.removeEventListener("touchend", this.dragEnd);
          document.body.removeEventListener("touchcancel", this.dragEnd);
          document.body.removeEventListener("mouseup", this.dragEnd);
          document.body.removeEventListener("mouseleave", this.dragEnd);
          this.panes[this.resizeCfg.resizer.pane1].pane.selfEmit(true);
          this.panes[this.resizeCfg.resizer.pane2].pane.selfEmit(true);
          this.resizeCfg = null;
        }
      },
      /**
       * @ignore
       * @todo Remove this function.
       * Obliged to do that because of sliders (closing one with right orientation moves the splitter!)
       */
      preventScroll(){
        this.$el.scrollLeft = 0;
        this.$el.scrollTop = 0;
      },

      /**
       * Starts the resize.
       * @param {Event} e 
       * @param {Object} rs 
       */
      resizeStart(e, rs){
        bbn.fn.log("STARTING RESIZE", this)
        if ( e.target.tagName.toLowerCase() === 'i' ){
          e.target.click();
          return
        }
        if (this.isResizable
           && !this.isSplitterResizing
           && this.panes[rs.pane1]
           && !this.panes[rs.pane1].collapsed
           && this.panes[rs.pane2]
           && !this.panes[rs.pane2].collapsed
        ){
          this.isSplitterResizing = true;
          bbn.fn.log("THIS IS RESIZING")
          const cp = this;
          document.body.addEventListener("touchmove", this.drag);
          document.body.addEventListener("mousemove", this.drag);
          document.body.addEventListener("touchend", this.dragEnd);
          document.body.addEventListener("touchcancel", this.dragEnd);
          document.body.addEventListener("mouseup", this.dragEnd);
          document.body.addEventListener("mouseleave", this.dragEnd);
          let vue1 = this.find('bbn-pane', rs.pane1),
              vue2 = this.find('bbn-pane', rs.pane2),
              pos = e.target.getBoundingClientRect(),
              pos1 = vue1.$el.getBoundingClientRect(),
              pos2 = vue2.$el.getBoundingClientRect();
          if (!this.panes[rs.pane1].size && !this.panes[rs.pane2].size) {
            this.$set(this.panes[rs.pane1], "size", this.currentOrientation === 'horizontal' ? pos1.width : pos1.height);
            this.$set(this.panes[rs.pane2], "size", this.currentOrientation === 'horizontal' ? pos2.width : pos2.height);
            this.$forceUpdate();
          }
          this.resizeCfg = {
            resizer: rs,
            panes: [vue1, vue2],
            min: -pos1[this.currentSizeType.toLowerCase()] + this.minPaneSize,
            max: pos2[this.currentSizeType.toLowerCase()] - this.minPaneSize - this.resizerSize,
            [this.currentOffsetType]: pos[this.currentOffsetType]
          };
          //bbn.fn.log("START", this.resizeCfg, e, "------------");
        }
        /*
            setTimeout(() =>{
              this.resizers.forEach((a, i) => {
                if ( a.pane2 ){
                  //bbn.fn.log("DRAGGABLE?", this.$refs.resizer[i]);
                  let prop = this.currentOrientation === 'horizontal' ? 'left' : 'top',
                      pane1 = this.find('bbn-pane', a.pane1),
                      pane2 = this.find('bbn-pane', a.pane2),
                      max,
                      min;
                  $(this.$refs.resizer[i]).draggable({
                    helper: 'clone',
                    containment: "parent",
                    opacity: 0.1,
                    zIndex: 6000,
                    axis: this.currentAxis,
                    start: (e, ui) => {
                      if ( (a.panec1 && a.panec1.collapsed) || (a.panec2 && a.panec2.collapsed) ){
                        e.preventDefault();
                        bbn.fn.log("PREVENTING");
                        return false;
                      }
                      /**
                       * Pane on the left side of the resizer
                       * @type {ClientRect}
                       *
                      let pos1 = pane1.$el.getBoundingClientRect(),
                          /**
                           * Pane on the right side of the resizer
                           * @type {ClientRect}
                           *
                          pos2 = pane2.$el.getBoundingClientRect();
                      min = -pos1.width;
                      max = pos2.width;
                      bbn.fn.log("START", min, max, ui.position[prop] + '/' + ui.originalPosition[prop], "------------");
                    },
                    drag: (e, ui) =>{
                      let diff = ui.position[prop] - ui.originalPosition[prop];
                      bbn.fn.log(diff, max, min);
                      if ( diff >= max ){
                        diff = max - 5;
                      }
                      else if ( diff <= min ){
                        diff = min + 5;
                      }
                      this.$set(this.panes[a.pane2], 'currentDiff', -diff);
                      this.$set(this.panes[a.pane1], 'currentDiff', diff);
                    },
                    stop: (e, ui) =>{
                      let diff = ui.position[prop] - ui.originalPosition[prop];
                      if ( diff >= max ){
                        diff = max - 5;
                      }
                      else if ( diff <= min ){
                        diff = min + 5;
                      }
                      bbn.fn.log(diff, max, min);
                      this.$set(this.panes[a.pane2], 'currentDiff', 0);
                      this.$set(this.panes[a.pane1], 'currentDiff', 0);
                      this.$set(this.panes[a.pane2], 'savedDiff', this.panes[a.pane2].savedDiff - diff);
                      this.$set(this.panes[a.pane1], 'savedDiff', this.panes[a.pane1].savedDiff + diff);
                      this.selfEmit(true);
                    }
                  })
                }
              });
            }, 200)
          }
          */
      },
      /**
       * Collapses a collapsible pane.
       * @param {Number} toCollapse 
       * @param {Number} toUpdate 
       * @param {Boolean} full 
       */
      collapse(toCollapse, toUpdate, full){
        if ( this.collapsible && this.panes[toCollapse] && this.panes[toUpdate] ){
          let collapsing = !this.panes[toCollapse].collapsed,
              smaller = collapsing ? toCollapse : toUpdate,
              bigger = collapsing ? toUpdate : toCollapse,
              diff1 = this.panes[smaller].savedDiff,
              diff2 = this.panes[bigger].savedDiff;
          //bbn.fn.log(toCollapse, toUpdate, smaller, bigger, diff1, diff2);
          // Not a full collapse (=- double) but with a already collapsed pane
          if ( !full && (this.panes[toCollapse].collapsed || this.panes[toUpdate].collapsed) ){
            this.panes[smaller].addedSize = '';
            this.panes[bigger].addedSize = '';
            this.panes[smaller].tmpDiff = 0;
            this.panes[bigger].tmpDiff =  0;
            this.panes[smaller].collapsed = false;
            this.panes[smaller].pane.isCollapsed = false;
            this.panes[bigger].collapsed =  false;
            this.panes[bigger].pane.isCollapsed = false;

          }
          // The other is also collapsed and the double arrow is clicked: switching
          else if ( full && (this.panes[toUpdate].collapsed === collapsing) ){
            this.panes[bigger].tmpDiff = diff1 - this.resizerSize;
            this.panes[smaller].tmpDiff = 0;
            if ( this.panes[smaller].size ){
              this.panes[bigger].addedSize = this.panes[smaller].size
            }
            this.panes[bigger].collapsed = false;
            this.panes[smaller].collapsed = true;
            this.panes[bigger].pane.isCollapsed = false;
            this.panes[smaller].pane.isCollapsed = true;
          }
          else{
            if ( this.panes[toCollapse].size && this.panes[toUpdate].size ){
              this.panes[bigger].addedSize =  this.panes[smaller].size;
            }
            else{
              this.panes[bigger].addedSize = 'auto';
            }
            this.panes[bigger].tmpDiff = diff1 - this.resizerSize;
            this.panes[smaller].tmpDiff = 0;
            this.panes[toCollapse].collapsed =  collapsing;
            this.panes[toCollapse].pane.isCollapsed =  collapsing;
          }
          this.$nextTick(() => {
            this.selfEmit();
          });
        }
      },
      //@todo not used
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
            cls = 'bbn-p nf nf-fa-' + icon + direction;
        return cls;
        */
      }
    },
    /**
     * Defines the current orientation and forces the update of the component.
     * @event mounted 
     * @fires getOrientation
     */
    mounted(){
      if ( this.currentOrientation === 'auto' ){
        this.currentOrientation = this.getOrientation();
        this.$forceUpdate();
      }
      else {
        this.init();
      }
    },
    updated(){
      //this.onResize();
    },
    watch: {
      /**
       * Reinitializes the component when the value of the prop orientation changes
       * @watch orientation 
       * @param {String} newVal 
       * @param {String} oldVal 
       */
      orientation(newVal, oldVal){
        if ( (newVal !== oldVal) && (newVal !== this.currentOrientation) ){
          this.currentOrientation = newVal === 'auto' ? this.getOrientation() : newVal;
        }
      },
      /**
       * Reinitializes the component when the value of currentOrientation changes
       * @watch currentOrientation
       * @fires init
       */
      currentOrientation(){
        this.init();
      },
      isSplitterResizing(v) {
        bbn.fn.log("isSplitterResizing changed to " + v)
      }
    },
  };
