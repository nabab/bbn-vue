<template>
<div :class="elementClass"
     :style="elementStyle"
>
  <div :class="{'bbn-scroll-container': true, 'bbn-overlay': isScrolling || (!isMeasuring && !scrollable), 'bbn-scroll-not-dragged': !isDragging}"
       ref="scrollContainer"
       @scroll="onScroll"
       @touchmove="touchmove"
       @focus="isFocused = true"
       @blur="isFocused = false"
       :tabindex="scrollable ? '0' : '-1'"
  >
    <div :class="{'bbn-scroll-content': true, resizing: isMeasuring, 'bbn-overlay': !scrollable, 'bbn-100': fullPage}"
         ref="scrollContent"
         @ready.stop="waitReady"
         :style="contentStyle"
    >
      <slot></slot>
    </div>
  </div>
  <bbn-scrollbar v-if="ready && hasScrollX"
                 :hidden="hiddenX"
                 orientation="horizontal"
                 ref="xScroller"
                 :color="barColor ? barColor : ''"
                 :scrollAlso="scrollAlso"
                 :initial="currentX"
                 @scroll="scrollHorizontal"
                 @reachLeft="$emit($event)"
                 @reachRight="$emit($event)"
  >
  </bbn-scrollbar>
  <bbn-scrollbar v-if="ready && hasScrollY"
                 :hidden="hiddenY"
                 orientation="vertical"
                 ref="yScroller"
                 :color="barColor ? barColor : ''"
                 :scrollAlso="scrollAlso"
                 :initial="currentY"
                 @scroll="scrollVertical"
                 @reachTop="$emit($event)"
                 @reachBottom="$emit($event)"
  >
  </bbn-scrollbar>
