/**
 * @file bbn-slider component
 *
 * @description 
 *
 * @copyright BBN Solutions
 *
 * @author Vito Fava
 */
(function(bbn){
  "use strict";

  Vue.component('bbn-slider', {
    mixins: [bbn.vue.basicComponent, bbn.vue.resizerComponent],
    props: {
      orientation: {
        type: String,
        default: 'left'
      },
      opened: {
        type: Boolean,
        default: false
      },
      closeButton: {
        type: [Boolean, String],
        default: true
      }
    },
    data(){
      return {
        isOpened: this.opened,
        opacity: 0,
        currentSize: 0,
        top: null,
        left: null,
        bottom: null,
        right: null
      };
    },
    computed: {
      isVertical(){
        return (this.orientation === 'left') || (this.orientation === 'right');
      },
      currentStyle(){
        let o = {
          opacity: this.opacity
        };
        switch (this.orientation) {
          case 'left':
            o.top = 0;
            o.left = this.isOpened ? 0 : -this.currentSize + 'px';
            o.transition = 'left 0.5s';
            break;
          case 'right':
            o.top = 0;
            o.right = this.isOpened ? 0 : -this.currentSize + 'px';
            o.transition = 'right 0.5s';
            break;
          case 'top':
            o.left = 0;
            o.top = this.isOpened ? 0 : -this.currentSize + 'px';
            o.transition = 'top 0.5s';
            break;
          case 'bottom':
            o.left = 0;
            o.bottom = this.isOpened ? 0 : -this.currentSize + 'px';
            o.transition = 'bottom 0.5s';
            break;
        }
        return o;
      }
    },
    methods: {
      getSize(){
        return this.$el.getBoundingClientRect()[this.isVertical ? 'width' : 'height'];
      },
      updateSize(){
        let s = this.getSize();
        if (s !== this.currentSize) {
          this.currentSize = s;
        }
      },
      show(){
        this.updateSize();
        this.isOpened = true;
      },
      hide(){
        this.updateSize();
        this.isOpened = false;
      },
      toggle(){
        if (this.isOpened) {
          this.hide();
        }
        else{
          this.show();
        }
      }
    },
    mounted(){
      this.$nextTick(() => {
        if (this.isOpened) {
          this.show();
        }
        else{
          this.hide();
        }
        this.opacity = 1;
        this.ready = true;
      });
    },
    watch: {
      currentSize(v){
        this.$el.style[this.isVertical ? 'width' : 'height'] = v;
      }
    }
  });

})(bbn);
