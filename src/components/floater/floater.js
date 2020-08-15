/**
 * @file bbn-floater component
 *
 * @description bbn-floater is a component that represents a container that can be bound to another element.
 *
 * @author BBN Solutions
 *
 * @copyright BBN Solutions
 */
(function (Vue, bbn) {
  "use strict";
  /**
   * Classic input with normalized appearance
   */
  let isClicked = false;
  //bbn.vue.preloadBBN(['scroll', 'list', 'button']);
  Vue.component('bbn-floater', {
    name: 'bbn-floater',
    /**
     * @mixin bbn.vue.basicComponent
     * @mixin bbn.vue.listComponent
     * @mixin bbn.vue.resizerComponent
     * @mixin bbn.vue.keepCoolComponent
     * @mixin bbn.vue.toggleComponent
     * @mixin bbn.vue.dimensionsComponent
     * @mixin bbn.vue.positionComponent
     */
    mixins: [
      bbn.vue.basicComponent,
      bbn.vue.listComponent,
      bbn.vue.resizerComponent,
      bbn.vue.keepCoolComponent,
      bbn.vue.toggleComponent,
      bbn.vue.dimensionsComponent,
      bbn.vue.positionComponent
    ],
    props: {
      /**
       * @prop container
       */
      container: {},
      /**
       * The html content of the floater.
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
       * The element used in the render of the floater.
       * @prop {Element} element
       */
      element: {
        type: Element
      },
      /**
       * If set to true the minimum width will be equal to the element width
       * @prop {Boolean} [true] elementWidth
       */
      elementWidth: {
        type: Boolean,
        default: true
      },
      /**
       * The floater's orientation.
       * @prop {String} ['vertical'] orientation
       */
      orientation: {
        type: String,
        default: 'vertical'
      },
      /**
       * Defines the ability of the floater to be scrollable.
       * @prop {Boolean}  [false] scrollable
       */
      scrollable: {
        type: Boolean,
        default: true
      },
      /**
       * Set to true to show the floater.
       * @prop {Boolean} [true] visible
       */
      visible: {
        type: Boolean,
        default: true
      },
      /**
       * The list selection mode.
       * Possible values: 'free', 'options', 'selection'.
       * @prop {String} ['free'] mode
       */
      mode: {
        type: String,
        default: "free",
        validator: m => ['free', 'options', 'selection'].includes(m)
      },
      /**
       * The hierarchical level, root is 0, and for each generation 1 is added to the level.
       * @prop {Number} [0] level
       */
      level: {
        type: Number,
        default: 0
      },
      /**
       * The component used for the items.
       * @prop {Object} [{}] itemComponent
       */
      itemComponent: {},
      /**
       * Set to true to auto-hide the component.
       * @prop {Boolean} [false] autoHide
       */
      autoHide: {
        type: [Number, Boolean],
        default: false
      },
      /**
       * The title of the floater's header.
       * @psop {String} title
       */
      title: {
        type: [Boolean, String]
      },
      /**
       * The footer of the floater.
       * @psop {String} footer
       */
      footer: {
        type: [Function, String, Object]
      },
      /**
       * The buttons in the footer.
       * @psop {Array} buttons
       */
      buttons: {
        type: Array,
        default () {
          return [];
        }
      },
      /**
       * Set to true to show the icon that allows the closing of the floater.
       * @prop {Boolean} [false] closable
       */
      closable: {
        type: Boolean,
        default: false
      },
      /**
       * Set to true to show the icon that allows the maximization of the window.
       * @prop {Boolean} [false] maximizable
       */
      maximizable: {
        type: Boolean,
        default: false
      },
      /**
       * Set to true to open and close the window with opacity animation.
       * @prop {Boolean} [false] maximizable
       */
      animation: {
        type: Boolean,
        default: false
      },
      /**
       * The latency of the floater.
       * @prop {Number} [50] latency
       */
      latency: {
        type: Number,
        default: 100
      },
      /**
       * @prop {Function} onOpen
       */
      onOpen: {
        type: Function
      },
      /**
       * @prop {Function} beforeClose
       */
      beforeClose: {
        type: Function
      },
      /**
       * @prop {Function} onClose
       */
      onClose: {
        type: Function
      },
      /**
       * @prop {Function} afterClose
       */
      afterClose: {
        type: Function
      },
      /**
       * @prop {Number} index
       */
      index: {
        type: Number
      },
      /**
       * @prop {String} uid
       */
      uid: {
        type: String
      },
      /**
       * @prop {Boolean} [false] suggest
       */
      suggest: {
        type: Boolean,
        default: false
      }
    },
    data() {
      let fns = [];
      if ( this.onClose ){
        fns.push(this.onClose);
      }
      return {
        /**
         * @data {Array} [[]] closingFunctions
         */
        closingFunctions: fns,
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
        realHeight: null,
        /**
         * @data [null] currentWidth
         */
        realWidth: null,
        /**
         * @data {Boolean} [false] currentScroll
         */
        scrollWidth: null,
        /**
         * @data {Boolean} [false] currentScroll
         */
        scrollHeight: null,
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
         * @data {Boolean} [false] isMaximized
         */
        isMaximized: false,
        /**
         * @data {Number} [0] scrollMaxHeight
         */
        scrollMaxHeight: 0,
        /**
         * @data {Number} [0] scrollMinWidth
         */
        scrollMinWidth: 0,
        /**
         * @data {Array} [[]] currentButtons
         */
        currentButtons: this.buttons.slice(),
        /**
         * @data {Array} [[]] mountedComponents
         */
        mountedComponents: [],
        /**
         * @data {Boolean} [false] isOver
         */
        isOver: false,
        /**
         * @data {Number|Boolean} [false] mouseLeaveTimeout
         */
        mouseLeaveTimeout: false,
        /**
         * @data {Number|Boolean} [false] scrollResizeTimeout
         */
        scrollResizeTimeout: false,
        /**
         * @data {Boolean} [null] isResizing
         */
        isResizing: null,
        /**
         * @data {Boolean} [false] isResized
         */
        isResized: false,
        /**
         * @data {Boolean} [false] isInit
         */
        isInit: false
      };
    },
    computed: {
      /**
       * Normalizes the property 'left'.
       * @computed formattedLeft
       * @return {String}
       */
      formattedLeft() {
        return this.currentLeft ? bbn.fn.formatSize(this.currentLeft) : 'auto';
      },
      /**
       * Normalizes the property 'top'.
       * @computed formattedTop
       * @return {String}
       */
      formattedTop() {
        return this.currentTop ? bbn.fn.formatSize(this.currentTop) : 'auto';
      },
      /**
       * Normalizes the property 'width'.
       * @computed formattedWidth
       * @return {String}
       */
      formattedWidth() {
        return bbn.fn.formatSize(this.realWidth);
      },
      /**
       * Normalizes the property 'height'.
       * @computed formattedHeight
       * @return {String}
       */
      formattedHeight() {
        return bbn.fn.formatSize(this.realHeight);
      },
      /**
       * An object of css property to apply to the floater.
       * @computed currentStyle
       * @return {Object}
       */
      currentStyle() {
        if (!this.isInit) {
          return {
            top: 'auto',
            left: 'auto',
            width: 'auto',
            height: 'auto',
            opacity: 0
          };
        }
        else if (this.isMaximized) {
          return {
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            opacity: 1

          };
        }
        let s = {
          top: this.formattedTop,
          left: this.formattedLeft,
          width: this.formattedWidth,
          height: this.formattedHeight,
          maxWidth: bbn.fn.formatSize(this.currentMaxWidth),
          minWidth: bbn.fn.formatSize(this.currentMinWidth),
          maxHeight: bbn.fn.formatSize(this.currentMaxHeight),
          minHeight: bbn.fn.formatSize(this.currentMinHeight),
          opacity: 1
        };
        return s;
      },
      /**
       * True if the component is visible.
       * @computed isVisible
       * @return {Boolean}
       */
      isVisible(){
        return !!(this.currentVisible && (
          this.content ||
          this.component ||
          this.filteredData.length ||
          this.$slots.default
        ));
      },
      /**
       * True if the orientation is 'horizontal'.
       * @computed isHorizontal
       * @return {Boolean}
       */
      isHorizontal(){
        return this.orientation === 'horizontal';
      }
    },
    methods: {
      /**
       * @method init
       * @fires getDimensions
       */
      init() {
        let width = null;
        let height = null;
        let minWidth = [0];
        let minHeight = [0];
        let maxWidth = [bbn.env.width];
        let maxHeight = [bbn.env.height];
        let tmp = this.getDimensions(this.width, this.height);
        if (tmp.width) {
          width = tmp.width;
        }
        if (tmp.height) {
          height = tmp.height;
        }
        tmp = this.getDimensions(this.minWidth, this.minHeight);
        if (tmp.width) {
          minWidth.push(tmp.width);
        }
        if (tmp.height) {
          minHeight.push(tmp.height);
        }
        if (this.element && this.elementWidth) {
          tmp = this.element.getBoundingClientRect();
          if (tmp.width) {
            minWidth.push(tmp.width);
          }
        }
        tmp = this.getDimensions(this.maxWidth, this.maxHeight);
        if (tmp.width) {
          maxWidth.push(tmp.width);
        }
        if (tmp.height) {
          maxHeight.push(tmp.height);
        }
        if (this.container) {
          let coord = (bbn.fn.isDom(this.container) ? this.container : this.$el.offsetParent).getBoundingClientRect();
          if (coord.width) {
            maxWidth.push(coord.width);
          }
          if (coord.height) {
            maxHeight.push(coord.height);
          }
        }
        if (this.element) {
          let coord = this.element.getBoundingClientRect();
          if (this.isHorizontal) {
            maxHeight.push(Math.max(coord.y + coord.height, bbn.env.height - coord.y));
          }
          else {
            maxHeight.push(Math.max(coord.y, bbn.env.height - coord.y - coord.height));
          }
        }
        if (this.left) {
          maxWidth.push(Math.max(this.left, bbn.env.height - this.left));
        }
        if (this.right) {
          maxWidth.push(Math.max(this.right, bbn.env.height - this.right));
        }
        if (this.top) {
          maxHeight.push(Math.max(this.top, bbn.env.height - this.top));
        }
        if (this.bottom) {
          maxHeight.push(Math.max(this.bottom, bbn.env.height - this.bottom));
        }
        this.currentWidth = width;
        this.currentHeight = height;
        this.currentMaxWidth = Math.min(...maxWidth);
        this.currentMaxHeight = Math.min(...maxHeight);
        this.currentMinWidth = Math.max(...minWidth);
        this.currentMinHeight = Math.max(...minHeight);
        this.isInit = true;
      },
      /**
       * Defines the position of the floater.
       * @method _getCoordinates
       * @return {Object}
       */
      _getCoordinates() {
        if (this.element) {
          let coor = this.element.getBoundingClientRect(),
            isHorizontal = this.isHorizontal;
          return {
            top: isHorizontal ? coor.top : coor.bottom,
            bottom: this.containerHeight - (isHorizontal ? coor.bottom : coor.top),
            left: isHorizontal ? coor.right : coor.left,
            right: this.containerWidth - (isHorizontal ? coor.left : coor.right)
          };
        } else {
          return {
            top: bbn.fn.isNumber(this.top) ? this.top : null,
            right: bbn.fn.isNumber(this.right) ? this.right : null,
            bottom: bbn.fn.isNumber(this.bottom) ? this.bottom : null,
            left: bbn.fn.isNumber(this.left) ? this.left : null
          };
        }
      },
      /**
       * Manages the icon of the items.
       * @method _updateIconSituation
       */
      _updateIconSituation() {
        let hasIcons = false;
        bbn.fn.each(this.currentData, (a) => {
          if (a.data.icon) {
            hasIcons = true;
            return false;
          }
        });
        if (hasIcons !== this.hasIcons) {
          this.hasIcons = hasIcons;
        }
      },
      /**
       * Defines the position of the container.
       * @method getContainerPosition 
       * @return {Object}
       */
      getContainerPosition() {
        let obj = {};
        if (this.container) {
          obj = (bbn.fn.isDom(this.container) ? this.container : this.$el.offsetParent).getBoundingClientRect();
        }
        return {
          top: 0,
          left: 0,
          width: obj.width || bbn.env.width,
          height: obj.height || bbn.env.height
        };
      },
      /**
       * Shows the floater.
       * @method show
       */
      show() {
        this.currentVisible = true;
      },
      /**
       * Hides the floater.
       * @method hide
       */
      hide() {
        this.currentVisible = false;
      },
      /**
       * @todo not used the method getComponents() doesn't exist
       */
      updateComponents() {
        bbn.fn.each(this.getComponents(), (a) => {
          if (a.$vnode.componentOptions && a.$vnode.componentOptions.tag) {
            if (this.mountedComponents.indexOf(a.$vnode.componentOptions.tag) === -1) {
              this.mountedComponents.push(a.$vnode.componentOptions.tag);
            }
          }
        })
      },
      /**
       * Handles the resize of the scroller.
       * @method scrollResize
       * @fires onResize
       * @fires updateComponents
       */
      scrollResize() {
        if (this.scrollResizeTimeout !== false) {
          clearTimeout(this.scrollResizeTimeout);
        }
        this.scrollResizeTimeout = setTimeout(() => {
          this.scrollResizeTimeout = false;
          let sc = this.getRef('scroll');
          if (!sc || !sc.ready) {
            this.scrollResize();
          }
          else {
            let nb = this.mountedComponents.length;
            this.updateComponents();
            if (nb !== this.mountedComponents.length) {
              sc.initSize();
            }
            else{
              this.onResize();
            }
          }
        }, 10);
      },
      /**
       * @method addClose
       */
      addClose(fn){
        for ( let i = 0; i < arguments.length; i++ ){
          if ( typeof arguments[i] === 'function' ){
            this.closingFunctions.push(arguments[i])
          }
        }
      },
      /**
       * @method removeClose
       */
      removeClose(fn){
        if ( !fn ){
          this.closingFunctions = [];
        }
        else{
          this.closingFunctions = bbn.fn.filter(this.closingFunctions, (f) => {
            return fn !== f;
          })
        }
      },
      /**
       * Handles the resize of the component.
       * @method onResize
       * @param {Boolean} force
       * @fires getContainerPosition
       * @fires _getCoordinates
       * @fires init
       * @fires getRef
       * @fires keepCool
       * @fires setResizeMeasures
       */
      onResize(force) {
        bbn.fn.log("FLOATER ONRESIZE FN")
        // Should be triggered by the inner scroll once mounted
        if (this.isVisible && bbn.fn.isDom(this.$el) && !this.isResizing) {
          if ( !this.ready ){
            this.init();
            this.ready = true;
          }
          this.isResizing = true;
          // Resetting
          let scroll = this.getRef('scroll');
          if (!scroll || !scroll.ready){
            return new Promise((resolve) => {
              setTimeout(() => {
                this.isResizing = false;
                resolve();
              }, 1);
            });
          }
          return this.keepCool(() => {
            let oldWidth = this.realWidth;
            let oldHeight = this.realHeight;
            let oldContainerWidth = this.containerWidth;
            let oldContainerHeight = this.containerHeight;
            let oldScrollWidth = scroll.naturalWidth;
            let oldScrollHeight = scroll.naturalHeight;
            this.realHeight = null;
            this.realWidth = null;
            this.scrollHeight = null;
            this.scrollWidth = null;
            this.currentScroll = false;
            this.$forceUpdate();
            this.$nextTick().then(() => {
              return scroll.getNaturalDimensions()
            }).then(() => {
              if (!scroll.naturalWidth || !scroll.naturalHeight) {
                this.isResizing = false;
                setTimeout(() => {
                  this.onResize(force);
                }, Math.round(this.latency/2))
                return;
              }
              // These are the limits of the space the DIV can occupy
              let pos = this.getContainerPosition();
              this.containerWidth = pos.width;
              this.containerHeight = pos.height;
              if (
                !force &&
                (oldContainerWidth === this.containerWidth) &&
                (oldContainerHeight === this.containerHeight) &&
                (oldScrollWidth === scroll.naturalWidth) &&
                (oldScrollHeight === scroll.naturalHeight)
              ) {
                this.realHeight = oldHeight;
                this.realWidth = oldWidth;
                this.isResizing = false;
                return;
              }
              let outHeight = 0;
              let currentWidth = this.currentWidth || scroll.naturalWidth;
              let currentHeight = this.currentHeight || 0;
              let scrollHeight = currentHeight || scroll.naturalHeight;
              if (this.title) {
                let header = this.getRef('header');
                if (header) {
                  if (header.clientWidth > currentWidth) {
                    currentWidth = header.clientWidth;
                  }
                  outHeight += header.clientHeight;
                }
              }
              if (this.footer) {
                let footer = this.getRef('footer');
                if (footer) {
                  if (footer.clientWidth > currentWidth) {
                    currentWidth = footer.clientWidth;
                  }
                  outHeight += footer.clientHeight;
                }
              }
              if (this.buttons) {
                let footer = this.getRef('buttons');
                if (footer) {
                  if (footer.clientWidth > currentWidth) {
                    currentWidth = footer.clientWidth;
                  }
                  outHeight += footer.clientHeight;
                }
              }
              if ( this.currentMaxHeight < this.currentMinHeight ){
                throw new Error("The calculated max height (" + this.currentMaxHeight + ") is bigger than the calculated min height (" + this.currentMinHeight + ")")
              }
              if ( this.currentMaxWidth < this.currentMinWidth ){
                throw new Error("The calculated max width (" + this.currentMaxWidth + ") is bigger than the calculated min width (" + this.currentMinWidth + ")")
              }
              else{
                if ( !currentHeight ){
                  currentHeight = scrollHeight + outHeight;
                }
                else{
                  scrollHeight = currentHeight - outHeight;
                }
                if ( currentHeight > this.currentMaxHeight ){
                  currentHeight = this.currentMaxHeight;
                }
                if ( currentWidth > this.currentMaxWidth ){
                  currentWidth = this.currentMaxWidth;
                }
                if ( currentHeight < this.currentMinHeight ){
                  currentHeight = this.currentMinHeight;
                }
                if ( currentWidth < this.currentMinWidth ){
                  currentWidth = this.currentMinWidth;
                }
              }
              this.realWidth = currentWidth;
              this.realHeight = currentHeight;
              this.scrollHeight = scrollHeight;
              
              this.$forceUpdate();
              this.$nextTick(() => {
                // The coordinates of the target position
                let coor = this._getCoordinates();
                // No scroll by default
                let scrollV = false;
                let scrollH = false;
                // HEIGHT
                let top = null;
                // Natural or defined height
                let height = this.$el.clientHeight;
                let width = this.$el.clientWidth;
                this.scrollWidth = width;
                this.scrollHeight = height - outHeight;
                if ((coor.top === null) && (coor.bottom === null)) {
                  coor.top = coor.bottom = (pos.height - height) / 2;
                } else if ((coor.top === null) && coor.bottom) {
                  coor.top = pos.height - coor.bottom - height;
                } else if (coor.top && (coor.bottom === null)) {
                  coor.bottom = pos.height - coor.top - height;
                }
                if (coor.top < pos.top) {
                  coor.top = pos.top;
                }
                if (this.element) {
                  if (coor.top + height > pos.height) {
                    let isTopBigger = coor.top > coor.bottom;
                    if (isTopBigger) {
                      if (coor.bottom + height > pos.height) {
                        top = pos.top;
                      } else {
                        top = pos.height - coor.bottom - height + pos.top;
                      }
                    }
                  }
                } else if ((coor.top + height > pos.height) || (coor.bottom + height > pos.height)) {
                  if (!this.top) {
                    coor.top = 0;
                  }
                  scrollV = true;
                }
                if (top === null) {
                  if (coor.top) {
                    top = coor.top + pos.top;
                  } else if (scrollV) {
                    top = pos.top;
                  } else {
                    top = pos.height - (coor.bottom | 0) - height + pos.top;
                  }
                }

                // WIDTH
                let left = null;
                // Natural or defined width
                if ((coor.left === null) && (coor.right === null)) {
                  coor.left = coor.right = (pos.width - width) / 2;
                } else if ((coor.left === null) && coor.right) {
                  coor.left = pos.width - coor.right - width;
                } else if (coor.left && (coor.right === null)) {
                  coor.right = pos.width - coor.left - width;
                }
                if (coor.left < pos.left) {
                  coor.left = pos.left;
                }

                if (this.element) {
                  if (coor.left + width > pos.width) {
                    let isLeftBigger = coor.left > coor.right;
                    if (isLeftBigger) {
                      if (coor.right + width > pos.width) {
                        left = pos.left;
                      } else {
                        left = pos.width - coor.right - width + pos.left;
                      }
                    }
                  }
                } else if ((coor.left + width > pos.width) || (coor.right + width > pos.width)) {
                  if (!this.left) {
                    coor.left = 0;
                  }
                }
                if (left === null) {
                  if (coor.left) {
                    left = coor.left + pos.left;
                  } else if (scrollH) {
                    left = pos.left;
                  } else {
                    left = pos.width - coor.right - width + pos.left;
                  }
                }
                if (left < 0) {
                  left = 0;
                }
                if (top < 0) {
                  top = 0;
                }
                this.currentLeft = left + 'px';
                this.currentTop = top + 'px';
                this.isResizing = false;
                this.$nextTick(() => {
                  //this.setResizeMeasures();
                  if (scroll) {
                    //bbn.fn.log("SCROLLER EXSISTS");
                    scroll.setResizeMeasures();
                  }
                  if (!this.isResized) {
                    this.isResized = true                  
                  }
                });
              });
            });
          }, 'onResize', this.latency);
        }
      },
      //@todo not used
      pressKey(e) {
        switch (e.key) {
          case "Enter":
          case "Space":
            this.select(this.currentIndex);
            break;
          case "Escape":
          case "ArrowLeft":
            this.$emit('close');
            break;
          case "ArrowDown":
            if (this.items.length) {
              if (this.currentIndex > this.items.length - 2) {
                this.currentIndex = 0;
              } else {
                this.currentIndex++;
              }
            }
            break;
          case "ArrowUp":
            if (this.items.length) {
              if (this.currentIndex > 0) {
                this.currentIndex--;
              } else {
                this.currentIndex = this.items.length - 1;
              }
            }
            break;
        }
      },
      /**
       * Closes the floater if the prop autoHide is set to true.
       * @method leave
       * @fires close
       * @fires leave
       * @emit mouseleave
       */
      leave() {
        this.isOver = false;
        if (this.mouseLeaveTimeout !== false) {
          clearTimeout(this.mouseLeaveTimeout);
        }
        this.mouseLeaveTimeout = setTimeout(() => {
          if (!this.isOver && this.autoHide){
            this.close();
          }
          this.mouseLeaveTimeout = false;
        }, bbn.fn.isNumber(this.autoHide) ? this.autoHide : 1500);
      },
      /**
       * @method mouseleave
       * @emit mouseleave
       * @fires leave
       */
      mouseleave(){
        let e = new Event('mouseleave', {cancelable: true});
        this.$emit('mouseleave', e);
        if (!e.defaultPrevented){
          this.leave();
        }
      },
      /**
       * Closes the floater by hiding it.
       * @method close
       * @param {Boolean} force
       * @param {Boolean} confirm
       * @emit beforeClose
       * @emit close
       * @fires beforeClose
       * @fires hide
       * @fires afterClose
       */
      close(force, confirm = false) {
        let ok = true;
        if (!force) {
          let beforeCloseEvent = new Event('beforeClose', {
            cancelable: true
          });
          if (this.popup) {
            this.popup.$emit('beforeClose', beforeCloseEvent, this);
          }
          else {
            this.$emit('beforeClose', beforeCloseEvent, this);
          }
          if (beforeCloseEvent.defaultPrevented) {
            return;
          }
          if (this.beforeClose && (this.beforeClose(this) === false)) {
            return;
          }
          bbn.fn.each(this.closingFunctions, (a) => {
            a(this, beforeCloseEvent);
          });
          if (beforeCloseEvent.defaultPrevented) {
            return;
          }
        }
        let form = this.find('bbn-form');
        if ( (form !== undefined)  && !confirm ){
          form.closePopup();
        }
        else{
          let closeEvent = new Event('close');
          this.hide();
          //this.$el.style.display = 'block';
          this.$nextTick(() => {
            this.$emit("close", this, closeEvent);
            if (this.afterClose) {
              this.afterClose(this);
            }
          })
        }
      },
      /**
       * Closes all levels.
       * @method closeAll
       * @fires ancesters
       */
      closeAll() {
        this.currentVisible = false;
        if (this.level) {
          let ancesters = this.ancesters('bbn-floater');
          for (let i = this.level; i >= 0; i--) {
            if (ancesters[i]) {
              //bbn.fn.log(ancesters, i, ancesters[i]);
              ancesters[i].currentVisible = false;
            }
          }
        }
      },
      /**
       * Handles the selection of the floater's items.
       * @method select
       * @param {Object} item
       * @param {Number} idx
       * @param dataIndex
       * @fires closeAll
       * @emits select
       */
      select(item, idx, dataIndex){
        if (item && !item.disabled && !item[this.children]) {
          let ev = new Event('select', {cancelable: true});
          this.$emit("select", item, idx, dataIndex, ev);
          if (ev.defaultPrevented) {
            return;
          }
          if (this.mode !== 'options') {
            this.closeAll();
          }
          if (this.mode === 'options') {
            item.selected = !item.selected;
          }
          else if ((this.mode === 'selection') && !item.selected) {
            let prev = bbn.fn.search(this.filteredData, "selected", true);
            if (prev > -1) {
              this.filteredData[prev].selected = false;
            }
            item.selected = true;
          }
          /*
          @todo bbn-list does it already
          if (item.action) {
            if (typeof (item.action) === 'string') {
              bbn.fn.log("CLICK IS STRING", this);
            }
            else if (bbn.fn.isFunction(item.action)) {
              //bbn.fn.log("CLICK IS FUNCTION", item.action, this);
              item.action(idx, item);
            }
          }
          */
        }
      },
      /**
       * @method getDimensions
       * @param {Number} width
       * @param {Number} height
       * @return {Object}
       */
      getDimensions(width, height) {
        let r = {
          width: 0,
          height: 0
        };
        let parent = this.container || this.$root.$el;
        if (parent && (width || height)) {
          let el = document.createElement('div');
          el.style.position = 'absolute';
          el.style.width = width ? bbn.fn.formatSize(width) : 'auto';
          el.style.height = height ? bbn.fn.formatSize(height) : 'auto';
          //bbn.fn.log("getDimensions", width, height)
          try {
            parent.insertAdjacentElement('beforeend', el);
            r = {
              width: el.clientWidth,
              height: el.clientHeight
            };
          }
          catch (e){
            bbn.fn.log("ERROR", e, this.$el);
          }
          el.remove();
        }
        return r;
      },
      /**
       * @method updatePosition
       * @fires init
       * @fires onResize
       */
      updatePosition(){
        this.init();
        this.onResize();
      },
      /**
       * @method onFocus
       * @fires getRef
       */
      onFocus(){
        if ( this.currentButtons.length ){
          //bbn.fn.log("onFocus", this.getRef('buttons'), this.getRef('button' + (this.currentButtons.length - 1)));
          let lastButton = this.getRef('button' + (this.currentButtons.length - 1));
          if (lastButton && lastButton.$el) {
            lastButton.$el.focus();
          }
        }
      },
      /**
       * @method updateData
       * @return {Promise}
       */
      updateData(){
        if (this.component || this.$slots.default || this.content) {
          return this.$nextTick()
        }
        return bbn.vue.listComponent.methods.updateData.apply(this);
      }
    },
    /**
     * @event created
     * @fires _updateIconSituation
     */
    created(){
      this.componentClass.push('bbn-resize-emitter');
      this.$on('dataloaded', () => {
        this._updateIconSituation();
      });
      //this.updateData();
    },
    /**
     * @event mounted
     * @fires ancesters
     * @fires closeAll
     */
    mounted(){
      this.$nextTick(() => {
        let ancesters = this.ancesters('bbn-floater');
        /*
        if (this.element) {
          let ct = ancesters.length ? ancesters[ancesters.length-1] : this;
          let scroll = ct.closest('bbn-scroll');
          if (scroll) {
            scroll.$once('scroll', () => {
              this.closeAll();
            });
          }
        }
        */
      });
    },
    watch: {
      lastKnownCtWidth() {
        this.onResize();
        this.updatePosition();
      },
      lastKnownCtHeight() {
        this.onResize();
        this.updatePosition();
      },
      /**
       * @watch left
       * @fires updatePosition
       */
      left(){
        this.updatePosition();
      },
      /**
       * @watch right
       * @fires updatePosition
       */
      right(){
        this.updatePosition();
      },
      /**
       * @watch top
       * @fires updatePosition
       */
      top(){
        this.updatePosition();
      },
      /**
       * @watch bottom
       * @fires updatePosition
       */
      bottom(){
        this.updatePosition();
      },
      /**
       * @watch source
       * @fires updateData
       */
      source: {
        deep: true,
        handler() {
          if ( this.currentData.length ){
            this.updateData();
          }
        }
      },
      /**
       * @watch filteredData
       * @fires getRef
       * @fires onResize
       */
      /*
      filteredData() {
        if (this.ready) {
          this.$nextTick(() => {
            let sc = this.getRef('scroll');
            if (sc) {
              sc.initSize();
            }
            this.$nextTick(() => {
              //bbn.fn.log("CHANGE FILTERED DATA");
              this.onResize();
            });
          });
        }
      },
      */
      /**
       * @watch visible
       * @fires onResize
       */
      visible(v) {
        if (v) {
          this.onResize();
        }
      },
      /**
       * @watch element
       * @param {Element} newVal
       * @fires onResize
       */
      element(newVal) {
        if (newVal && this.ready) {
          this.currentVisible = false;

          this.$nextTick(() => {
            this.currentVisible = true;
            //bbn.fn.log("CHANGE ELEMENT");
            this.onResize();
          });
        }
      },
      /**
       * @watch isOver
       */
      isOver(v){
        if (v && this.mouseLeaveTimeout){
          clearTimeout(this.mouseLeaveTimeout);
        }
      }
    }

  });

})(window.Vue, window.bbn);
