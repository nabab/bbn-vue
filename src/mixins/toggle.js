((bbn) => {
  "use strict";
  bbn.fn.autoExtend("vue", {
    toggleComponent: {
      props: {
        visible: {
          type: Boolean,
          default: true
        },
        focused: {
          type: Boolean,
          default: true
        }
      },
      data(){
        return {
          /**
           * @data {Element} prevFocused
           * @memberof toggleComponent
           */
          prevFocused: bbn.env.focused,
          currentVisible: this.visible,
          focusable: null,
          hasBeenOpened: false
        };
      },
      methods: {
        show(){
          this.currentVisible = true;
        },
        hide(){
          this.currentVisible = false;
        },
        toggle(){
          this.currentVisible = !this.currentVisible;
        },
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
        }
      },
      /**
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
       * @event beforeDestroy
       * @memberof focusComponent
       */
      beforeDestroy(){
        if (!bbn.fn.isMobile()) {
          this.switchFocus(false);
        }
      },
      watch: {
        currentVisible(v){
          if ( v ){
            if ( !this.hasBeenOpened ){
              this.hasBeenOpened = true;
            }
            if ( bbn.env.focused && (bbn.env.focused !== this.prevFocused) ){
              this.prevFocused = bbn.env.focused;
            }
          }
          this.$emit(v ? 'open' : 'close');
          if ( this.onResize !== undefined ){
            if ( v ){
              this.onResize();
            }
            else{
              this.isResized = false;
            }
          }
          this.switchFocus(v);
        }
      }
    }
  });
})(bbn);