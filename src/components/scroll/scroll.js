/**
 * Created by BBN on 10/02/2017.
 */
(function($, bbn){
  "use strict";
  Vue.component('bbn-scroll', {
    mixins: [bbn.vue.basicComponent, bbn.vue.resizerComponent],
    props: {
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
      }
    },
    data() {
      return {
        show: false,
        currentX: this.x,
        currentY: this.y,
        scrollPos: (bbn.fn.getScrollBarSize() ? '-' + bbn.fn.getScrollBarSize() : '0') + 'px',
      }
    },
    methods: {
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
        if ( this.$refs.xScroller ){
          this.$refs.xScroller.onResize();
        }
        if ( this.$refs.yScroller ){
          this.$refs.yScroller.onResize();
        }
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
      }
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
      this.ready = true;
    },
    watch: {
      show(newVal, oldVal){
        if ( newVal != oldVal ){
          this.$emit(newVal ? "show" : "hide");
        }
      }
    }
  });

})(jQuery, bbn);
