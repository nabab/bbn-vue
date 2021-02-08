((bbn) => {
  "use strict";
  bbn.fn.autoExtend("vue", {
    /**
     * These components will emit a resize event when their closest parent of the same kind gets really resized.
     * @component resizerComponent
     */
    resizerComponent: {
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
           * @data {Boolean} [false] onParentResizerEmit
           * @memberof resizerComponent
           */
          onParentResizerEmit: false,
          /**
           * The listener on the closest resizer parent.
           * @data {Number} [null] resizeTimeout
           * @memberof resizerComponent
           */
          resizeTimeout: null,
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
          isResizing: false,
          /**
           * The live computedStyle object for the element.
           * @data {Object} [null] computedStyle
           * @memberof resizerComponent
           */
          computedStyle: null
        };
      },
      methods: {
        /**
         * A function that can be executed just before the resize event is emitted.
         * @method onResize
         * @emit resize
         * @memberof resizerComponent
         */
        onResize(){
          //bbn.fn.log("DEFAULT ONRESIZE FN FROM " + this.$options.name);
          return new Promise(resolve => {
            if (!this.isResizing) {
              this.isResizing = true;
              this.$nextTick(() => {
                if (this.$el.offsetHeight) {
                  // Setting initial dimensions
                  let ms1 = this.setResizeMeasures();
                  let ms2 = this.setContainerMeasures();
                  if (ms1 || ms2) {
                    if (!this.ready) {
                      setTimeout(() => {
                        bbn.fn.log("DEFAUT ONRESIZE ON TIMEOUT");
                        this.onResize();
                      }, 100)
                    }
                    else {
                      this.$emit('resize');
                    }
                  }
                }
                this.isResizing = false;
                resolve();
              })
            }
            else {
              resolve();
            }
          });
        },
        /**
         * Sets the value of lastKnownHeight and lastKnownWidth basing on the current dimensions of width and height.
         * @method setResizeMeasures 
         * @returns {Boolean}
         */
        setResizeMeasures(){
          let h = this.$el ? Math.round(this.$el.clientHeight) : 0;
          let w = this.$el ? Math.round(this.$el.clientWidth) : 0;
          if (h && w) {
            this.setComputedStyle();
          }
          let resize = false;
          if (this.lastKnownHeight !== h) {
            this.lastKnownHeight = h;
            resize = true;
          }
          if (this.lastKnownWidth !== w) {
            this.lastKnownWidth = w;
            resize = true;
          }
          return resize;
        },
        setContainerMeasures() {
          let resize = false;
          let isAbsolute = this.computedStyle ? ['absolute', 'fixed'].includes(this.computedStyle.position) : false;
          let offsetParent = this.$el.offsetParent;
          let ctH;
          let ctW;
          if (this.parentResizer) {
            ctH = this.parentResizer.lastKnownHeight;
            ctW = this.parentResizer.lastKnownWidth;
          }
          else if (offsetParent) {
            ctH = isAbsolute ? bbn.fn.outerHeight(offsetParent) : Math.round(offsetParent.clientHeight);
            ctW = isAbsolute ? bbn.fn.outerWidth(offsetParent) : Math.round(offsetParent.clientWidth);
          }
          else {
            ctH = bbn.env.height;
            ctW = bbn.env.width;
          }
          if (this.lastKnownCtHeight !== ctH) {
            this.lastKnownCtHeight = ctH;
            resize = true;
          }
          if (this.lastKnownCtWidth !== ctW) {
            this.lastKnownCtWidth = ctW;
            resize = true;
          }
          return resize;
        },
        getParentResizer(){
          let parentResizer = this.closest(".bbn-resize-emitter");
          // In case we have 2 comnponents in one
          while (parentResizer && (parentResizer.onResize === undefined)) {
            parentResizer = parentResizer.$parent;
          }
          return parentResizer.onResize !== undefined ? parentResizer : false;
        },
        /**
         * Defines the resize emitter and launches process when it resizes.
         * @method setResizeEvent
         * @fires onParentResizerEmit
         * @memberof resizerComponent
         */
        setResizeEvent(){
          // Clearing the timeout used in the listener
          if (this.resizerTimeout) {
            clearTimeout(this.resizerTimeout);
          }
          this.setComputedStyle();
          this.parentResizer = this.getParentResizer();

          // Setting initial dimensions
          //this.setContainerMeasures();
          // Creating the callback function which will be used in the timeout in the listener
          this.onParentResizerEmit = () => {
            // Removing previous timeout
            if (this.resizerTimeout) {
              clearTimeout(this.resizerTimeout);
            }
              // Creating a new one
            this.resizerTimeout = setTimeout(() => {
              if (this.$el.parentNode && this.$el.offsetWidth) {
                // Checking if the parent hasn't changed (case where the child is mounted before)
                let tmp = this.getParentResizer();
                if ( tmp !== this.parentResizer ){
                  // In that case we reset
                  this.unsetResizeEvent();
                  this.setResizeEvent();
                  return;
                }
              }
              //bbn.fn.log("ON PARENT RESIZER EMIT");
              this.onResize();
            }, 50);
          };

          if ( this.parentResizer ){
            this.parentResizer.$off("resize", this.onParentResizerEmit);
            this.parentResizer.$on("resize", this.onParentResizerEmit);
          }
          else{
            window.removeEventListener("resize", this.onParentResizerEmit);
            window.addEventListener("resize", this.onParentResizerEmit);
          }
          this.onParentResizerEmit();
        },
        /**
         * Unsets the resize emitter.
         * @method unsetResizeEvent
         * @memberof resizerComponent
         */
        unsetResizeEvent(){
          if ( this.onParentResizerEmit ){
            if ( this.parentResizer ){
              //bbn.fn.log("UNSETTING EVENT FOR PARENT", this.$el, this.parentResizer);
              this.parentResizer.$off("resize", this.onParentResizerEmit);
            }
            else{
              //bbn.fn.log("UNSETTING EVENT FOR WINDOW", this.$el);
              window.removeEventListener("resize", this.onParentResizerEmit);
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
          /*
          if ( this.parentResizer ){
            this.parentResizer.$emit("resize", force);
          }
          */
        },
        formatSize: bbn.fn.formatSize,
        setComputedStyle(){
          if (!this.computedStyle && this.$el && this.$el.clienttWidth) {
            this.computedStyle = window.getComputedStyle(this.$el);
          }
        }
      },
      /**
       * Adds the class 'bbn-resizer-component' to the component.
       * @event created
       * @memberof resizerComponent
       */
      created(){
        this.componentClass.push('bbn-resizer-component');
      },
      /**
       * Defines the resize emitter and emits the event ready.
       * @event mounted
       * @fires setResizeEvent
       * @emits ready
       * @memberof resizerComponent
       */
      mounted() {
        if (!this.ready) {
          this.$on('ready', this.setResizeEvent);
        }
        else {
          this.setResizeEvent();
        }
      },
      /**
       * Unsets the resize emitter.
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
