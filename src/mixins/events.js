((bbn) => {
  "use strict";
  bbn.fn.autoExtend("vue", {
    /**
     * eventsComponent
     * @component eventsComponent
     */
    eventsComponent: {
      data(){
        return {
          /**
           * Defines if the component has been changed since its mount.
           * @memberof eventsComponent
           * @data {Boolean} [false] isTouched
           */
          isTouched: false,
          /**
           * True if the component is focused.
           * @memberof eventsComponent
           * @data {Boolean} [false] isFocused
           */
          isFocused: false
        }
      },
      methods: {
        /**
         * Emits the click event.
         * @method click
         * @param {Event} e 
         * @emit click
         * @memberof eventsComponent
         */
        click(e){
          this.$emit('click', e)
        },
        /**
         * Emits the blur event.
         * @method blur
         * @param {Event} e
         * @emit blur
         * @memberof eventsComponent
         */
        blur(e){
          this.isFocused = false;
          this.$emit('blur', e)
        },
        /**
         * Emits the event focus
         * @method focus
         * @param {Event} e
         * @return {Function}
         * @memberof basicComponent
         */
        focus(e){
          let ele = this.getRef('element');
          if ( ele && !this.isFocused ){
            ele.focus();
            this.isFocused = true;
          }
          this.$emit('focus', e);
        },
        /**
         * Emits the keyup event.
         * @method keyup
         * @param {Event} e
         * @memberof eventsComponent
         * @emit keyup
         */
        keyup(e){
          this.$emit('keyup', e)
        },
        /**
         * Emits the keydown event.
         * @method keydown
         * @param {Event} e
         * @memberof eventsComponent
         * @emit keydown
         */
        keydown(e){
          this.$emit('keydown', e)
        },
        /**
         * Emits the over event.
         * @method over
         * @param {Event} e
         * @memberof eventsComponent
         * @emit over
         */
        over(e){
          this.$emit('over', e);
          setTimeout(() => {
            this.$emit('hover', true, e);
          }, 0)
        },
        /**
         * Emits the out event.
         * @method out
         * @param {Event} e
         * @emit out
         * @memberof eventsComponent
         * @emit over
         */
        out(e){
          this.$emit('out', e);
          setTimeout(() => {
            this.$emit('hover', false, e);
          }, 0)
        },
        /**
         * Sets the prop isTouched to true
         * @method touchstart
         * @memberof eventsComponent
         */
        touchstart(){
          this.isTouched = true;
          setTimeout(() => {
            if ( this.isTouched ){
              let event = new Event('contextmenu');
              this.$el.dispatchEvent(event);
              this.isTouched = false;
            }
          }, 1000)
        },
        /**
         * Sets the prop isTouched to false.
         * @method touchmove
         * @memberof eventsComponent
         */
        touchmove(){
          this.isTouched = false;
        },
        /**
         * Sets the prop isTouched to false.
         * @method touchend
         * @memberof eventsComponent
         */
        touchend(){
          this.isTouched = false;
        },
        /**
         * Sets the prop isTouched to false.
         * @method touchcancel
         * @memberof eventsComponent
         */
        touchcancel(){
          this.isTouched = false;
        }
      },
      /**
       * Adds the class 'bbn-events-component' to the component.
       * @event created
       * @memberof eventsComponent
       */
      created(){
        this.componentClass.push('bbn-events-component');
      },
    }
  });
})(bbn);