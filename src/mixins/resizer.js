((bbn) => {
  "use strict";
  bbn.fn.autoExtend("vue", {
    /**
     * These components will emit a resize event when their closest parent of the same kind gets really resized.
     * @component resizerComponent
     */
    resizerComponent: {
      props: {
        /**
         * The classes added to the component.
         * @prop {Array} componentClass
         * @memberof resizerComponent
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
           * The closest resizer parent.
           * @data {Boolean} [false] parentResizer
           * @memberof resizerComponent
           */
          parentResizer: false,
          /**
           * The listener on the closest resizer parent.
           * @data {Boolean} [false] resizeEmitter
           * @memberof resizerComponent
           */
          resizeEmitter: false,
          /**
           * The height.
           * @data {Boolean} [false] lastKnownHeight
           * @memberof resizerComponent
           */
          lastKnownHeight: false,
          /**
           * The width.
           * @data {Boolean} [false] lastKnownWidth
           * @memberof resizerComponent
           */
          lastKnownWidth: false,
          /**
           * The container height.
           * @data {Boolean} [false] lastKnownCtHeight
           * @memberof resizerComponent
           */
          lastKnownCtHeight: false,
          /**
           * The container width.
           * @data {Boolean} [false] lastKnownCtWidth
           * @memberof resizerComponent
           */
          lastKnownCtWidth: false,
          /**
           * Should be set to true during the resize execution.
           * @data {Boolean} [false] isResizing
           * @memberof resizerComponent
           */
          isResizing: false
        };
      },
      methods: {
        /**
         * A function that can be executed just before the resize event is emitted.
         * @method onResize
         * @memberof resizerComponent
         */
        onResize(){
          return;
        },
        setResizeMeasures(){
          let resize = false;
          let h = this.$el ? Math.round(this.$el.clientHeight) : 0;
          let w = this.$el ? Math.round(this.$el.clientWidth) : 0;
          let offsetParent = this.$el.parentNode;
          let ctH = (this.parentResizer && offsetParent) ? Math.round(offsetParent.clientHeight) : bbn.env.height;
          let ctW = (this.parentResizer && offsetParent) ? Math.round(offsetParent.clientWidth) : bbn.env.width;
          if ( h && (this.lastKnownHeight !== h) ){
            this.lastKnownHeight = h;
            resize = true;
          }
          if ( w && (this.lastKnownWidth !== w) ){
            this.lastKnownWidth = w;
            resize = true;
          }
          if ( ctH && (this.lastKnownCtHeight !== ctH) ){
            this.lastKnownCtHeight = ctH;
            resize = true;
          }
          if ( ctW && (this.lastKnownCtWidth !== ctW) ){
            this.lastKnownCtWidth = ctW;
            resize = true;
          }
          return resize;
        },
        /**
         * Defines the resize emitter and emits the event resize.
         * @method setResizeEvent
         * @emit resize
         * @fires resizeEmitter
         * @memberof resizerComponent
         */
        setResizeEvent(){
          // The timeout used in the listener
          let resizeTimeout;
          // This class will allow to recognize the element to listen to
          this.parentResizer = this.closest(".bbn-resize-emitter", true);
          // Setting initial dimensions
          this.setResizeMeasures();
          // Creating the callback function which will be used in the timeout in the listener
          this.resizeEmitter = () => {
            // Removing previous timeout
            clearTimeout(resizeTimeout);
            // Creating a new one
            resizeTimeout = setTimeout(() => {
              if ( this.$el.parentNode ){
                if ( this.$el.offsetWidth !== 0 ){
                  // Checking if the parent hasn't changed (case where the child is mounted before)
                  let tmp = this.closest(".bbn-resize-emitter", true);
                  if ( tmp !== this.parentResizer ){
                    // In that case we reset
                    this.unsetResizeEvent();
                    this.setResizeEvent();
                    return;
                  }
                  if (this.setResizeMeasures()) {
                    this.onResize();
                    this.$emit("resize");
                    this.$nextTick(() => {
                      this.setResizeMeasures();
                    });
                  }
                }
              }
            }, 0);
          };
          if ( this.parentResizer ){
            this.parentResizer.$on("resize", this.resizeEmitter);
          }
          else{
            window.addEventListener("resize", this.resizeEmitter);
          }
          this.resizeEmitter();
        },
        /**
         * Unsets the resize emitter.
         * @method unsetResizeEvent
         * @memberof resizerComponent
         */
        unsetResizeEvent(){
          if ( this.resizeEmitter ){
            if ( this.parentResizer ){
              //bbn.fn.log("UNSETTING EVENT FOR PARENT", this.$el, this.parentResizer);
              this.parentResizer.$off("resize", this.resizeEmitter);
            }
            else{
              //bbn.fn.log("UNSETTING EVENT FOR WINDOW", this.$el);
              window.removeEventListener("resize", this.resizeEmitter);
            }
          }
        },
        /**
         * Emits the event resize on the closest parent resizer.
         * @method selfEmit
         * @memberof resizerComponent
         * @param {Boolean} force 
         */  
        selfEmit(force){
          if ( this.parentResizer ){
            this.parentResizer.$emit("resize", force);
          }
        },
        cssSize(val){
          switch ( typeof val ){
            case 'string':
              return val;
            case 'number':
              return val + 'px';
            default:
              return 'auto';
          }
        }
      },
      /**
       * Adds the class 'bbn-resizer-component' to the component.
       * @event created
       * @memberof resizerComponent
       */
      created(){
        this.componentClass.push('bbn-resizer-component', 'bbn-resize-emitter');
      },
      /**
       * @event mounted
       * @fires setResizeEvent
       * @memberof resizerComponent
       */
      mounted(){
        this.setResizeEvent();
        this.$on('ready', this.setResizeEvent);
      },
      /**
       * @event beforeDestroy
       * @fires unsetResizeEvent
       * @memberof resizerComponent
       */
      beforeDestroy(){
        this.unsetResizeEvent();
      }
    }
  });
})(bbn);