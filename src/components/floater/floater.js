/**
 * @file bbn-floater component
 *
 * @description bbn-floater is a component that represents a container that can be positioned as desired and it's possible to bound it to another element.
 *
 * @author BBN Solutions
 *
 * @copyright BBN Solutions
 */
(function(Vue, bbn){
  "use strict";
  /**
   * Classic input with normalized appearance
   */
  let isClicked = false;
  Vue.component('bbn-floater', {
    mixins: [bbn.vue.basicComponent, bbn.vue.resizerComponent, bbn.vue.sourceArrayComponent, bbn.vue.keepCoolComponent],
    props: {
      /**
       * @prop container
       * 
       */
      container: {},
      /**
       * The max width of the floater
       * @prop {Number} maxWidth
       */
      maxWidth: {
        type: Number
      },
      /**
       * The max height of the floater
       * @prop {Number} maxHeight
       */
      maxHeight: {
        type: Number
      },
      /**
       * The min width of the floater
       * @prop {Number} minWidth
       */
      minWidth: {
        type: Number
      },
      /**
       * The min height of the floater
       * @prop {Number} maxHeight
       */
      minHeight: {
        type: Number
      },
      /**
       * The width of the floater
       * @prop {String|Number|Boolean} width
       */
      width: {
        type: [String, Number, Boolean]
      },
      /**
       * The height of the floater
       * @prop {String|Number|Boolean} height
       */
      height: {
        type: [String, Number, Boolean]
      },
      /**
       * The position left
       * @prop {Number} left
       */
      left: {
        type: Number
      },
      /**
       * The position right
       * @prop {Number} right
       */
      right: {
        type: Number
      },
      /**
       * The position top
       * @prop {Number} top
       */
      top: {
        type: Number
      },
      /**
       * The position bottom
       * @prop {Number} bottom
       */
      bottom: {
        type: Number
      },
      /**
       * The source of the floater
       * @prop {Function|Array|String|Object} source
       */
      source: {
        type: [Function, Array, String, Object]
      },
      /**
       * The customized component to use in the floater
       * @prop {Object|String} component
       */
      component: {
        type: [Object, String]
      },
      /**
       * The html content of the floater
       * @prop {String} [''] content
       */
      content: {
        type: String,
        default: ''
      },
      //@todo not used
      options: {
        type: Object
      },
      /**
       * The element to use in the render of the floater
       * @prop {Element} element
       */
      element: {
        type: Element
      },
      /**
       * The orientation
       * @prop {String} ['vertical'] orientation
       */
      orientation: {
        type: String,
        default: 'vertical'
      },
      // @todo not used
      hpos: {
        type: String,
        default: 'left'
      },
      // @todo not used
      vpos: {
        type: String,
        default: 'bottom'
      },
      /**
       * Defines the ability of the floater to be scrollable
       * @prop {Boolean}  [false] scrollable
       */
      scrollable: {
        type: Boolean,
        default: false
      },
      /**
       * Set to true shows the floater
       * @prop {Boolean} [true] visible
       */
      visible: {
        type: Boolean,
        default: true
      },
      //@todo not used
      unique: {
        type: Boolean,
        default: false
      },
      /**
       * The mode of the component 
       * @prop {String} ['free'] mode
       */
      mode: {
        type: String,
        default: "free"
      },
      //@todo not used
      parent: {
        default: false
      },
      //@todo not used
      noIcon: {
        default: false
      },
      /**
       * The hierarchy level, root is 0, and for each generation 1 is added to the level
       * @prop {Number} [0] level
       */
      level: {
        type: Number,
        default: 0
      },
      /**
       * The component used for items
       * @prop {Object} [{}] itemComponent
       */
      itemComponent: {},
      /**
       * Set to true auto hide the component 
       * @prop {Boolean} [false] autoHide
       */
      autoHide: {
        type: Boolean,
        default: false
      },
      /**
       * The name of the array containings tree's children
       * @prop {String} ['items'] children
       */
      children: {
        type: String,
        default: 'items'
      },
      /**
       * The title in the header of the floater
       * @psop {String} title
       */
      title: {
        type: String
      },
      /**
       * The footer of the floater
       * @psop {String} footer
       */
      footer: {
        type: String
      },
      /**
       * The buttons in the footer
       * @psop {Array} buttons
       */
      buttons: {
        type: Array,
        default(){
          return [];
        }
      },
      /**
       * Set to true shows the icon that allows to close the floater
       * @prop {Boolean} [false] closable
       */
      closable: {
        type: Boolean,
        default: false
      },
      /**
       * Set to true shows the icon that allows to maximize the window
       * @prop {Boolean} [false] maximizable
       */
      maximizable: {
        type: Boolean,
        default: false
      },
      /**
       * If set to true opens and closes with opacity aimation
       * @prop {Boolean} [false] maximizable
       */
      animation: {
        type: Boolean,
        default: false
      }
    },
    data(){
      return {
        /**
         * @data [null] _scroller
         */
        _scroller: null,
        /**
         * @data {Number} [0] currentIndex
         */
        currentIndex: 0,
        /**
         * @data [null] currentTop
         */
        currentTop: null,
        /**
         * @data [null] currentLeft
         */
        currentLeft: null,
        /**
         * @data [null] currentHeight
         */
        currentHeight: null,
        /**
         * @data [null] currentWidth
         */
        currentWidth: null,
        /**
         * @data {Boolean} [false] currentScroll
         */
        currentScroll: false,
        /**
         * @data {Boolean} currentVisible
         */
        currentVisible: this.visible,
        /**
         * @data {Number} [0] currentWidth
         */
        containerWidth: 0,
        /**
         * @data {Number} [0] currentHeight
         */
        containerHeight: 0,
        /**
         * @data {Boolean} focused
         */
        focused: bbn.env.focused || null,
        /**
         * @data {Number} [0] opacity
         */
        opacity: 0,
        /**
         * @data {Number} [0] floaterHeight
         */
        floaterHeight: 0,
        /**
         * @data {Number} [0] floaterWidth
         */
        floaterWidth: 0,
        /**
         * @data {Boolean} [false] hasIcon
         */
        hasIcons: false,
        /**
         * @data {Number} [-1] currentSelected
         */
        currentSelected: -1,
        /**
         * @data {Boolean} [false] isMaximized
         */
        isMaximized: false,
        scrollMaxHeight: 0,
        scrollMinWidth: 0,
        currentButtons: this.buttons.slice(),
        mountedComponents: []
      };
    },
    computed: {
      /**
       * Processes the prop width to define the correct misure unite
       * @computed formattedWidth
       * @return {String}
       */
      formattedWidth(){
        if ( this.isMaximized ){
          return '100%';
        }
        if ( this.width ){
          return this.width + (bbn.fn.isNumber(this.width) ? 'px' : '')
        }
        return this.currentWidth ? this.currentWidth + 'px' : '100%';
      },
      /**
       * Processes the prop height to define the correct misure unite
       * @computed formattedHeight
       * @return {String}
       */
      formattedHeight(){
        if ( this.isMaximized ){
          return '100%';
        }
        if ( this.height ){
          return this.height + (bbn.fn.isNumber(this.height) ? 'px' : '')
        }
        return this.currentHeight ? this.currentHeight + 'px' : '100%';
      },
      currentStyle(){
        let s = {
          left: this.isMaximized ? 0 : this.currentLeft,
          top: this.isMaximized ? 0 : this.currentTop,
          width: this.isMaximized ? '100%' : (this.width ? this.formattedWidth : 'auto'),
          height: this.formattedHeight,
          opacity: this.opacity,
          overflow: 'hidden'
        };
        if ( this.animation ){
          s.transition = 'opacity 0.3s ease-in-out';
        }
        if ( this.maxWidth ){
          s.maxWidth = this.maxWidth + (bbn.fn.isNumber(this.maxWidth) ? 'px' : '')
        }
        if ( this.maxHeight ){
          s.maxHeight = this.maxHeight + (bbn.fn.isNumber(this.maxHeight) ? 'px' : '')
        }
        return s;
      }
    },
    methods: {
      /**
       * Defines the position of the floater
       * @method _getCoordinates
       * @return {Object}
       */
      _getCoordinates(){
        if ( this.element ){
          let coor = this.element.getBoundingClientRect(),
              isHorizontal = this.orientation === 'horizontal';
          /*
          if ( !this._scroller ){
            let scroll = bbn.fn.getScrollParent(this.$el);
            if ( scroll ){
              this._scroller = scroll;
              this._scroller.addEventListener('scroll', this.onResize);
            }
          }
          */
          return {
            top: isHorizontal ? coor.top : coor.bottom,
            bottom: this.containerHeight - (isHorizontal ? coor.bottom : coor.top),
            left: isHorizontal ? coor.right : coor.left,
            right: this.containerWidth - (isHorizontal ? coor.left : coor.right)
          };
        }
        else{
          return {
            top: this.top || null,
            right: this.right || null,
            bottom: this.bottom || null,
            left: this.left || null
          };
        }
      },
      /**
       * Manages the items' icon
       * @method _updateIconSituation
       */
      _updateIconSituation(){
        let hasIcons = false;
        bbn.fn.each(this.currentData, (a) => {
          if ( a.icon ){
            hasIcons = true;
            return false;
          }
        });
        if ( hasIcons !== this.hasIcons ){
          this.hasIcons = hasIcons;
        }
      },
      /**
       * Defines the position of the container
       * @method getContainerPosition 
       * @return {Object}
       */
      getContainerPosition(){
        let obj = {};
        if ( this.container ){
          obj = (bbn.fn.isObject(this.container) ? this.container : this.$el.parentNode).getBoundingClientRect();
        }
        this.containerWidth = obj.width || bbn.env.width;
        this.containerHeight = obj.height || bbn.env.height;
        return {
          top: obj.top || 0,
          left: obj.left || 0,
          width: this.containerWidth,
          height: this.containerHeight
        };
      },
      /**
       * Defines the height of the container
       * @method getContainerHeight
       * @return {Number}
       */
      getContainerHeight(){
        return this.containerHeight || 'auto';
      },
       /**
       * Defines the width of the container
       * @method getContainerWidth
       * @return {Number}
       */
      getContainerWidth(){
        return this.containerWidth || 'auto';
      },
      /**
       * Shows the floater
       * @method show
       */
      show(){
        this.currentVisible = true;
      },
      /**
       * Hides the floater
       * @method hide
       */
      hide(){
        this.currentVisible = false;
      },
      updateComponents(){
        bbn.fn.each(this.getComponents(), (a) => {
          if ( a.$vnode.componentOptions && a.$vnode.componentOptions.tag ){
            if ( this.mountedComponents.indexOf(a.$vnode.componentOptions.tag) === -1 ){
              this.mountedComponents.push(a.$vnode.componentOptions.tag);
            }
          }
        })
      },
      scrollResize(){
        if ( !this.getRef('scroll').ready ){
          this.onResize();
          this.updateComponents();
        }
        else{
          let nb = this.mountedComponents.length;
          this.updateComponents();
          if ( nb !== this.mountedComponents.length ){
            this.onResize();
          }
        }
      },
      /**
       * Handles the resize of the component
       * @method onResize
       * @fires getContainerPosition
       * @fires _getCoordinates
       */
      onResize(){
        if ( this.currentVisible && this.isMounted ){
            // Resetting
          bbn.fn.log("FLOATER RESIZE " + this._uid);
          this.currentHeight = this.height || null;
          this.currentWidth = this.width || null;
          this.currentScroll = false;

          this.$forceUpdate();
          let scroll = this.getRef('scroll');
          if ( !scroll || (!scroll.naturalHeight && !this.height) || (!scroll.naturalWidth && !this.width) ){
            return new Promise((resolve, reject) => {
              setTimeout(() => {
                resolve();
              }, 1);
            });
          }
          return new Promise((resolve, reject) => {
            let pos = this.getContainerPosition();
            // These are the limits of the space the DIV can occupy
            let ctHeight = pos.height;
            let ctWidth = pos.width;
            let ctTop = pos.top;
            let ctLeft = pos.left;
            let scrollMaxHeight = ctHeight;
            let scrollMinWidth = 0;
            let outHeight = 0;
            if ( this.title ){
              let header = this.getRef('header');
              if ( header ){
                scrollMaxHeight -= header.clientHeight;
                scrollMinWidth += header.clientWidth;
                outHeight += header.clientHeight;
                bbn.fn.log("HEADER", outHeight);
              }
            }
            if ( this.footer ){
              let footer = this.getRef('footer');
              if ( footer ){
                scrollMaxHeight -= footer.clientHeight;
                outHeight += footer.clientHeight;
                if ( footer.clientWidth > scrollMinWidth ){
                  scrollMinWidth = footer.clientWidth;
                }
              }
            }
            if ( this.buttons ){
              let footer = this.getRef('buttons');
              if ( footer ){
                outHeight += footer.clientHeight;
                bbn.fn.log("BUTTONS", outHeight);
                scrollMaxHeight -= footer.clientHeight;
              }
            }
            this.scrollMaxHeight = scrollMaxHeight;
            this.scrollMinWidth = scrollMinWidth;
            let p;
            if ( this.width ){
              this.floaterWidth = this.$el.clientWidth;
            }
            else{
              // The natural container size
              this.floaterWidth = scroll.naturalWidth;
            }
            if ( this.height ){
              this.floaterHeight = this.$el.clientHeight;
            }
            else{
              // The natural container size
              this.floaterHeight = scroll.naturalHeight + outHeight;
            }
            bbn.fn.log(this.$el);
            bbn.fn.log("FLOATER: W -> " + this.floaterWidth + " / H -> " + this.floaterHeight);
            // The coordinates of the target position
            let coor = this._getCoordinates();
            if ( coor ){
              // No scroll by default
              let scrollV = false;
              let scrollH = false;
              // HEIGHT
              let top = null;
              // Natural or defined height
              let height = this.floaterHeight;
              if ( this.minHeight && (this.minHeight > height) ){
                height = this.minHeight;
              }
              if ( this.maxHeight && (this.maxHeight < height) ){
                height = this.maxHeight;
                scrollV = true;
              }
              if ( ctHeight < height ){
                height = ctHeight;
                scrollV = true;
              }
              if ( !coor.top && !coor.bottom ){
                coor.top = coor.bottom = (ctHeight - height) / 2;
              }
              else if ( !coor.top && coor.bottom ){
                coor.top = ctHeight - coor.bottom - height;
              }
              else if ( coor.top && !coor.bottom ){
                coor.bottom = ctHeight - coor.top - height;
              }
              if ( coor.top < ctTop ){
                coor.top = ctTop;
              }
              if ( this.element ){
                if ( coor.top + height > ctHeight ){
                  let isTopBigger = coor.top > coor.bottom;
                  scrollV = true;
                  if ( isTopBigger ){
                    if ( coor.bottom + height > ctHeight ){
                      top = ctTop;
                      height = ctHeight - coor.bottom;
                    }
                    else{
                      top = ctHeight - coor.bottom - height + ctTop;
                    }
                  }
                  else{
                    height = ctHeight - coor.top;
                  }
                }
              }
              else if ( (coor.top + height > ctHeight) || (coor.bottom + height > ctHeight) ){
                if ( this.top ){
                  height = ctHeight - coor.top;
                }
                else{
                  height = ctHeight - coor.bottom;
                  coor.top = 0;
                }
                scrollV = true;
              }
              if ( top === null ){
                if ( coor.top ){
                  top = coor.top + ctTop;
                }
                else if ( scrollV ){
                  top = ctTop;
                }
                else{
                  top = ctHeight - (coor.bottom | 0) - height + ctTop;
                }
              }

              // WIDTH
              let left = null;
              // Natural or defined width
              let width = this.floaterWidth;
              if ( this.minWidth && (this.minWidth > width) ){
                width = this.minWidth;
              }
              if ( this.maxWidth && (this.maxWidth < width) ){
                width = this.maxWidth;
                scrollH = true;
              }
              if ( ctWidth < width ){
                width = ctWidth;
                scrollH = true;
              }
              if ( !coor.left && !coor.right ){
                coor.left = coor.right = (ctWidth - width) / 2;
              }
              else if ( !coor.left && coor.right ){
                coor.left = ctWidth - coor.right - width;
              }
              else if ( coor.left && !coor.right ){
                coor.right = ctWidth - coor.left - width;
              }
              if ( coor.left < ctLeft ){
                coor.left = ctLeft;
              }

              if ( this.element ){
                if ( coor.left + width > ctWidth ){
                  let isLeftBigger = coor.left > coor.right;
                  scrollH = true;
                  if ( isLeftBigger ){
                    if ( coor.right + width > ctWidth ){
                      left = ctLeft;
                      width = ctWidth - coor.right;
                    }
                    else{
                      left = ctWidth - coor.right - width + ctLeft;
                    }
                  }
                  else{
                    width = ctWidth - coor.left;
                  }
                }
              }
              else if ( (coor.left + width > ctWidth) || (coor.right + width > ctWidth) ){
                if ( this.left ){
                  width = ctWidth - coor.left;
                }
                else{
                  width = ctWidth - coor.right;
                  coor.left = 0;
                }
                scrollH = true;
              }
              if ( left === null ){
                if ( coor.left ){
                  left = coor.left + ctLeft;
                }
                else if ( scrollH ){
                  left = ctLeft;
                }
                else{
                  left = ctWidth - coor.right - width + ctLeft;
                }
              }
              if ( height ){
                this.currentLeft = left + 'px';
                this.currentTop = top + 'px';
                this.currentHeight = height;
                this.currentWidth = width;
                this.currentScroll = scrollV || scrollH ? true : false;
                this.$nextTick(() => {
                  this.opacity = 1;
                });
              }
              bbn.fn.log("GOING ALL THE WAY");
            }
          });
        }
      },
      //@todo not used
      pressKey(e){
        bbn.fn.log("KEYPRESS");
        switch ( e.key ){
          case "Enter":
          case "Space":
            this.select(this.currentIndex);
            break;
          case "Escape":
          case "ArrowLeft":
            this.$emit('close');
            break;
          case "ArrowDown":
            if ( this.items.length ){
              if ( this.currentIndex > this.items.length - 2 ){
                this.currentIndex = 0;
              }
              else{
                this.currentIndex++;
              }
            }
            break;
          case "ArrowUp":
            if ( this.items.length ){
              if ( this.currentIndex > 0 ){
                this.currentIndex--;
              }
              else{
                this.currentIndex = this.items.length - 1;
              }
            }
            break;
        }
      },
      /**
       * Close the floater if the prop autoHide is set to true
       * @method blur
       * @fires close
       */
      blur(){
        //this.$emit('blur');
        if ( this.autoHide ){
          this.close();
        }
      },
      over(idx){
      },
      /**
       * Closes the floater by hiding it
       * @method close
       * @param {Event} e 
       */
      close(force){
        let ok = true;
        if ( !force ){
          let beforeCloseEvent = new Event('beforeClose', {cancelable: true});
          if ( this.popup ){
            this.popup.$emit('beforeClose', beforeCloseEvent, this);
          }
          else{
            this.$emit('beforeClose', beforeCloseEvent, this);
          }
          if ( beforeCloseEvent.defaultPrevented ){
            return;
          }
          if ( this.beforeClose && (this.beforeClose(this) === false) ){
            return;
          }
          bbn.fn.each(this.closingFunctions, (a) => {
            a(this, beforeCloseEvent);
          });
        }
        let closeEvent = new Event('close', {cancelable: true});
        this.$el.style.display = 'block';
        this.$nextTick(() => {
          this.$emit("close", this, closeEvent);
          if ( this.afterClose ){
            this.afterClose(this);
          }
        })
      },
      /**
       * Close all levels 
       * @method closeAll
       */
      closeAll(){
        this.currentVisible = false;
        if ( this.level ){
          let ancesters = this.ancesters('bbn-floater');
          for ( let i = this.level; i >= 0; i-- ){
            if ( ancesters[i] ){
              bbn.fn.log(ancesters, i, ancesters[i]);
              ancesters[i].currentVisible = false;
            }
          }
        }
      },
      /**
       * Handles the selection of the floater's items
       * @method select
       * @param {Number} idx 
       * @fires closeAll
       * @emits select
       */
      select(idx){
        let item = this.filteredData[idx];
        bbn.fn.log("SELECT", arguments, this.filteredData[idx]);
        if ( item && !item.disabled && !item[this.children] ){

          if ( this.mode === 'options' ){
            item.selected = !item.selected;
          }
          else if ( (this.mode === 'selection') && !item.selected ){
            let prev = bbn.fn.search(this.filteredData, "selected", true);
            if ( prev > -1 ){
              this.filteredData[prev].selected = false;
            }
            item.selected = true;
          }
          if ( item.command ){
            if ( typeof(item.command) === 'string' ){
              bbn.fn.log("CLICK IS STRING", this);
            }
            else if (bbn.fn.isFunction(item.command) ){
              bbn.fn.log("CLICK IS FUNCTION", item.command, this);
              item.command(idx, item);
            }
          }
          if ( this.mode !== 'options' ){
            this.closeAll();
          }
          this.$emit("select", item);
        }
      }
    },
    /**
     * @event created
     * @fires _updateIconSituation
     */
    created(){
      this.focused = bbn.env.focused;
      this.updateData().then(() => {
        this._updateIconSituation();
      });
    },
    /**
     * @event beforeDestroy
     */
    beforeDestroy(){
      if ( this._scroller ){
        this._scroller.removeEventListener('scroll', this.resize);
      }
    },
    /**
     * @event mounted
     */
    mounted(){
      this.ready = true;
    },
    watch: {
      /**
       * @watch source
       */
      source: {
        deep: true,
        handler(){
          this.updateData().then(() => {
            this._updateIconSituation();
          });
        }
      },
      /**
       * @watch element
       * @param {Element} newVal
       * @fires onResize 
       */
      element(newVal){
        if ( newVal ){
          this.currentVisible = false;

          this.$nextTick(() => {
            this.currentVisible = true;
            bbn.fn.log("RESIZING FLOATER");
            this.onResize();
          })
        }
      },
      /**
       * @watch currentVisible
       * @param {Boolean} newVal 
       * @emits open
       * @emits close@fires onResize
       */
      currentVisible(newVal){
        this.$emit(newVal ? 'open' : 'close');
        if ( newVal ){
          this.onResize();
        }
        else{
          this.opacity = 0;
        }
      }
    }

  });

})(window.Vue, window.bbn);
