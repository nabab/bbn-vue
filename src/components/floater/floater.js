/**
 * Created by BBN on 15/02/2017.
 */
(function(Vue, bbn){
  "use strict";
  /**
   * Classic input with normalized appearance
   */
  let isClicked = false;
  Vue.component('bbn-floater', {
    mixins: [bbn.vue.basicComponent, bbn.vue.focusComponent],
    props: {
      maxWidth: {
        type: String,
        default: '100%'
      },
      maxHeight: {
        type: String,
        default: '100%'
      },
      width: {
        type: Number
      },
      height: {
        type: Number
      },
      left: {
        type: Number
      },
      right: {
        type: Number
      },
      top: {
        type: Number
      },
      bottom: {
        type: Number
      },
      source: {
        type: [Function, Array, String]
      },
      component: {
        type: [Object, String]
      },
      content: {
        type: String
      },
      options: {
        type: Object
      },
      element: {
        type: Element
      },
      hpos: {
        type: String,
        default: 'left'
      },
      vpos: {
        type: String,
        default: 'top'
      }
    },
    data(){
      let left, right, top, bottom, width, height, maxWidth, maxHeight;
      if ( this.element ){
        let coor = this.element.getBoundingClientRect();
        left = this.hpos === 'left' ? null : coor.left + coor.width;
        right = this.hpos !== 'left' ? null : bbn.env.width - coor.rightt;
        top = this.vpos === 'top' ? null : coor.top + coor.height;
        bottom = this.vpos !== 'top' ? null : bbn.env.height - coor.bottom;
        width = this.width || coor.width;
        height = this.height || null;
      }
      else{
        left = this.left || null;
        right = this.right || null;
        top = this.top || null;
        bottom = this.bottom || null;
        width = this.width || null;
        height = this.height || null;
      }
      if ( (left < 0) || (left > bbn.env.width) ){
        left = null;
      }
      if ( (right <= 0) || (right > bbn.env.width) ){
        right = null;
      }
      if ( (top <= 0) || (top > bbn.env.height) ){
        top = null;
      }
      if ( (bottom <= 0) || (bottom > bbn.env.height) ){
        bottom = null;
      }
      if ( (width <= 0) || (width > bbn.env.width) ){
        width = null;
      }
      if ( (height <= 0) || (height > bbn.env.height) ){
        height = null;
      }
      return {
        currentIndex: 0,
        currentLeft: left,
        currentRight: right,
        currentTop: top,
        currentBottom: bottom,
        currentHeight: height,
        currentWidth: width,
        focused: bbn.env.focused || null
      };
    },
    computed: {
      realLeft(){
        return this.currentLeft ? this.currentLeft + 'px' : 'auto'
      },
      realRight(){
        return this.currentRight ? this.currentRight + 'px' : 'auto'
      },
      realTop(){
        return this.currentTop ? this.currentTop + 'px' : 'auto'
      },
      realBottom(){
        return this.currentBottom ? this.currentBottom + 'px' : 'auto'
      },
      realWidth(){
        return this.currentWidth ? this.currentWidth + 'px' : 'auto'
      },
      realHeight(){
        return this.currentHeight ? this.currentHeight + 'px' : 'auto'
      },
    },
    methods: {
      getStyles(){
        let left = this.left ? (bbn.fn.isNumber(this.left) ? this.left : parseInt(this.left)) : '',
            right = this.right ? (bbn.fn.isNumber(this.right) ? this.right : parseInt(this.right)) : '',
            top = this.top ? (bbn.fn.isNumber(this.top) ? this.top : parseInt(this.top)) : '',
            bottom = this.bottom ? (bbn.fn.isNumber(this.bottom) ? this.bottom : parseInt(this.bottom)) : '';
        if ( this.currentHeight ){
          let tW = bbn.env.width,
              tH = bbn.env.height;
          if ( right && ((right + this.currentWidth) >= tW) ){
            left = '';
            right = (bbn.env.width - this.currentWidth) + 'px';
          }
          else if ( left && ((left + this.currentWidth) >= tW) ){
            right = '';
            left = (tW < this.currentWidth ? 0 : tW - this.currentWidth) + 'px';
          }
          if ( bottom && ((bottom + this.currentHeight) >= tH) ){
            top = '';
            bottom = (tH - this.currentHeight) + 'px';
          }
          else if ( top && ((top + this.currentHeight) >= tH) ){
            bottom = '';
            top = (tH - this.currentHeight) + 'px';
          }
        }
        /*
        bbn.fn.warning("GET STYLES");
        bbn.fn.log({
          left: left,
          right: right,
          top: top,
          bottom: bottom,
          maxHeight: this.maxHeight
        });
        */
        return {
          left: left ? left + 'px' : null,
          right: right ? right + 'px' : null,
          top: top ? top + 'px' : null,
          bottom: bottom ? bottom + 'px' : null,
          maxHeight: this.maxHeight
        };
      },
      leaveList: function(e){
        if ( !isClicked ){
          this.close();
        }
      },
      over(idx){
      },
      close(e){
        this.currentIndex = false;
      },
    },
    created(){
      this.focused = bbn.env.focused;
    },
    mounted(){
      this.$nextTick(() => {
        this.$el.focus();
        this.ready = true;
      })
    }
  });

})(window.Vue, window.bbn);
