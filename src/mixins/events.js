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
         * @memberof eventsComponent
         * @prop {Number} [1000] touchHoldTolerance
         */
        touchHoldTolerance: {
          type: Number,
          default: 1000
        },
        /**
         * @memberof eventsComponent
         * @prop {Number} [10] touchTapTolerance
         */
        touchTapTolerance: {
          type: Number,
          default: 10
        },
        /**
         * @memberof eventsComponent
         * @prop {Number} [30] touchSwipeolerance
         */
        touchSwipeTolerance: {
          type: Number,
          default: 30
        }
      },
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
          isFocused: false,
          /**
           * @memberof eventsComponent
           * @data {Boolean|Event} [false] touchStarted
           */
          touchStarted: false,
          /**
           * @memberof eventsComponent
           * @data {Boolean|Event} [false] touchMoved
           */
          touchMoved: false,
          /**
           * @memberof eventsComponent
           * @data {Number} [0] touchHoldTimer
           */
          touchHoldTimer: 0
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
         touchstart(ev){
          this.isTouched = true;
          this.touchStarted = ev;
          clearTimeout(this.touchHoldTimer);
          this.touchHoldTimer = setTimeout(() => {
            if ( this.isTouched ){
              let event = new Event('contextmenu');
              this.$el.dispatchEvent(event);
              this.isTouched = false;
            }
          }, this.touchHoldTolerance);
        },
        /**
         * Sets the prop isTouched to false.
         * @method touchmove
         * @memberof eventsComponent
         */
        touchmove(ev){
          this.isTouched = false;
          clearTimeout(this.touchHoldTimer);
          if ((Math.abs(this.touchStarted.touches[0].clientX - ev.touches[0].clientX) > this.touchTapTolerance)
            || (Math.abs(this.touchStarted.touches[0].clientY - ev.touches[0].clientY) > this.touchTapTolerance)
          ) {
            this.touchMoved = ev;
          }
        },
        /**
         * Sets the prop isTouched to false.
         * @method touchend
         * @memberof eventsComponent
         */
        touchend(ev){
          if (this.touchStarted && this.touchMoved) {
            let direction = false,
                diffY = Math.abs(this.touchStarted.touches[0].clientY - this.touchMoved.touches[0].clientY),
                diffX = Math.abs(this.touchStarted.touches[0].clientX - this.touchMoved.touches[0].clientX),
                axisX = diffX > diffY;
            if (axisX && (diffX > this.touchSwipeTolerance)) {
              direction = this.touchStarted.touches[0].clientX > this.touchMoved.touches[0].clientX ? 'left' : 'right';
            }
            else if (!axisX && (diffY > this.touchSwipeTolerance)) {
              direction = this.touchStarted.touches[0].clientY > this.touchMoved.touches[0].clientY ? 'top' : 'bottom';
            }
            if (!!direction) {
              this.$emit('swipe', ev, this)
              this.$emit('swipe' + direction, ev, this)
            }
          }
          this.isTouched = false;
          this.touchMoved = false;
          this.touchStarted = false;
        },
        /**
         * Sets the prop isTouched to false.
         * @method touchcancel
         * @memberof eventsComponent
         */
        touchcancel(){
          clearTimeout(this.touchHoldTimer);
          this.isTouched = false;
          this.touchStarted = false;
          this.touchMoved = false;
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