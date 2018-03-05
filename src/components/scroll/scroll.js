/**
 * Created by BBN on 10/02/2017.
 */
(function($, bbn){
  "use strict";
  let scrollBarWidth = (() => {
    var outer = document.createElement("div");
    outer.style.visibility = "hidden";
    outer.style.width = "100px";
    outer.style.msOverflowStyle = "scrollbar"; // needed for WinJS apps

    document.body.appendChild(outer);

    var widthNoScroll = outer.offsetWidth;
    // force scrollbars
    outer.style.overflow = "scroll";

    // add innerdiv
    var inner = document.createElement("div");
    inner.style.width = "100%";
    outer.appendChild(inner);

    var widthWithScroll = inner.offsetWidth;

    // remove divs
    outer.parentNode.removeChild(outer);

    return widthNoScroll - widthWithScroll;
  })();

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
        scrollPos: '-' + scrollBarWidth + 'px',
      }
    },
    methods: {
      scrollTo(x, y, animate){
        if ( !y && (typeof x === HTMLElement) ){
          y = x;
        }
        if ( this.$refs.xScroller ){
          this.$refs.xScroller.scrollTo(x, animate);
        }
        if ( this.$refs.yScroller ){
          this.$refs.yScroller.scrollTo(y, animate);
        }
      },
      scrollHorizontal(ev, left){
        bbn.fn.log(arguments);
        this.currentX = left;
      },
      scrollVertical(ev, top){
        this.currentY = top;
      },
      onResize(){
        if ( this.$refs.xScroller ){
          this.$refs.xScroller.onResize();
        }
        if ( this.$refs.yScroller ){
          this.$refs.yScroller.onResize();
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