</div>
</template>
<script>
  module.exports =  /**
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
    mixins: [bbn.vue.basicComponent, bbn.vue.resizerComponent, bbn.vue.keepCoolComponent],
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
        default: 125
      },
      scrollable: {
        type: Boolean,
        default: true
      },
      fullPage: {
        type: Boolean,
        default: false
      }
    },
    data() {
      return {
        /**
         * @data {Boolean} [false] readyDelay
         */
        readyDelay: false,
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
        previousTouch: {x: null, y: null}
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
        let st = this.componentClass.join(' ');
        if ( !this.currentWidth ){
          st += ' bbn-overlay';
        }
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
          maxHeight: this.maxHeight ? bbn.fn.formatSize(this.maxHeight) : '100%'
        };
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
        if ( this.isMeasuring || !this.scrollable ){
          return {};
        }
        return {
          width: (this.axis === 'x') || (this.axis === 'both') ? 'auto' : '100%',
          height: (this.axis === 'y') || (this.axis === 'both') ? 'auto' : '100%'
        };
      }
    },
    methods: {
      touchmove(e){
        if (this.fullPage) {
          if (!this.isScrolling && e.targetTouches && e.targetTouches.length) {
            let ev = e.targetTouches[0];
            let goingUp = false;
            let goingDown = false;
            let goingLeft = false;
            let goingRight = false;
            let dir = '';
            let ct = this.getRef('scrollContainer');
            if (this.previousTouch.x !== null) {
              if (this.hasScrollX && (ev.pageX !== this.previousTouch.x)) {
                let x = ct.scrollLeft;
                if (ev.pageX > this.previousTouch.x) {
                  goingLeft = true;
                  x = this.currentX - ct.clientWidth;
                  dir += ' left';
                }
                else {
                  x = this.currentX + ct.clientWidth;
                  goingRight = true;
                  dir += ' right';
                }
                if ((x != this.currentX) && this.$refs.xScroller) {
                  this.$refs.xScroller.scrollTo(x);
                }
                this.currentX = x;
                if (!x) {
                  this.$emit('reachLeft');
                }
                else if (x + ct.clientWidth >= ct.scrollWidth) {
                  this.$emit('reachRight');
                }
              }
              if (this.hasScrollY && (ev.pageY !== this.previousTouch.y)) {
                let y = ct.scrollTop;
                if (ev.pageY > this.previousTouch.y) {
                  goingUp = true;
                  y = this.currentY - ct.clientHeight;
                  dir += ' up';
                }
                else {
                  goingDown = true;
                  y = this.currentY + ct.clientHeight;
                  dir += ' down';
                }
                if ((y != this.currentY) && this.$refs.yScroller) {
                  this.$refs.yScroller.scrollTo(y);
                }
                this.currentY = y;
                if (!y) {
                  this.$emit('reachTop');
                }
                else if (y + ct.clientHeight >= ct.scrollHeight) {
                  this.$emit('reachBottom');
                }
              }
              if (dir) {
                this.isScrolling = true;
                setTimeout(() => {
                  this.isScrolling = false;
                }, 200);
              }
            }
            this.previousTouch.x = ev.pageX;
            this.previousTouch.y = ev.pageY;
            setTimeout(() => {
              this.previousTouch.x = null;
              this.previousTouch.y = null;
            }, 250)
            bbn.fn.log(e, dir);
          }
          e.preventDefault();
        }
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
                  this.isMeasuring = false;
                  this.naturalWidth = this.$el.offsetWidth;
                  this.naturalHeight = this.$el.offsetHeight;
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
              this.isMeasuring = false;
              this.naturalWidth = this.$el.offsetWidth;
              this.naturalHeight = this.$el.offsetHeight;
              resolve({w: this.naturalWidth, h: this.naturalHeight});
            }
          });
        });
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
        if (this.isScrolling || (this.fullPage && bbn.fn.isMobile())) {
          if (e && e.preventDefault) {
            e.preventDefault();
          }
          return;
        }
        let ct = this.getRef('scrollContainer');
        let x = ct.scrollLeft;
        if ( this.hasScrollX && (x !== this.currentX)) {
          if (this.fullPage) {
            this.isScrolling = true;
            setTimeout(() => {
              this.isScrolling = false;
            }, 1500);
            if (x > this.currentX) {
              x = this.currentX + ct.clientWidth;
            }
            else if (x < this.currentX) {
              x = this.currentX - ct.clientWidth;
            }
            if ((x != this.currentX) && this.$refs.xScroller) {
              this.$refs.xScroller.scrollTo(x);
            }
          }
          this.currentX = x;
          if (!x) {
            this.$emit('reachLeft');
          }
          else if (x + ct.clientWidth >= ct.scrollWidth) {
            this.$emit('reachRight');
          }
        }
        let y = ct.scrollTop;
        if ( this.hasScrollY && (y !== this.currentY)) {
          if (this.fullPage) {
            this.isScrolling = true;
            setTimeout(() => {
              this.isScrolling = false;
            }, 1500);
            if (y > this.currentY) {
              y = this.currentY + ct.clientHeight;
            }
            else if (y < this.currentY) {
              y = this.currentY - ct.clientHeight;
            }
            if ((y != this.currentY) && this.$refs.yScroller) {
              this.$refs.yScroller.scrollTo(y);
            }
          }
          this.currentY = y;
          if (!y) {
            this.$emit('reachTop');
          }
          else if (y + ct.clientHeight >= ct.scrollHeight) {
            this.$emit('reachBottom');
          }
        }
        this.$emit('scroll', e)
      },
      /**
       * Scrolls to the given coordinates of x and y using the given animation
       * @method scrollTo
       * @param {Number} x 
       * @param {Number} y 
       * @fires $refs.xScroller.scrollTo
       * @fires $refs.yScroller.scrollTo
       */
      scrollTo(x, y){
        if (!this.hasScroll || !this.ready) {
          return;
        }
        if (y === undefined) {
          y = x;
        }
        if (
          this.hasScrollX &&
          (x !== undefined) &&
          (x !== null) &&
          this.$refs.xScroller
        ) {
          this.$refs.xScroller.scrollTo(x);
        }
        if (
          this.hasScrollY &&
          (y !== undefined) &&
          (y !== null) &&
          this.$refs.yScroller
        ) {
          this.$refs.yScroller.scrollTo(y);
        }
      },
      /**
       * @method scrollHorizontal
       * @param {Event} ev 
       * @param {Number} left 
       * @emits scrollx
       */  
      scrollHorizontal(ev, left){
        this.currentX = left;
        this.$emit('scrollx', ev, left);
      },
      /**
       * @method scrollVertical
       * @param {Event} ev 
       * @param {Number} top 
       * @emits scrolly
       */ 
      scrollVertical(ev, top){
        this.currentY = top;
        this.$emit('scrolly', ev, top);
      },
      /**
       * @method initSize
       * @fires getNaturalDimensions
       * @fires onResize
       */
      initSize(){
        if ( !this.ready && this.readyDelay ){
          return new Promise((resolve) => {
            setTimeout(() => {
              resolve();
            }, 1);
          });
        }
        return this.getNaturalDimensions().then(() => {
          if ( !this.ready && !this.readyDelay ){
            this.ready = true;
          }
          this.onResize();
        });
      },
      /**
       * Handles the resize of the scroll
       * @method onResize
       * @fires keepCool
       * @fires getNaturalDimensions
       * @emits resize
       */
      onResize(force){
        if ( !this.ready ){
          return new Promise((resolve) => {
            setTimeout(() => {
              resolve();
            }, 1);
          });
        }
        return this.keepCool(() => {
          let container = this.$el;
          let content = this.getRef('scrollContent');
          let containerWidth = container.offsetWidth;
          let containerHeight = container.offsetHeight;
          let contentWidth = content.scrollWidth || content.offsetWidth;
          let contentHeight = content.scrollHeight || content.offsetHeight;
          if ( this.naturalWidth && (this.naturalWidth < this.contentWidth) ) {
            this.contentWidth = this.naturalWidth;
          }
          else{
            this.contentWidth = contentWidth;
          }
          if ( this.naturalHeight && (this.naturalHeight < this.contentHeight) ) {
            this.contentHeight = this.naturalHeight;
          }
          else{
            this.contentHeight = contentHeight;
          }
          if ( this.scrollable ){
            if ( (this.axis === 'both') || (this.axis === 'x') && (this.contentWidth > containerWidth) ){
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
            if ((this.axis === 'both') || (this.axis === 'y') && (this.contentHeight > containerHeight)){
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
            if ( this.currentX > this.contentWidth ) {
              this.currentX = 0;
            }
            if ( this.currentY > this.contentHeight ) {
              this.currentY = 0;
            }
            container.scrollLeft = this.currentX;
            container.scrollTop = this.currentY;
          }
          this.$emit('resize');
          this.setResizeMeasures();
        }, 'onResize', this.latency);
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
       * Initializes the scroll
       * @method init
       * @fires onResize
       */
      init(){
        this.initSize();
      },
      /**
       * Scroll the x axis to the position 0
       * @method scrollStartX
       * @fires this.$refs.xScroller.scrollTo
       */
      scrollStartX(){
        let x = this.getRef('xScroller');
        if (x) {
          x.scrollStart();
        }
        else {
          this.getRef('scrollContainer').scrollLeft = 0;
        }
      },
      /**
       * Scroll the y axis to the position 0
       * @method scrollStartY
       * @fires this.$refs.yScroller.scrollTo
       */
      scrollStartY() {
        if (this.hasScrollY) {
          let y = this.getRef('yScroller');
          if (y) {
            y.scrollStart();
          }
          else {
            this.getRef('scrollContainer').scrollTop = 0;
          }
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
        let x = this.getRef('xScroller');
        if ( x ){
          x.scrollEnd();
        }
        else {
          this.getRef('scrollContainer').scrollLeft = this.getRef('scrollContainer').scrollWidth;
        }
      },
       /**
       * Scroll the y axis to the end
       * @method scrollEndY
       * @thisfires this.getRef('yScroller').scrollTo
       */
      scrollEndY(){
        let y = this.getRef('yScroller');
        if ( y ){
          y.scrollEnd();
        }
        else {
          this.getRef('scrollContainer').scrollTop = this.getRef('scrollContainer').scrollHeight;
        }
      },
      /**
       * @method waitReady
       * @fires keepCool
       * @fires onResize
       */
      waitReady(cp){
        if (!this.ready) {
          if (this.readyDelay !== false) {
            clearTimeout(this.readyDelay);
          }
          this.readyDelay = setTimeout(() => {
            this.readyDelay = false;
          }, this.latency);
        }
        else if (!cp || !cp.$options || (cp.$options.name !== 'bbn-floater')) {
          this.keepCool(() => {
            this.onResize();
          }, "init", this.latency * 2);
        }
      }
    },
    /**
     * @event mounted
     * @fires waitReady
     */
    mounted(){
      setTimeout(() => {
        if ( !this.ready ){
          this.waitReady();
        }
      }, this.latency * 2);
    },
    watch: {
      /**
       * @watch readyDelay
       * @param newVal 
       * @fires onResize
       */
      readyDelay(newVal){
        if ( newVal === false ){
          this.initSize();
        }
      },
      /**
       * @watch scrollable
       * @param newVal 
       * @fires onResize
       */
      scrollable(newVal){
        if (newVal) {
          this.onResize();
        }
      },
      /**
       * @watch lastKnownWidth
       * @param newVal 
       */
      lastKnownWidth(newVal){
        this.containerWidth = newVal;
      },
      /**
       * @watch lastKnownHeight
       * @param newVal 
       */
      lastKnownHeight(newVal){
        this.containerHeight = newVal;
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
    }
  });

})(bbn);

</script>
<style scoped>
.bbn-scroll {
  position: relative;
  width: 100%;
  height: 100%;
}
.bbn-scroll > .bbn-scroll-container {
  width: 100%;
  height: 100%;
  box-sizing: content-box;
  scrollbar-width: none;
}
.bbn-scroll > .bbn-scroll-container.bbn-scroll-not-dragged {
  scroll-behavior: smooth;
}
.bbn-scroll > .bbn-scroll-container.bbn-overlay {
  overflow: hidden;
}
.bbn-scroll > .bbn-scroll-container:not(.bbn-overlay) {
  overflow: scroll;
}
.bbn-scroll > .bbn-scroll-container::-webkit-scrollbar {
  display: none;
}
.bbn-scroll > .bbn-scroll-container > .bbn-scroll-content {
  hyphens: auto;
  float: left;
  box-sizing: border-box;
}
.bbn-scroll > .bbn-scroll-container > .bbn-scroll-content:not(.resizing) {
  min-width: 100% !important;
  min-height: 100% !important;
}
.bbn-scroll ::-webkit-scrollbar {
  height: 0px;
  width: 0px;
  background: transparent;
}

</style>
