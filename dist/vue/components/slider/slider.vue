<template>
<div :class="['bbn-abs', 'bbn-bordered', 'bbn-background', componentClass, {
  'bbn-no-hborder': !isVertical,
  'bbn-no-vborder': isVertical,
  'bbn-w-100': !isVertical,
  'bbn-h-100': isVertical,
}]"
     @mouseup.stop
     @mousedown.stop
     @keydown.escape="hide"
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
         'bbn-m': !isMobile,
         'bbn-xxl': isMobile,
         'bbn-unselectable': true
       }"
       @click.stop.prevent="hide">
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
  const orientations = {
    left: {
      shadow: '2px 0 20px 0',
      size: 'width',
      prop: 'top'
    },
    right: {
      shadow: '-2px 0 20px 0',
      size: 'width',
      prop: 'top'
    },
    top: {
      shadow: '2px 0 20px 0',
      size: 'height',
      prop: 'left'
    },
    bottom: {
      shadow: '2px 0 20px 0',
      size: 'height',
      prop: 'left'
    }
  };

  Vue.component('bbn-slider', {
    /**
     * @mixin bbn.vue.basicComponent 
     * @mixin bbn.vue.toggleComponent
     * @mixin bbn.vue.resizerComponent 
     */
    mixins: 
    [
      bbn.vue.basicComponent, 
      bbn.vue.resizerComponent, 
      bbn.vue.toggleComponent
    ],
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
        opacity: 1,
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
        right: null,
        /**
         * @data {Number|Boolean} [false] transitionTimeout
         */
        transitionTimeout: false,
        /**
         * Internal setting for when showing shadow.
         * @data {Boolean} showShadow
         */
         showShadow: this.visible
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
        if (!orientations[this.orientation]) {
          throw new Error(bbn._("Impossible to get an orientation for the slider"));
        }
        let o = {};
        let or = orientations[this.orientation];
        if (this.showShadow) {
          o['-webkit-box-shadow'] = o['-moz-box-shadow'] = o['box-shadow'] = or.shadow + ' !important';
        }

        o[or.size] = 'auto';
        o[or.prop] = 0;
        o[this.orientation] = this.currentVisible ? 0 : -this.currentSize + 'px';
        if (this.ready && !this.isResizing) {
          o.transition = this.orientation + ' 0.5s';
        }
        else {
          o.opacity = 0;
        }

        return o;
      }
    },
    methods: {
      /**
       * Private method to manage the "touchstart" event
       * @method _touchStart
       */
      _touchStart(){
        this.touchStart = true;
        this.touchMove = false;
      },
      /**
       * Private method to manage the "touchmove" event
       * @method _touchMove
       */
      _touchMove(){
        this.touchMove = true;
      },
      /**
       * Private method to manage the "touchend" event
       * @method _touchEnd
       * @param {Event} e
       * @fires checkClick
       */
      _touchEnd(e){
        if (!this.touchMove) {
          this.checkClick(e);
        }
        this.touchStart = false;
        this.touchMove = false;
      },
      /**
       * Adds or removes the event listener for mousedown and touchstart.
       * @method _setEvents
       * @param add
       */
      _setEvents(add){
        if ( add ){
          document.addEventListener('mouseup', this.checkClick);
          document.addEventListener('touchstart', this._touchStart);
          document.addEventListener('touchmove', this._touchMove);
          document.addEventListener('touchend', this._touchEnd);
        }
        else{
          document.removeEventListener('mouseup', this.checkClick);
          document.removeEventListener('touchstart', this._touchStart);
          document.removeEventListener('touchmove', this._touchMove);
          document.removeEventListener('touchend', this._touchEnd);
        }
      },
      /**
       * Handles the resize.
       * @method onResize
       */
      onResize() {
        this.isResizing = true;
        if (this.transitionTimeout) {
          clearTimeout(this.transitionTimeout);
        }
        this.transitionTimeout = setTimeout(() => {
          if (this.setResizeMeasures() || this.setContainerMeasures()) {
            let s = this.$el.getBoundingClientRect()[this.isVertical ? 'width' : 'height'];
            if ((s !== this.currentSize) && (s > 20)){
              this.currentSize = s + 7;
            }
          }
          this.isResizing = false;
          if (!this.ready) {
            setTimeout(() => {
              this.ready = true;
            }, 500)
          }
        }, 500);
      },
      /**
       * Handles the mousedown.
       * @param {Event} e 
       * @fires toggle
       */
       checkClick(e){
        if (this.currentVisible) {
          if (!e.target.closest(".bbn-appui-menu-button")) {
            this.hide();
          }
        }
      },
      changeVisible(v) {
        //bbn.fn.log("CHANGE SLIDER VISIBLE");
        if (v && !this.hasBeenOpened) {
          this.hasBeenOpened = true;
        }
        this.switchFocus(v);
      }
    },
    /**
     * Sets the events listener.
     * @event created
     * @fires _setEvents
     */
    created(){
      this.componentClass.push('bbn-resize-emitter');
      this._setEvents(true);
    },
    /**
     * Removes the events listener.
     * @event destroyed
     * @fires _setEvents
     */
    beforeDestroy(){
      this._setEvents();
    },
    /**
     * Initializes the component.
     * @event mounted
     */
    mounted(){
      this.onResize();
    },
    watch: {
      /**
       * @watch currentSize
       * @param v 
       */
      currentSize(v){
        this.$el.style[this.isVertical ? 'width' : 'height'] = v;
      },
      visible(v){
        this.currentVisible = v;
      },
      currentVisible(v) {
        if (!v) {
          this._shadowTimeout = setTimeout(() => {
            this.showShadow = false;
          }, 500)
        }
        else {
          if (this._shadowTimeout) {
            clearTimeout(this._shadowTimeout);
          }
          this.showShadow = true;
        }
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
