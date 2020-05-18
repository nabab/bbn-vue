<template>
<div :class="['bbn-abs', 'bbn-bordered', 'bbn-background', componentClass, {
  'bbn-no-hborder': !isVertical,
  'bbn-no-vborder': isVertical,
  'bbn-w-100': !isVertical,
  'bbn-h-100': isVertical,
}]"
     @mousedown.stop
     :style="currentStyle"
>
  <slot></slot>
  <div v-if="closeButton"
       :class="{
         'bbn-abs': true,
         'bbn-top-right': (closeButton !== 'bottom-right') && (closeButton !== 'bottom-left') && (closeButton !== 'top-left'),
         'bbn-bottom-right': closeButton === 'bottom-right',
         'bbn-top-left': closeButton === 'top-left',
         'bbn-bottom-left': closeButton === 'bottom-left',
         'bbn-p': true,
         'bbn-spadded': true,
         'bbn-m': true,
         'bbn-unselectable': true
       }"
       @click="hide">
    <i class="nf nf-fa-times"></i>
  </div>
</div>
</template>
<script>
  module.exports = /**
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
    /**
     * @mixin bbn.vue.basicComponent 
     * @mixin bbn.vue.toggleComponent
     * @mixin bbn.vue.resizerComponent 
     */
    mixins: [bbn.vue.basicComponent, bbn.vue.resizerComponent, bbn.vue.toggleComponent],
    props: {
      /**
       * The orientation of the slider.
       * @prop {String} ['left'] orientation 
       */
      orientation: {
        type: String,
        default: 'left'
      },
      /**
       * The close button.
       * @prop {Boolean|String} [true]
       */
      closeButton: {
        type: [Boolean, String],
        default: true
      },
      /**
       * Defines if the slider is visible.
       * @prop {Boolean} [false] visible
       */
      visible: {
        type: Boolean,
        default: false
      }
    },
    data(){
      return {
        /**
         * True when the component has been opened.
         */
        hasBeenOpened: false,
        /**
         * The opacity of the slider.
         * @data {Number} [0] opacity
         */
        opacity: 0,
        /**
         * The current size.
         * @data {Number} [0] currentSize
         */
        currentSize: 0,
        /**
         * The position top.
         * @data [null] top
         */
        top: null,
        /**
         * The position left.
         * @data [null] left
         */
        left: null,
        /**
         * The position bottom.
         * @data [null] bottom
         */
        bottom: null,
        /**
         * The position right.
         * @data [null] right
         */
        right: null
      };
    },
    computed: {
      /**
       * True if it is a vertical slider.
       * @computed isVertical
       * @returns {Boolean}
       */
      isVertical(){
        return (this.orientation === 'left') || (this.orientation === 'right');
      },
      /**
       * The current style.
       * @computed currentStyle
       * @returns {String}
       */
      currentStyle(){
        let o = {
          opacity: this.opacity
        };
        switch (this.orientation) {
          case 'left':
            o['-webkit-box-shadow'] = '5px 0 5px 0 !important';
            o['-moz-box-shadow'] = '5px 0 5px 0 !important';
            o['box-shadow'] = '5px 0 5px 0 !important';
            o.width = 'auto';
            o.top = 0;
            o.left = this.currentVisible ? 0 : -this.currentSize + 'px';
            o.transition = 'left 0.5s';
            break;
          case 'right':
            o['-webkit-box-shadow'] = '-5px 0 5px 0 !important';
            o['-moz-box-shadow'] = '-5px 0 5px 0 !important';
            o['box-shadow'] = '-5px 0 5px 0 !important';
            o.width = 'auto';
            o.top = 0;
            o.right = this.currentVisible ? 0 : -this.currentSize + 'px';
            o.transition = 'right 0.5s';
            break;
          case 'top':
            o['-webkit-box-shadow'] = '0 5px 0 5px !important';
            o['-moz-box-shadow'] = '0 5px 0 5px !important';
            o['box-shadow'] = '0 5px 0 5px !important';
            o.left = 0;
            o.top = this.currentVisible ? 0 : -this.currentSize + 'px';
            o.transition = 'top 0.5s';
            break;
          case 'bottom':
            o['-webkit-box-shadow'] = '0 -5px 0 5px !important';
            o['-moz-box-shadow'] = '0 -5px 0 5px !important';
            o['box-shadow'] = '0 -5px 0 5px !important';
            o.left = 0;
            o.bottom = this.currentVisible ? 0 : -this.currentSize + 'px';
            o.transition = 'bottom 0.5s';
            break;
        }
        return o;
      }
    },
    methods: {
      /**
       * Adds or removes the event listener for mousedown and touchstart.
       * @method _setEvents
       * @param add 
       */
      _setEvents(add){
        if ( add ){
          document.addEventListener('mousedown', this.checkMouseDown);
          document.addEventListener('touchstart', this.checkMouseDown);
        }
        else{
          document.removeEventListener('mousedown', this.checkMouseDown);
          document.removeEventListener('touchstart', this.checkMouseDown);
        }
      },
      /**
       * Handles the resize.
       * @method onResize
       */
      onResize(){
        let s = this.$el.getBoundingClientRect()[this.isVertical ? 'width' : 'height'];
        if ((s !== this.currentSize) && (s > 20)){
          this.currentSize = s + 7;
        }
      },
      /**
       * Shows the slider.
       * @method show
       * @fires onResize
       * @emits show      
       */
      show(){
        this.onResize();
        let e = new Event('show', {cancelable: true});
        this.$emit('show', e);
        if (!e.defaultPrevented) {
          this.currentVisible = true;
        }
      },
      /**
       * Hides the slider.
       * @method hide
       * @emits hide      
       */
      hide(){
        let e = new Event('show', {cancelable: true});
        this.$emit('hide', e);
        if (!e.defaultPrevented) {
          this.currentVisible = false;
        }
      },
      /**
       * Toggles the slider.
       * @method toggle
       */
      toggle(){
        if (this.currentVisible) {
          this.hide();
        }
        else{
          this.show();
        }
      },
      /**
       * Handles the mousedown.
       * @param {Event} e 
       * @fires toggle
       */
      checkMouseDown(e){
        if ( this.currentVisible &&
          !e.target.closest(".bbn-treemenu") &&
          !e.target.closest(".bbn-menu-button")
        ){
          e.preventDefault();
          e.stopImmediatePropagation();
          this.toggle();
        }
      },
    },
    /**
     * Sets the events listener.
     * @event created
     * @fires _setEvents
     */
    created(){
      this._setEvents();
    },
    /**
     * Removes the events listener.
     * @event destroyed
     * @fires _setEvents
     */
    destroyed(){
      this._setEvents();
    },
    /**
     * Initializes the component.
     * @event mounted
     */
    mounted(){
      this.onResize();
      this.ready = true;
      this.$nextTick(() => {
        this.opacity = 1;
      });
    },
    watch: {
      /**
       * @watch currentVisible
       * @param {Boolean} newVal 
       * @fires tree.load
       * @fires _setEvents
       */
      currentVisible(newVal){
        this._setEvents(!!newVal);
      },
      /**
       * @watch currentSize
       * @param v 
       */
      currentSize(v){
        this.$el.style[this.isVertical ? 'width' : 'height'] = v;
      }
    }
  });

})(bbn);
</script>
<style scoped>
.bbn-slider {
  z-index: 10;
}

</style>
