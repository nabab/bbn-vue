/**
 * Created by BBN on 10/02/2017.
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
        show: false,
        currentX: this.x,
        currentY: this.y,
        scrollPos: (bbn.fn.getScrollBarSize() ? '-' + bbn.fn.getScrollBarSize() : '0') + 'px',
        containerPadding: (bbn.fn.getScrollBarSize() ? bbn.fn.getScrollBarSize() : '0') + 'px',
        hiddenX: (this.hidden === true) || ((this.hidden === 'x')),
        hiddenY: (this.hidden === true) || ((this.hidden === 'y')),
        currentWidth: null,
        currentHeight: null
      }
    },
    computed: {
      /**
       * Based on the prop fixedFooter and fullScreen, a string is returned containing the classes for the form template.
       *
       * @computed currentClass
       * @return {String}
       */
      currentClass(){
        let st = this.componentClass.join(' ');
        if ( !this.currentWidth ){
          st += ' bbn-overlay';
        }
        if ( !this.ready ){
          st += ' bbn-invisible';
        }
        return st;
      },
      currentStyle(){
        if ( this.currentWidth ){
          return {
            width: this.currentWidth + 'px',
            height: this.currentHeight + 'px'
          };
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
      onScroll(e){
        this.keepCool(() => {
          this.$emit('scroll', e)
        })
      },
      testready(){
        bbn.fn.log("HEY I AM READY", this.$el);
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

      onResize(){
        if ( !this.lastKnownWidth || !this.lastKnownHeight ){
          this.currentWidth = this.getRef('scrollContent').clientWidth;
          if ( this.maxWidth && (this.currentWidth > this.maxWidth) ){
            this.currentWidth = this.maxWidth;
          }
          this.currentHeight = this.getRef('scrollContent').clientHeight;
          if ( this.maxHeight && (this.currentHeight > this.maxHeight) ){
            this.currentHeight = this.maxHeight;
          }
        }
        return this.$nextTick(() => {
          if ( this.$refs.xScroller ){
            this.$refs.xScroller.onResize();
          }
          if ( this.$refs.yScroller ){
            this.$refs.yScroller.onResize();
          }
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
    },
    mounted(){
      /** @todo WTF?? Obliged to execute the following hack to not have scrollLeft and scrollTop when we open a
       *  popup a 2nd time.
       */
      /*
      this.$refs.scrollContainer.style.position = 'relative';
      setTimeout(() => {
        this.$refs.scrollContainer.style.position = 'absolute';
      }, 0)
      */
      this.waitReady();
    },
    watch: {
      readyDelay(newVal){
        if ( newVal === false ){
          this.onResize();
        }
      },
      show(newVal, oldVal){
        if ( !this.hidden ){
          if ( newVal != oldVal ){
            this.$emit(newVal ? "show" : "hide");
          }
        }
      }
    }
  });

})(jQuery, bbn);
