(bbn => {
  "use strict";
  bbn.fn.autoExtend("vue", {
    toggleComponent: {
      props: {
        /**
         * True if the component has to be visible.
         * @memberof toggleComponent
         * @prop {Boolean} [false] true
         */
        visible: {
          type: Boolean,
          default: true
        },
        /**
         * True to focus the component.
         * @memberof toggleComponent
         * @prop {Boolean} [true] focused
         */
        focused: {
          type: Boolean,
          default: true
        }
      },
      data(){
        return {
          /**
           * If an element is focused it returns it.
           * @data {Element} prevFocused
           * @memberof toggleComponent
           */
          prevFocused: bbn.env.focused,
          /**
           * Whether or not the component is currently visible.
           * @memberof toggleComponent
           * @data {Boolean} currentVisible
           */
          currentVisible: this.visible,
          /**
           * The focusable element.
           * @memberof toggleComponent
           * @data {HTMLElement} [null] focusable
           */
          focusable: null,
          /**
           * True when the component has been opened.
           * @memberof toggleComponent
           * @data hasBeenOpened {Boolean} [false]
           */
          hasBeenOpened: false
        };
      },
      methods: {
        /**
         * Shows the slider.
         * @method show
         * @fires onResize
         * @emits show      
         */
        show(){
          let e = new Event('beforeShow', {cancelable: true});
          this.$emit('beforeShow', e);
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
          let e = new Event('beforeHide', {cancelable: true});
          this.$emit('beforeHide', e);
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
         * Change the focused element.
         * @param {boolean} v
         * @memberof toggleComponent 
         */
        switchFocus(v){
          if ( this.focused ){
            if ( v ){
              if ( this.focusable && this.focusable.focus ){
                this.focusable.focus();
              }
            }
            else if ( this.prevFocused && this.prevFocused.focus ){
              this.prevFocused.focus();
            }
          }
        },
        changeVisible(v) {
          if ( v ){
            if ( !this.hasBeenOpened ){
              this.hasBeenOpened = true;
            }
            if ( bbn.env.focused && (bbn.env.focused !== this.prevFocused) ){
              this.prevFocused = bbn.env.focused;
            }
          }
          /*
          if ( this.onResize !== undefined ){
            if ( v ){
              this.onResize();
            }
            else{
              this.isResized = false;
            }
          }
          */
          this.switchFocus(v);
        }
      },
      /**
       * If not defined, defines the focusable element.
       * @event mounted
       * @memberof focusComponent
       */
      mounted(){
        this.$nextTick(() => {
          if ( !this.focusable ){
            this.focusable = this.$el;
          }
          if ( this.currentVisible && this.focused ){
            this.switchFocus(true);
          }
        });
      },
      /**
       * Returns the focus on the previously focused element.
       * @event beforeDestroy
       * @memberof focusComponent
       */
      beforeDestroy(){
        if (!bbn.fn.isMobile()) {
          this.switchFocus(false);
        }
      },
      watch: {
        /**
         * Emits the event 'open' or 'close'
         * @watch currentVisible
         * @param {Boolean} v 
         * @emits open
         * @emits close
         * @fires switchFocus
         * @memberof toggleComponent
         */
        currentVisible: {
          handler(v) {
            this.$emit(v ? 'show' : 'hide');
            this.changeVisible(v);
          },
          immediate: true
        }
      }
    }
  });
})(bbn);