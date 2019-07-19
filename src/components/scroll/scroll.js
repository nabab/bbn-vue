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
        default: 25
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
        scrollPos: (bbn.fn.getScrollBarSize() ? '-' + bbn.fn.getScrollBarSize() : '0') + 'px',
        /**
         * Defines the padding of the scroll container
         * @data {String} containerPadding
         */
        containerPadding: (bbn.fn.getScrollBarSize() ? bbn.fn.getScrollBarSize() : '0') + 'px',
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
        promise: false
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
      containerStyle(){
        if ( this.isMeasuring ){
          return {};
        }
        return {
          right: this.hasScrollX ? this.scrollPos : 0,
          bottom: this.hasScrollY ? this.scrollPos : 0,
          paddingRight: this.hasScrollX ? this.containerPadding : 0,
          paddingBottom: this.hasScrollY ? this.containerPadding : 0
        };
      },
      /**
       * @todo not used
       */
      contentStyle(){
        if ( this.isMeasuring ){
          return {};
        }
        return {
          width: (this.axis === 'x') || (this.axis === 'both') ? 'auto' : '100%',
          height: (this.axis === 'y') || (this.axis === 'both') ? 'auto' : '100%'
        };
      }
    },
    methods: {
      /**
       * Gets the dimensions after a resize
       * @method getNaturalDimensions
       * @fires getNaturalDimensions
       */
      getNaturalDimensions(){
        this.isMeasuring = true;
        return new Promise((resolve, reject) => {
          this.$nextTick().then(() => {
            let d = {width: this.getRef('scrollContent').clientWidth, height: this.getRef('scrollContent').clientHeight};
            if ( !d.width || !d.height ){
              let sc = this.find('bbn-scroll');
              if ( sc ){
                sc.getNaturalDimensions().then((d) => {
                  this.naturalWidth = sc.naturalWidth;
                  this.naturalHeight = sc.naturalHeight;
                  this.isMeasuring = false;
                  resolve(d);
                })
              }
              else{
                this.isMeasuring = false;
                resolve(d);
              }
            }
            else{
              this.naturalWidth = d.width;
              this.naturalHeight = d.height;
              this.isMeasuring = false;
              resolve(d);
            }
          })
        })
      },
      /**
       * @method onScroll
       * @param {Event} e 
       * @emits scroll
       */
      onScroll(e){
        let x = this.getRef('scrollContainer').scrollLeft;
        if ( x !== this.currentX ){
          this.currentX = x;
        }
        let y = this.getRef('scrollContainer').scrollTop;
        if ( y !== this.currentY ){
          this.currentY = y;
        }
        this.$emit('scroll', e)
      },
      /**
       * Scrolls to the given coordinates of x and y using the given animation
       * @method scrollTo
       * @param {Number} x 
       * @param {Number} y 
       * @param {String} animate 
       * @fires $refs.xScroller.scrollTo
       * @fires $refs.yScroller.scrollTo
       */
      scrollTo(x, y, animate){
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
          this.$refs.xScroller.scrollTo(x, animate);
        }
        if (
          this.hasScrollY &&
          (y !== undefined) &&
          (y !== null) &&
          this.$refs.yScroller
        ) {
          this.$refs.yScroller.scrollTo(y, animate);
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
       * @todo not used
       */
      update(){

      },
      /**
       * Handles the resize of the scroll
       * @method onResize
       * @fires keepCool
       * @fires getNaturalDimensions
       * @emits resize
       */
      onResize(force){
        if ( !this.ready && this.readyDelay ){
          return new Promise((resolve) => {
            setTimeout(() => {
              resolve();
            }, 1);
          });
        }
        let container = this.$el;
        let content = this.getRef('scrollContent');
        if (this.promise || !container || !content){
          return this.promise;
        }
        this.promise = new Promise((resolve) => {
          this.getNaturalDimensions().then(() => {
            this.$nextTick().then(() => {
              /** @todo Replace with a keepCool - to fix */
              setTimeout(() => {
                let containerWidth = container.clientWidth;
                let containerHeight = container.clientHeight;
                let contentWidth = content.scrollWidth || content.clientWidth;
                let contentHeight = content.scrollHeight || content.clientHeight;
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
                if ( (this.axis === 'both') || (this.axis === 'x') && (this.contentWidth > containerWidth) ){
                  if ( this.$refs.xScroller ){
                    this.$refs.xScroller.onResize();
                  }
                  this.hasScrollX = true;
                }
                else{
                  this.hasScrollX = false;
                }
                if ((this.axis === 'both') || (this.axis === 'y') && (this.contentHeight > containerHeight)){
                  if ( this.$refs.yScroller ){
                    this.$refs.yScroller.onResize();
                  }
                  this.hasScrollY = true;
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
                this.$emit('resize');
                this.setResizeMeasures();
                if ( !this.ready && !this.readyDelay ){
                  this.ready = true;
                }
                this.promise = false;
                resolve();
              }, 25);
            });
          });
        });
        return this.promise;
      },
      /**
       * @method scrollStart
       * @fires this.getRef('xScroller').scrollTo
       * @fires this.getRef('yScroller').scrollTo
       */  
      scrollStart(){
        let x = this.getRef('xScroller'),
            y = this.getRef('yScroller');
        if ( x ){
          x.scrollTo(0);
        }
        if ( y ){
          y.scrollTo(0);  
        }
      },
      /**
       * @method scrollEnd
       * @fires this.getRef('xScroller').scrollTo
       * @fires this.getRef('yScroller').scrollTo
       */  
      scrollEnd(){
        let x = this.getRef('xScroller'),
            y = this.getRef('yScroller');
        if ( x ){
          x.scrollTo('100%');
        }
        if ( y ){
          y.scrollTo('100%');
        }
      },
      /**
       * Initializes the scroll
       * @method init
       * @fires onResize
       */
      init(){
        this.onResize();
      },
      /**
       * Scroll the x axis to the position 0
       * @method scrollStartX
       * @fires this.$refs.xScroller.scrollTo
       */
      scrollStartX(){
        let x = this.getRef('xScroller');
        if (x) {
          x.scrollTo(0);
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
            y.scrollTo(0);
          }
          else {
            this.getRef('scrollContainer').scrollTop = 0;
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
          x.scrollTo('100%');
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
          y.scrollTo('100%');
        }
      },
      /**
       * @method waitReady
       * @fires keepCool
       * @fires onResize
       */
      waitReady(){
        if ( !this.ready ){
          if ( this.readyDelay !== false ){
            clearTimeout(this.readyDelay);
          }
          this.readyDelay = setTimeout(() => {
            this.readyDelay = false;
          }, this.latency);
        }
        else{
          this.keepCool(() => {
            this.onResize();
          }, "init", Math.round(this.latency/2));
        }
      }
    },
    /**
     * @event mounted
     * @fires waitReady
     */
    mounted(){
      this.waitReady();
    },
    watch: {
      /**
       * @watch readyDelay
       * @param newVal 
       * @fires onResize
       */
      readyDelay(newVal){
        if ( newVal === false ){
          this.onResize();
        }
      },
      lastKnownWidth(newVal){
        this.containerWidth = newVal;
      },
      lastKnownHeight(newVal){
        this.containerHeight = newVal;
      },
      containerWidth(){
        let x = this.getRef('xScroller');
        if ( x ){
          x.onResize()
        }
      },
      containerHeight(){
        let y = this.getRef('yScroller');
        if ( y ){
          y.onResize()
        }
      },
    }
  });

})(bbn);
