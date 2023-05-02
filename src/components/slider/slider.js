/**
 * @file bbn-slider component
 *
 * @description 
 *
 * @copyright BBN Solutions
 *
 * @author Vito Fava
 */
return {
    /**
     * @mixin bbn.wc.mixins.basic 
     * @mixin bbn.wc.mixins.toggle
     * @mixin bbn.wc.mixins.resizer 
     */
    mixins: 
    [
      bbn.wc.mixins.basic, 
      bbn.wc.mixins.resizer, 
      bbn.wc.mixins.toggle
    ],
    static() {
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
    },
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
        if (!bbnSliderCreator.orientations[this.orientation]) {
          throw new Error(bbn._("Impossible to get an orientation for the slider"));
        }
        let o = {};
        let or = bbnSliderCreator.orientations[this.orientation];
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
       * Adds or removes the event listener for mousedown and touchstart.
       * @method _setEvents
       * @param add 
       */
      _setEvents(add){
        if ( add ){
          document.addEventListener('mouseup', this.checkClick);
          document.addEventListener('touchend', this.checkClick);
        }
        else{
          document.removeEventListener('mouseup', this.checkClick);
          document.removeEventListener('touchend', this.checkClick);
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
  };