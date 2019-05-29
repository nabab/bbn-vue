 /**
  * @file bbn-scroll component
  *
  * @description bbn-scrool is a component consisting of horizontal and vertical bars that allow the flow of content in both directions, if the container its smaller than the content, inserts and removes reactively vertical, horizontal bar or both.
  *
  * @copyright BBN Solutions
  *
  * @author BBN Solutions
  *
  * @created 10/02/2017
  */

(function($, bbn){
  "use strict";
  Vue.component('bbn-scroll', {
    mixins: [bbn.vue.basicComponent, bbn.vue.resizerComponent, bbn.vue.keepCoolComponent],
    props: {
      maxWidth: {
        type: Number
      },
      maxHeight: {
        type: Number
      },
      minWidth: {
        type: Number
      },
      minHeight: {
        type: Number
      },
      width: {
        type: Number
      },
      height: {
        type: Number
      },
      classes: {
        type: String,
        default: ""
      },
      speed: {
        type: Number,
        default: 50
      },
      axis: {
        type: String,
        default: "both"
      },
      scrollAlso: {
        type: [HTMLElement, Array, Function],
        default(){
          return [];
        }
      },
      x: {
        type: Number,
        default: 0
      },
      y: {
        type: Number,
        default: 0
      },
      hidden: {
        type: Boolean,
        default: false
      },
      barColor: {
        type: String
      }
    },
    data() {
      return {
        readyDelay: false,
        show: false,
        currentX: this.x,
        currentY: this.y,
        scrollPos: (bbn.fn.getScrollBarSize() ? '-' + bbn.fn.getScrollBarSize() : '0') + 'px',
        containerPadding: (bbn.fn.getScrollBarSize() ? bbn.fn.getScrollBarSize() : '0') + 'px',
        hiddenX: (this.hidden === true) || ((this.hidden === 'x')),
        hiddenY: (this.hidden === true) || ((this.hidden === 'y')),
        currentWidth: this.width || null,
        currentHeight: this.height || null,
        naturalWidth: 0,
        naturalHeight: 0,
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
        hasScrollY: false
      }
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
      elementStyle(){
        let cfg = {
          maxWidth: '100%',
          maxHeight: '100%'
        };
        /*
        if ( this.currentWidth ){
          cfg.width = (this.currentWidth < this.lastKnownWidth ? this.currentWidth : this.lastKnownWidth) + 'px';
        }
        if ( this.currentHeight ){
          cfg.height = (this.currentHeight < this.lastKnownHeight ? this.currentHeight : this.lastKnownHeight) + 'px';
        }
        */
        return cfg;
      },
      containerClass(){
        if ( this.isMeasuring ){
          return '';
        }
        return '';
      },
      containerStyle(){
        if ( this.isMeasuring ){
          return {};
        }
        return {};
      },
      contentClass(){
        if ( this.isMeasuring ){
          return '';
        }
        return '';
      },
      contentStyle(){
        if ( this.isMeasuring ){
          return {};
        }
        return {};
      }
    },
    methods: {
      mousemove(e){
        this.keepCool(() => {
          this.$emit('mousemove', e);
        }, 'mousemove', 50);
      },
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
      onScroll(e){
        this.keepCool(() => {
          this.$emit('scroll', e)
        })
      },
      scrollTo(x, y, animate){
        if ( !y && (typeof x === HTMLElement) ){
          y = x;
        }
        if ( this.$refs.xScroller && (x !== undefined) && (x !== null) ){
          this.$refs.xScroller.scrollTo(x, animate);
        }
        if ( this.$refs.yScroller && (y !== undefined) && (y !== null) ){
          this.$refs.yScroller.scrollTo(y, animate);
        }
      },

      scrollHorizontal(ev, left){
        this.currentX = left;
        this.$emit('scrollx', ev, left);
      },

      scrollVertical(ev, top){
        this.currentY = top;
        this.$emit('scrolly', ev, top);
      },

      update(){

      },

      onResize(force){
        if ( !this.ready && this.readyDelay ){
          return false;
        }
        bbn.fn.log("SCROLL RESIZE " + this._uid);
        return new Promise((resolve, reject) => {
          this.getNaturalDimensions().then(() => {
            bbn.fn.log("NAT", this.naturalWidth, this.naturalHeight);
            this.$nextTick().then(() => {
              if ( (this.axis === 'both') || (this.axis === 'x') && (this.$el.clientWidth < this.naturalWidth) ){
                if ( this.$refs.xScroller ){
                  this.$refs.xScroller.onResize();
                }
                this.hasScrollX = true;
              }
              else{
                this.hasScrollX = false;
              }
              if ( (this.axis === 'both') || (this.axis === 'y') && (this.$el.clientHeight < this.naturalHeight) ){
                if ( this.$refs.yScroller ){
                  this.$refs.yScroller.onResize();
                }
                this.hasScrollY = true;
              }
              else{
                this.hasScrollY = false;
              }
              this.hasScroll = this.hasScrollY || this.hasScrollX;
              this.$emit('resize');
              if ( !this.ready && !this.readyDelay ){
                this.ready = true;
              }
              resolve();
            });          
          });
        });
      },

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
      init(){
        this.onResize();
      },

      scrollStartX(){
        let x = this.getRef('xScroller');
        this.$refs.xScroller.scrollTo(0);
      },

      scrollStartY(){
        let y = this.getRef('yScroller');
        this.$refs.yScroller.scrollTo(0);
      },

      scrollEndX(){
        let x = this.getRef('xScroller');
        if ( x ){
          x.scrollTo('100%');
        }
      },

      scrollEndY(){
        let y = this.getRef('yScroller');
        if ( y ){
          y.scrollTo('100%');
        }
      },
      waitReady(){
        bbn.fn.log("IS READY ? ", this.ready);
        if ( !this.ready ){
          if ( this.readyDelay !== false ){
            clearTimeout(this.readyDelay);
          }
          this.readyDelay = setTimeout(() => {
            this.readyDelay = false;
          }, 100);
        }
        else{
          this.keepCool(() => {
            this.onResize();
          }, "init", 250);
        }
      }
    },
    mounted(){
      this.waitReady();
    },
    watch: {
      readyDelay(newVal){
        if ( newVal === false ){
          this.onResize();
        }
      }
    }
  });

})(jQuery, bbn);
