((bbn) => {
  "use strict";
  bbn.fn.autoExtend("vue", {
    /**
     * eventsComponent
     * @component eventsComponent
     */
    eventsComponent: {
      props: {
        /**
         * The classes added to the component.
         * @memberof eventsComponent
         * @prop {Array} [[]] componentClass 
         */
        componentClass: {
          type: Array,
          default(){
            return [];
          }
        }
      },
      data(){
        return {
          /**
           * @memberof eventsComponent
           * @data {Boolean} [false] isTouched
           */
          isTouched: false,
          isFocused: false
        }
      },
      methods: {
        /**
         * Emits the click event.
         * @method click
         * @param e 
         * @emit click
         * @memberof eventsComponent
         */
        click(e){
          this.$emit('click', e)
        },
        /**
         * Emits the blur event.
         * @method blur
         * @param e
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
         * @param e
         * @memberof eventsComponent
         * @emit keyup
         */
        keyup(e){
          this.$emit('keyup', e)
        },
        /**
         * Emits the keydown event.
         * @method keydown
         * @param e
         * @memberof eventsComponent
         * @emit keydown
         */
        keydown(e){
          this.$emit('keydown', e)
        },
        /**
         * Emits the over event.
         * @method over
         * @param e
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
         * @param e
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
         * @param e 
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
         * @param e 
         */
        touchmove(){
          this.isTouched = false;
        },
        /**
         * Sets the prop isTouched to false.
         * @method touchend
         * @param e 
         * @memberof eventsComponent
         */
        touchend(){
          this.isTouched = false;
        },
        /**
         * Sets the prop isTouched to false.
         * @method touchcancel
         * @param e 
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