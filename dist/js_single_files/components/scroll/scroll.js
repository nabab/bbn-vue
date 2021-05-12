((bbn) => {
let script = document.createElement('script');
script.innerHTML = `<div :class="elementClass"
     :style="elementStyle"
>
  <div :class="{
         'bbn-scroll-container': true,
         'bbn-overlay': isScrolling || (!isMeasuring && !scrollable),
         'bbn-scroll-not-dragged': ready && !isDragging,
         'bbn-scroll-x': hasX(),
         'bbn-scroll-y': hasY()
       }"
       ref="scrollContainer"
       @scroll="onScroll"
       @touchend="onTouchend"
       @touchstart="onTouchstart"
       @touchmove="onTouchmove"
       @focus="isFocused = true"
       @blur="isFocused = false"
       :tabindex="scrollable ? '0' : '-1'"
  >
    <div :class="{
          'bbn-scroll-content': true,
          resizing: isMeasuring,
          'bbn-overlay': !scrollable
        }"
         ref="scrollContent"
         @subready.stop="waitReady"
         :style="contentStyle"
    >
      <slot></slot>
    </div>
  </div>
  <bbn-scrollbar v-if="scrollReady && hasScrollX"
                 :hidden="scrollReady && hiddenX"
                 orientation="horizontal"
                 ref="xScroller"
                 :color="barColor ? barColor : ''"
                 :scrollAlso="scrollAlso"
                 :initial="currentX"
                 @scroll="scrollHorizontal"
                 :offset="offsetX">
  </bbn-scrollbar>
  <bbn-scrollbar v-if="scrollReady && hasScrollY"
                 :hidden="scrollReady && hiddenY"
                 orientation="vertical"
                 ref="yScroller"
                 :color="barColor ? barColor : ''"
                 :scrollAlso="scrollAlso"
                 :initial="currentY"
                 @scroll="scrollVertical"
                 :offset="offsetY">
  </bbn-scrollbar>
</div>`;
script.setAttribute('id', 'bbn-tpl-component-scroll');
script.setAttribute('type', 'text/x-template');
document.body.insertAdjacentElement('beforeend', script);
 /**
  * @file bbn-scroll component
  *
  * @description bbn-scroll is a component consisting of horizontal and vertical bars that allow the flow of content in both directions, if the container its smaller than the content, inserts and removes reactively vertical, horizontal bar or both.
  *
  * @copyright BBN Solutions
  *
  * @author BBN Solutions
  *
  * @created 10/02/2017
  */

 (function(bbn){
  "use strict";
  Vue.component('bbn-scroll', {
    name: 'bbn-scroll',
    /**
     * @mixin bbn.vue.basicComponent
     * @mixin bbn.vue.resizerComponent
     * @mixin bbn.vue.keepCoolComponent
     */
    mixins: [bbn.vue.basicComponent, bbn.vue.resizerComponent, bbn.vue.keepCoolComponent, bbn.vue.eventsComponent],
    props: {
      /**
       * @todo not used
      */
      maxWidth: {
        type: Number
      },
      /**
       * @todo not used
       */
      maxHeight: {
        type: Number
      },
      /**
       * @todo not used
       */
      minWidth: {
        type: Number
      },
      /**
       * @todo not used
       */
      minHeight: {
        type: Number
      },
      /**
       * The width of the scroll, if not defined the scroll container will have the class 'bbn-overlay'
       * @prop {Number} width
       */
      width: {
        type: Number
      },
      /**
       * @todo not used defines currentheight never used
       */
      height: {
        type: Number
      },
      /**
       * @todo not used
       */
      classes: {
        type: String,
        default: ""
      },
      /**
       * @todo not used
       */
      speed: {
        type: Number,
        default: 50
      },
      /**
       * The axis where the scroll is applied ( 'x', 'y', 'both')
       * @prop {String} ['both'] axis
       */
      axis: {
        type: String,
        default: "both"
      },
      /**
       * @todo not used
       */
      scrollAlso: {
        type: [HTMLElement, Array, Function],
        default(){
          return [];
        }
      },
      /**
       * Defines the position of the x axis
       * @prop {Number} [0] x
       */
      x: {
        type: Number,
        default: 0
      },
      /**
       * Defines the position of the y axis
       * @prop {Number} [0] y
       */
      y: {
        type: Number,
        default: 0
      },
      /**
       * Defines if the scroll has to be hidden for one of the axis or both
       * @prop {Boolean|String} [false] hidden
       */
      hidden: {
        type: [Boolean, String],
        default: false
      },
      /**
       * Defines the color of the scroll
       * @prop {String} barColor
       */
      barColor: {
        type: String
      },
      /**
       * The time of latency of the scroll
       * @prop {Number} [25] latency
       */
      latency: {
        type: Number,
        default: 25
      },
      scrollable: {
        type: Boolean,
        default: true
      },
      fullPage: {
        type: Boolean,
        default: false
      },
      offsetX: {
        type: [Number, Array],
        default: 0
      },
      offsetY: {
        type: [Number, Array],
        default: 0
      },
    },
    data() {
      return {
        /**
         * @data {Boolean} [false] readyDelay
         */
        readyDelay: false,
        /**
         * @data {Boolean} [false] Gives an extra second to scroll to previous position
         */
        afterReady: false,
        /**
         * @todo not used
         */
        show: false,
        /**
         * The position on the x axis basing on the prop x
         * @data {Number} [0] currentX
         */
        currentX: this.x,
        /**
         * The position on the y axis basing on the prop y
         * @data {Number} [0] currentY
         */
        currentY: this.y,
        /**
         * Defines the position ofthe scroll container
         * @data {String} scrollPos
         */
        scrollPos: '0px',
        /**
         * Defines the padding of the scroll container
         * @data {String} containerPadding
         */
        containerPadding: '0px',
        /**
         * Defines if the scroll has to be hidden basing on the prop hidden
         * @data {Boolean} hiddenX
         */
        hiddenX: (this.hidden === true) || ((this.hidden === 'x')),
        /**
         * @todo not used
         * Defines if the scroll has to be hidden basing on the prop hidden
         * @data {Boolean} hiddenY
         */
        hiddenY: (this.hidden === true) || ((this.hidden === 'y')),
        /**
         * Defines if the scroll container must have the class 'bbn-overlay'
         * @data {Number} currentWidth 
         */
        currentWidth: this.width || null,
        /**
         * @todo not used 
         */
        currentHeight: this.height || null,
        /**
         * @data {Number} [0] naturalWidth
         */
        naturalWidth: 0,
        /**
         * @data {Number} [0] naturalHeight
         */
        naturalHeight: 0,
        /**
         * @data {Number} [0] containerWidth
         */
        containerWidth: 0,
        /**
         * @data {Number} [0] containerHeight
         */
        containerHeight: 0,
        /**
         * @data {Number} [0] contentWidth
         */
        contentWidth: 0,
        /**
         * @data {Number} [0] contentHeight
         */
        contentHeight: 0,
        /**
         * @data {Boolean} [false] isMeasuring
         */
        isMeasuring: false,
        /**
         * @data {Boolean} [false] hasScroll
         */
        hasScroll: false,
        /**
         * @data {Boolean} [false] hasScrollX
         */
        hasScrollX: false,
        /**
         * @data {Boolean} [false] hasScrollY
         */
        hasScrollY: false,
        promise: false,
        isScrolling: false,
        isDragging: false,
        isFocused: false,
        previousTouch: {x: null, y: null},
        interval: null,
        scrollReady: false,
        touchX: false,
        touchY: false,
        touched: 0,
        touchDirection: null
      };
    },
    computed: {
      /**
       * Based on the prop fixedFooter and fullScreen, a string is returned containing the classes for the form template.
       *
       * @computed currentClass
       * @return {String}
       */
      elementClass(){
        let st = this.componentClass.join(' ') + ' bbn-overlay';
        if ( !this.ready ){
          st += ' bbn-invisible';
        }
        return st;
      },
      /**
       * @computed elementStyle
       * @return {Object}
       */
      elementStyle(){
        let cfg = {
          maxWidth: this.maxWidth ? bbn.fn.formatSize(this.maxWidth) : '100%',
          maxHeight: this.maxHeight ? bbn.fn.formatSize(this.maxHeight) : '100%',
          minWidth: this.minWidth ? bbn.fn.formatSize(this.minWidth) : '100%',
          minHeight: this.minHeight ? bbn.fn.formatSize(this.minHeight) : '100%',
        };

        if (this.isMeasuring) {
          cfg.width = '100%';
          cfg.height = '100%';
          cfg.opacity = 0;
        }
        /*
        if ( this.currentWidth ){
          cfg.width = (this.currentWidth < this.lastKnownCtWidth ? this.currentWidth : this.lastKnownCtWidth) + 'px';
        }
        if ( this.currentHeight ){
          cfg.height = (this.currentHeight < this.lastKnownCtHeight ? this.currentHeight : this.lastKnownCtHeight) + 'px';
        }
        */
        return cfg;
      },
      /**
       * @todo not used
       */
      contentStyle(){
        let cfg = {};
        if (this.minWidth) {
          cfg.minWidth = this.minWidth;
        }
        if (this.minHeight) {
          cfg.minHeight = this.minHeight;
        }
        if (this.maxWidth) {
          cfg.maxWidth = this.maxWidth;
        }
        if (this.maxHeight) {
          cfg.maxHeight = this.maxHeight;
        }
        if ( this.isMeasuring || !this.scrollable ){
          return cfg;
        }
        cfg.width = (this.axis === 'x') || (this.axis === 'both') ? 'auto' : '100%';
        cfg.height = (this.axis === 'y') || (this.axis === 'both') ? 'auto' : '100%';
        return cfg;
      }
    },
    methods: {
      hashJustChanged(length = 600){
        if (document.location.hash) {
          let now = (new Date()).getTime();
          if (bbn.env.hashChanged >= (now - length)) {
            return true;
          }
        }
        return false;
      },
      onTouchstart(e){
        bbn.fn.log("touch start");
        bbn.fn.log("TOUCHSTART");
        if (!this.scrollable || this.disabled) {
          return;
        }
        if (e.targetTouches && e.targetTouches.length) {
          let ev = e.targetTouches[0];
          if (this.hasScrollX) {
            this.touchX = ev.clientX;
          }
          if (this.hasScrollY) {
            this.touchY = ev.clientY;
          }
          this.touched = (new Date()).getTime();
        }
      },
      page(direction) {
        if (!this.isScrolling) {
          this.isScrolling = true;
          let x = this.currentX;
          let y = this.currentY;
          let xRatio = x ? Math.round(x / this.containerWidth) : 0;
          let yRatio = y ? Math.round(y / this.containerHeight) : 0;
          x = xRatio * this.containerWidth;
          y = yRatio * this.containerHeight;
          if (x > this.contentHeight - this.containerWidth) {
            x = this.contentHeight - this.containerWidth;
          }
          if (y > this.contentHeight - this.containerHeight) {
            y = this.contentHeight - this.containerHeight;
          }
          let p;
          switch (direction) {
            case 'down':
              this.currentY = y + this.containerHeight;
              p = this.$refs.yScroller.scrollTo(this.currentY, true);
              break;
            case 'up':
              this.currentY = y - this.containerHeight;
              p = this.$refs.yScroller.scrollTo(this.currentY, true);
              break;
            case 'right':
              this.currentX = x + this.containerWidth;
              p = this.$refs.xScroller.scrollTo(this.currentX, true);
              break;
            case 'left':
              this.currentX = x - this.containerWidth;
              p = this.$refs.xScroller.scrollTo(this.currentX, true);
              break;
          }
          p.then(() => {
            this.touched = false;
            this.isScrolling = false;
            this.$emit('scroll');
          });
        }
      },
      onTouchend(e){
        if (!this.scrollable || this.disabled) {
          return;
        }
        if (this.fullPage && this.touchDirection) {
          this.page(this.touchDirection);
        }
        else if (!this.isScrolling) {
          this.touched = false;
        }
        this.touchDirection = null;
        this.touchY = null;
      },
      onTouchmove(e){
        bbn.fn.log("touch move");
        if (!this.scrollable || this.disabled) {
          return;
        }
        if (this.fullPage) {
          e.preventDefault();

          if (!this.touchDirection && e.targetTouches && e.targetTouches.length) {
            let ev = e.targetTouches[0];
            // Priority on vertical
            if (this.hasScrollY && (this.touchY !== ev.clientY)) {
              this.lastDirections = {touchY: this.touchY, clientY: ev.clientY};
              this.touchDirection = this.touchY > ev.clientY ? 'down' : 'up';
            }
            else if (this.hasScrollX && (this.touchX !== ev.clientX)) {
              this.touchDirection = this.touchX > ev.clientX ? 'right' : 'left';
            }
          }
        }
        if (this.scrollable && e) {
          e.stopImmediatePropagation();
        }
        this.$emit('touchmove', e);
      },
      preventKeyIfScrolling(e) {
        if (this.isScrolling && (32 >= e.key <= 40)) {
          e.preventDefault();
        }
      },
      /**
       * @method onScroll
       * @param {Event} e 
       * @emits scroll
       */
      onScroll(e){
        if (!this.ready || (this.scrollable === false)) {
          return;
        }

        if (this.fullPage && (this.touched || this.isScrolling)) {
          if (this.isScrolling) {
            e.preventDefault();
          }
          return;
        }
        let ct = this.getRef('scrollContainer');
        let x = ct.scrollLeft;
        let y = ct.scrollTop;
        let direction;
        bbn.fn.log("Scroll", this.hasScrollX, this.hasScrollY, y, this.currentY);
        if (this.hasScrollX && (x !== this.currentX)) {
          if (this.fullPage && this.afterReady && !this.hashJustChanged()) {
            if (x > this.currentX) {
              direction = 'right';
            }
            else if (x < this.currentX) {
              direction = 'left';
            }
          }
          this.currentX = x;
        }
        else if ( this.hasScrollY && (y !== this.currentY)) {
          if (this.fullPage && this.afterReady && !this.hashJustChanged()) {
            if (y > this.currentY) {
              direction = 'down';
            }
            else if (y < this.currentY) {
              direction = 'up';
            }
          }
          this.currentY = y;
        }
        if (this.scrollable && e) {
          e.stopImmediatePropagation();
        }
        if (direction) {
          this.page(direction);
        }
        this.$emit('scroll', e);
      },
      /**
       * Scrolls to the given coordinates of x and y using the given animation
       * @method scrollTo
       * @param {Number} x 
       * @param {Number} y 
       * @fires $refs.xScroller.scrollTo
       * @fires $refs.yScroller.scrollTo
       */
      scrollTo(x, y, anim){
        return new Promise(resolve => {
          if (!this.hasScroll || !this.ready) {
            return;
          }

          if (
            this.hasScrollX &&
            (x !== undefined) &&
            (x !== null) &&
            this.$refs.xScroller
          ) {
            this.$refs.xScroller.scrollTo(x, anim).then(() => {
              try {
                resolve();
              }
              catch(e) {
                
              }
            });
          }

          if (
            this.hasScrollY &&
            (y !== undefined) &&
            (y !== null) &&
            this.$refs.yScroller
          ) {
            this.$refs.yScroller.scrollTo(y, anim).then(() => {
              try {
                resolve();
              }
              catch(e) {

              }
            });
          }
        })
      },
      /**
       * @method scrollHorizontal
       * @param {Event} ev 
       * @param {Number} left 
       * @emits scrollx
       */  
      scrollHorizontal(ev, left){
        this.currentX = left;
        this.$emit('scrollx', left);
      },
      /**
       * @method scrollVertical
       * @param {Event} ev 
       * @param {Number} top 
       * @emits scrolly
       */ 
      scrollVertical(ev, top){
        this.currentY = top;
        this.$emit('scrolly', top);
      },
      addVertical(y) {
        this.scrollTo(null, this.currentY + y)
        this.$emit('scrolly', this.currentY);
      },
      addHorizontal(x) {
        this.scrollTo(this.currentX + x)
        this.$emit('scrollx', this.currentX);
      },
      /**
       * @method scrollStart
       * @fires scrollStartX
       * @fires scrollStartY
       */  
      scrollStart(){
        this.scrollStartX();
        this.scrollStartY();
      },
      /**
       * @method scrollEnd
       * @fires scrollEndX
       * @fires scrollEndY
       */  
      scrollEnd(){
        this.scrollEndX();
        this.scrollEndY();
      },
      /**
       * @method scrollBefore
       * @fires scrollBeforeX
       * @fires scrollBeforeY
       */  
      scrollBefore(){
        this.scrollBeforeX();
        this.scrollBeforeY();
      },
      /**
       * @method scrollAfter
       * @fires scrollAfterX
       * @fires scrollAfterY
       */  
      scrollAfter(){
        this.scrollAfterX();
        this.scrollAfterY();
      },
      /**
       * Scroll the x axis to the position 0
       * @method scrollStartX
       * @fires this.$refs.xScroller.scrollTo
       */
      scrollStartX(){
        this.getRef('scrollContainer').scrollLeft = 0;
      },
      /**
       * Scroll the y axis to the position 0
       * @method scrollStartY
       * @fires this.$refs.yScroller.scrollTo
       */
      scrollStartY() {
        if (this.hasScrollY) {
          this.getRef('scrollContainer').scrollTop = 0;
        }
      },
      /**
       * Scroll the x axis to the previous page
       * @method scrollBeforeX
       * @fires this.$refs.xScroller.scrollBefore
       */
      scrollBeforeX(){
        let x = this.getRef('xScroller');
        if (x) {
          x.scrollBefore();
        }
      },
      /**
       * Scroll the y axis to the previous page
       * @method scrollBeforeY
       * @fires this.$refs.yScroller.scrollBefore
       */
      scrollBeforeY() {
        if (this.hasScrollY) {
          let y = this.getRef('yScroller');
          if (y) {
            y.scrollBefore();
          }
        }
      },
      /**
       * Scroll the x axis to the next page
       * @method scrollBeforeX
       * @fires this.$refs.xScroller.scrollBefore
       */
      scrollAfterX(){
        let x = this.getRef('xScroller');
        if (x) {
          x.scrollAfter();
        }
      },
      /**
       * Scroll the y axis to the next page
       * @method scrollBeforeY
       * @fires this.$refs.yScroller.scrollBefore
       */
      scrollAfterY() {
        if (this.hasScrollY) {
          let y = this.getRef('yScroller');
          if (y) {
            y.scrollAfter();
          }
        }
      },
      /**
       * Scroll the x axis to the end
       * @method scrollEndX
       * @thisfires this.getRef('xScroller').scrollTo
       */
      scrollEndX(){
        this.getRef('scrollContainer').scrollLeft = this.contentWidth - this.lastKnownWidth;
      },
       /**
       * Scroll the y axis to the end
       * @method scrollEndY
       * @thisfires this.getRef('yScroller').scrollTo
       */
      scrollEndY(){
        this.getRef('scrollContainer').scrollTop = this.contentHeight - this.lastKnownHeight;
      },
      /**
       * Gets the dimensions after a resize
       * @method getNaturalDimensions
       * @fires getNaturalDimensions
       */
      getNaturalDimensions(){
        this.isMeasuring = true;
        return new Promise((resolve, reject) => {
          this.$nextTick().then(() => {
            let sc = this.find('bbn-scroll');
            //bbn.fn.log(sc ? "THERE IS A SCROLL" : "THERE IS NO SCROLL");
            if (this.scrollable) {
              let d = {width: this.getRef('scrollContent').offsetWidth, height: this.getRef('scrollContent').offsetHeight};
              if ( !d.width || !d.height ){
                if (sc && (sc.$el.clientWidth === this.$el.clientWidth) && (sc.$el.clientHeight === this.$el.clientHeight)) {
                  sc.getNaturalDimensions().then((d) => {
                    this.naturalWidth = sc.naturalWidth;
                    this.naturalHeight = sc.naturalHeight;
                    this.isMeasuring = false;
                    resolve({w: this.naturalWidth, h: this.naturalHeight});
                  })
                }
                else{
                  this.naturalWidth = this.$el.offsetWidth;
                  this.naturalHeight = this.$el.offsetHeight;
                  this.isMeasuring = false;
                  resolve({w: this.naturalWidth, h: this.naturalHeight});
                }
              }
              else{
                this.naturalWidth = d.width;
                this.naturalHeight = d.height;
                this.isMeasuring = false;
                resolve({w: this.naturalWidth, h: this.naturalHeight});
              }
            }
            else if (sc && (sc.$el.clientWidth === this.$el.clientWidth) && (sc.$el.clientHeight === this.$el.clientHeight)) {
              sc.getNaturalDimensions().then((d) => {
                this.naturalWidth = sc.naturalWidth;
                this.naturalHeight = sc.naturalHeight;
                this.isMeasuring = false;
                resolve({w: this.naturalWidth, h: this.naturalHeight});
              })
            }
            else{
              this.naturalWidth = this.$el.offsetWidth;
              this.naturalHeight = this.$el.offsetHeight;
              this.isMeasuring = false;
              resolve({w: this.naturalWidth, h: this.naturalHeight});
            }
          });
        });
      },
      hasX(){
        return this.scrollable && ((this.axis === 'both') || (this.axis === 'x'));
      },
      hasY(){
        return this.scrollable && ((this.axis === 'both') || (this.axis === 'y'));
      },
      /**
       * @method initSize
       * @fires getNaturalDimensions
       * @fires onResize
       */
      initSize() {
        return this.onResize().then(() => {
          this.ready = true;
        });
      },
      /**
       * Handles the resize of the scroll
       * @method onResize
       * @fires keepCool
       * @fires getNaturalDimensions
       * @emits resize
       * @returns Promise
       */
      onResize(force) {
        // Only executed when the ocmponent is ready
        if ( !this.ready ){
          return new Promise((resolve) => {
            setTimeout(() => {
              resolve();
            }, 1);
          });
        }
        // Prevent too many executions
        return this.keepCool(() => {
          // If the container measures have changed
          if (this.scrollable && (this.setContainerMeasures() || force)) {
            // Setting up the element's measures
            this.setResizeMeasures();
            // getting current measures of element and scrollable container
            let container = this.$el;
            let content = this.getRef('scrollContent');
            let ct = this.getRef('scrollContainer');
            let x = ct.scrollLeft;
            let y = ct.scrollTop;
            let contentBox = content.getBoundingClientRect()
            let containerBox = container.getBoundingClientRect()
            this.contentWidth = contentBox.width;
            this.contentHeight = contentBox.height;
            this.containerWidth = containerBox.width;
            this.containerHeight = containerBox.height;
            // With scrolling on we check the scrollbars
            if ( this.scrollable ){
              if ( (this.axis === 'both') || (this.axis === 'x') && (this.contentWidth > this.containerWidth) ){
                this.hasScrollX = true;
                this.$nextTick(() => {
                  if ( this.$refs.xScroller ){
                    this.$refs.xScroller.onResize();
                  }
                })
              }
              else{
                this.hasScrollX = false;
              }
              if ((this.axis === 'both') || (this.axis === 'y') && (this.contentHeight > this.containerHeight)){
                this.hasScrollY = true;
                this.$nextTick(() => {
                  if ( this.$refs.yScroller ){
                    this.$refs.yScroller.onResize();
                  }
                })
              }
              else{
                this.hasScrollY = false;
              }
              this.hasScroll = this.hasScrollY || this.hasScrollX;
              /** @todo Check if this shouldn't be with - (minus) containerSize */
              if ( this.currentX > this.contentWidth ) {
                // this.currentX = 0;
                x = this.contentWidth - this.containerWidth;
              }
              if ( this.currentY > this.contentHeight ) {
                // this.currentY = 0;
                y = this.contentHeight - this.containerHeight;
              }
              if (this.fullPage) {
                if (this.hasScrollX) {
                  let tot = Math.round(x / this.containerWidth);
                  x = this.containerWidth * tot;
                }
                if (this.hasScrollY) {
                  let tot = Math.round(y / this.containerHeight);
                  y = this.containerHeight * tot;
                }
              }
              if (x !== this.currentX) {
                this.currentX = x;
              }
              if (y !== this.currentY) {
                this.currentY = y;
              }

              if (this.scrollReady && bbn.fn.isNumber(this.currentX) && (this.currentX !== ct.scrollLeft)) {
                ct.scrollLeft = this.currentX;
              }
              if (this.scrollReady && bbn.fn.isNumber(this.currentY) && (this.currentY !== ct.scrollTop)) {
                ct.scrollTop = this.currentY;
              }

            }
            this.$emit('resize');
          }
        }, 'onResize', 20);
      },
      /**
       * Creates a delay to set the scroll as ready
       * @method waitReady
       * @fires keepCool
       * @fires onResize
       */
      waitReady(ev) {
        if (!this.ready) {
          if (this.readyDelay !== false) {
            clearTimeout(this.readyDelay);
          }
          this.readyDelay = setTimeout(() => {
            this.readyDelay = false;
            this.initSize();
          }, this.latency);
        }
        else if (!ev || !ev.detail || !ev.detail.cp || !ev.detail.cp.$options || (ev.detail.cp.$options.name !== 'bbn-floater')) {
          this.keepCool(() => {
            this.onResize();
          }, "init", this.latency * 2);
        }
      }
    },
    created(){
      this.componentClass.push('bbn-resize-emitter');
    },
    /**
     * @event mounted
     * @fires waitReady
     */
    mounted(){
      setTimeout(() => {
        if (!this.readyDelay && !this.ready) {
          this.waitReady();
        }
      }, 100)
    },
    beforeDestroy(){
      if (this.interval) {
        clearInterval(this.interval);
      }
    },
    watch: {
      /**
       * @watch ready
       * @param newVal 
       * @fires setInterval
       */
      ready(newVal){
        if (newVal) {
          setTimeout(() => {
            if (this.interval) {
              clearInterval(this.interval);
            }
            // Checks every second if the scroll content has been resized and sends onResize if so
            this.interval = setInterval(() => {
              if (this.scrollable && this.$el.offsetParent) {
                //bbn.fn.log("offsetParent ok");
                let content = this.getRef('scrollContent');
                let contentBox = content ? content.getBoundingClientRect() : {};
                let contentWidth = contentBox.width;
                let contentHeight = contentBox.height;
                if (
                  (
                    contentWidth
                    && (this.contentWidth !== contentWidth)
                    && (
                      !this.contentWidth
                      || (Math.abs(contentWidth - this.contentWidth) > 3)
                    )
                  )
                  || (
                    contentWidth
                    && (this.contentWidth !== contentHeight)
                    && (
                      !this.contentHeight
                      || (Math.abs(contentHeight - this.contentHeight) > 3)
                    )
                  )
                ) {
                  //bbn.fn.log("ON SCROLL INTERVAL");
                  this.onResize(true);
                }
              }
            }, 1000);
            setTimeout(() => {
              this.scrollReady = true;
              setTimeout(() => {
                this.afterReady = true;
              }, 1000);
            }, 1000);

          }, 100);
        }
      },
      /**
       * @watch scrollable
       * @param newVal 
       * @fires onResize
       */
      scrollable(newVal){
        if (newVal) {
          this.initSize();
        }
      },
      /**
       * @watch containerWidth
       * @param newVal 
       */
      containerWidth(){
        let x = this.getRef('xScroller');
        if ( x ){
          x.onResize()
        }
      },
      /**
       * @watch containerHeight
       * @param newVal 
       */
      containerHeight(){
        let y = this.getRef('yScroller');
        if ( y ){
          y.onResize()
        }
      },
      currentX(x) {
        if (!x) {
          this.$emit('reachLeft');
        }
        else {
          let ct = this.getRef('scrollContainer');
          if (ct && (x + ct.clientWidth >= ct.scrollWidth)) {
            this.$emit('reachRight');
          }
        }
        this.$emit('scrollx', x);
      },
      currentY(y) {
        if (!y) {
          this.$emit('reachTop');
        }
        else {
          let ct = this.getRef('scrollContainer');
          if (ct && (y + ct.clientHeight >= ct.scrollHeight)) {
            this.$emit('reachBottom');
          }
        }
        this.$emit('scrolly', y);
      }
    }
  });

})(bbn);


})(bbn);