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
         * Indicates if we are on a mobile device
         * @data {Boolean} isMobile
         */
        isMobile: bbn.fn.isMobile()
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
        let o = {};
        switch (this.orientation) {
          case 'left':
            o['-webkit-box-shadow'] = '5px 0 5px 0 !important';
            o['-moz-box-shadow'] = '5px 0 5px 0 !important';
            o['box-shadow'] = '5px 0 5px 0 !important';
            o.width = 'auto';
            o.top = 0;
            o.left = this.currentVisible ? 0 : -this.currentSize + 'px';
            if (this.ready && !this.isResizing) {
              o.transition = 'left 0.5s';
            }
            else {
              o.opacity = 0;
            }
            break;
          case 'right':
            o['-webkit-box-shadow'] = '-5px 0 5px 0 !important';
            o['-moz-box-shadow'] = '-5px 0 5px 0 !important';
            o['box-shadow'] = '-5px 0 5px 0 !important';
            o.width = 'auto';
            o.top = 0;
            o.right = this.currentVisible ? 0 : -this.currentSize + 'px';
            if (this.ready && !this.isResizing) {
              o.transition = 'right 0.5s';
            }
            else {
              o.opacity = 0;
            }
            break;
          case 'top':
            o['-webkit-box-shadow'] = '0 5px 5px 0 !important';
            o['-moz-box-shadow'] = '0 5px 5px 0 !important';
            o['box-shadow'] = '0 5px 5px 0 !important';
            o.left = 0;
            o.top = this.currentVisible ? 0 : -this.currentSize + 'px';
            if (this.ready && !this.isResizing) {
              o.transition = 'top 0.5s';
            }
            else {
              o.opacity = 0;
            }
            break;
          case 'bottom':
            o['-webkit-box-shadow'] = '0 -5px 5px 0 !important';
            o['-moz-box-shadow'] = '0 -5px 5px 0 !important';
            o['box-shadow'] = '0 -5px 5px 0 !important';
            o.left = 0;
            o.bottom = this.currentVisible ? 0 : -this.currentSize + 'px';
            if (this.ready && !this.isResizing) {
              o.transition = 'bottom 0.5s';
            }
            else {
              o.opacity = 0;
            }
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
      onResize() {
        bbn.fn.log("on Rersize");
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
      changeVisible(v) {
        bbn.fn.log("CHANGE VISIBLE");
        if (v && !this.hasBeenOpened) {
          this.hasBeenOpened = true;
        }
        this.switchFocus(v);
        this._setEvents(!!v);
      }
    },
    /**
     * Sets the events listener.
     * @event created
     * @fires _setEvents
     */
    created(){
      this.componentClass.push('bbn-resize-emitter');
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
    },
    watch: {
      /**
       * @watch currentSize
       * @param v 
       */
      currentSize(v){
        this.$el.style[this.isVertical ? 'width' : 'height'] = v;
      },
    }
  });

})(bbn);