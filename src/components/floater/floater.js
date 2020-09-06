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
      bbn.vue.dimensionsComponent,
      bbn.vue.resizerComponent,
      bbn.vue.keepCoolComponent,
      bbn.vue.toggleComponent,
      bbn.vue.positionComponent
    ],
    props: {
      /**
       * @prop container
       */
      container: {},
      /**
       * If an element is given this will force the position.
       * @prop {String} position
       */
      position: {
        type: String,
        default: ''
      },
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
        default: 300
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
         * @data {Boolean} [false] isMaximized
         */
        isMaximized: false,
        /**
         * @data {Number} [0] scrollMinWidth
         */
        scrollMinWidth: 0,
        /**
         * @data {Number} [0] outHeight
         */
        outHeight: 0,
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
         * @data {Boolean} [false] isResized
         */
        isResized: false,
        /**
         * @data {Boolean} [false] isInit
         */
        isInit: false,
        definedWidth: null,
        definedHeight: null,
        resizerFn: null
      };
    },
    computed: {
      /**
       * Normalizes the property 'left'.
       * @computed formattedLeft
       * @return {String}
       */
      formattedLeft() {
        return this.currentLeft ? this.formatSize(this.currentLeft) : '0px';
      },
      /**
       * Normalizes the property 'top'.
       * @computed formattedTop
       * @return {String}
       */
      formattedTop() {
        return this.currentTop ? this.formatSize(this.currentTop) : '0px';
      },
      /**
       * Normalizes the property 'width'.
       * @computed formattedWidth
       * @return {String}
       */
      formattedWidth() {
        return this.formatSize(
          this.width
          || (this.isResized ? 
            this.realWidth : this.currentMaxWidth || '100%'
          )
        );
      },
      /**
       * Normalizes the property 'height'.
       * @computed formattedHeight
       * @return {String}
       */
      formattedHeight() {
        return this.formatSize(
          this.height
          || (this.isResized ? 
            this.realHeight : this.currentMaxHeight || '100%'
          )
        );
      },
      /**
       * An object of css display properties to apply to the floater.
       * 
       * @computed currentStyle
       * @return {Object}
       */
      currentStyle() {
        let s;
        if (this.isMaximized) {
          s = {
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            opacity: 1
          };
        }
        else {
          s = {
            top: this.formattedTop,
            left: this.formattedLeft,
            width: this.formattedWidth,
            height: this.formattedHeight,
            opacity: this.isResizing || !this.isResized ? 0 : 1
          };
          if (this.currentMaxWidth) {
            bbn.fn.extend(s, {
              maxWidth: this.formatSize(this.currentMaxWidth),
              minWidth: this.formatSize(this.currentMinWidth),
              maxHeight: this.formatSize(this.currentMaxHeight),
              minHeight: this.formatSize(this.currentMinHeight)
            });
          }
        }
        return s;
      },
      /**
       * True if there is some content in the component.
       * 
       * @computed isVisible
       * @return {Boolean}
       */
      hasContent(){
        return !!(this.content || this.component || this.filteredData.length || this.$slots.default);
      },
      /**
       * True if the component is visible.
       * 
       * @computed isVisible
       * @return {Boolean}
       */
      isVisible(){
        return this.hasContent;
      },
      /**
       * True if the orientation is 'horizontal'.
       * @computed isHorizontal
       * @return {Boolean}
       */
      isHorizontal(){
        return this.orientation === 'horizontal';
      },
      scrollMaxHeight(){
        return this.currentMaxHeight ? this.currentMaxHeight - this.outHeight : null;
      },
      hasDimensions(){
        return !!(this.width && this.height);
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
        let tmp = this.getDimensions(this.width, this.height);
        if (tmp.width) {
          width = tmp.width;
        }
        if (tmp.height) {
          height = tmp.height;
        }
        this.currentWidth = width;
        this.currentHeight = height;
        this.setContainerMeasures();
        this._setMinMax();
        this.isInit = true;
        return this.onResize();
      },
      /**
       * 
       */
      _setMinMax(){
        let minWidth = [0];
        let minHeight = [0];
        let maxWidth = [bbn.env.width];
        let maxHeight = [bbn.env.height];
        let tmp = this.getDimensions(this.minWidth, this.minHeight);
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
          this.containerWidth = coord.width;
          this.containerHeight = coord.height;
        }
        else {
          this.containerWidth = bbn.env.width;
          this.containerHeight = bbn.env.height;
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
        if (this.left !== undefined) {
          maxWidth.push(Math.max(this.left, bbn.env.height - this.left));
        }
        if (this.right !== undefined) {
          maxWidth.push(Math.max(this.right, bbn.env.height - this.right));
        }
        if (this.top !== undefined) {
          maxHeight.push(Math.max(this.top, bbn.env.height - this.top));
        }
        if (this.bottom !== undefined) {
          maxHeight.push(Math.max(this.bottom, bbn.env.height - this.bottom));
        }
        let outHeight = 0;
        if (this.title) {
          let header = this.getRef('header');
          if (header) {
            outHeight += header.clientHeight;
          }
        }
        if (this.footer) {
          let footer = this.getRef('footer');
          if (footer) {
            outHeight += footer.clientHeight;
          }
        }
        if (this.buttons) {
          let footer = this.getRef('buttons');
          if (footer) {
            outHeight += footer.clientHeight;
          }
        }
        if (outHeight !== this.outHeight) {
          this.outHeight = outHeight;
        }
        tmp = false;
        if (this.width || this.height) {
          if (tmp = this.getDimensions(this.width, this.height)) {
            if (tmp.width) {
              maxWidth.push(tmp.width);
              minWidth.push(tmp.width);
              this.definedWidth = tmp.width;
            }
            else if (this.definedWidth) {
              this.definedWidth = null;
            }
            if (tmp.height) {
              maxHeight.push(tmp.height);
              minHeight.push(tmp.height);
              this.definedHeight = tmp.height;
            }
            else if (this.definedHeight) {
              this.definedHeight = null;
            }
          }
        }
        this.currentMaxHeight = Math.min(...maxHeight);
        this.currentMinWidth = Math.max(...minWidth);
        this.currentMinHeight = Math.max(...minHeight);
        this.currentMaxWidth = Math.min(...maxWidth);
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
       * Defines the position of the floater.
       * @method _getCoordinates
       * @return {Object}
       */
      _getCoordinates() {
        if (this.element) {
          let coor = this.element.getBoundingClientRect();
          return {
            top: this.isHorizontal ? coor.top : coor.bottom,
            bottom: this.currentMaxHeight - (this.isHorizontal ? coor.bottom : coor.top),
            left: this.isHorizontal ? coor.right : coor.left,
            right: this.currentMaxWidth - (this.isHorizontal ? coor.left : coor.right)
          };
        }
        else {
          return {
            top: bbn.fn.isNumber(this.top) ? this.top : null,
            right: bbn.fn.isNumber(this.right) ? this.right : null,
            bottom: bbn.fn.isNumber(this.bottom) ? this.bottom : null,
            left: bbn.fn.isNumber(this.left) ? this.left : null
          };
        }
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
       * Handles the resize of the component.
       * @method onResize
       * @param {Boolean} force
       * @fires _getCoordinates
       * @fires init
       * @fires getRef
       * @fires keepCool
       * @fires setResizeMeasures
       */
      onResize(force) {
        return new Promise((resolve) => {
          // Should be triggered by the inner scroll once mounted
          if (this.isVisible && bbn.fn.isDom(this.$el) && (!this.isResizing || !this.isResized)) {
            if (this.resizerFn) {
              clearTimeout(this.resizerFn);
            }
            this.resizerFn = setTimeout(() => {
              this.resizerFn = false;
              let scroll = this.getRef('scroll');
              if (!scroll || !scroll.ready || this.setContainerMeasures()){
                // Case where the container has changed size
                if (scroll && scroll.ready) {
                  // Setting lastKnownWidth & lastKnownHeight
                  this.setResizeMeasures();
                }
                // We do nothing and wait that the scroll does the resize
                resolve();
                return;
              }
              // this will change the dimension and the visibility the time to calculate the sizes
              this.isResizing = true;
              this.$forceUpdate();
              this.$nextTick().then(() => {
                let dimensions = {
                  w: scroll.naturalWidth,
                  h: scroll.naturalHeight
                };
                let scrollChange = false;
                if (this.scrollWidth !== dimensions.w) {
                  scrollChange = true;
                  this.scrollWidth = dimensions.w;
                }
                if (this.scrollHeight !== dimensions.h) {
                  scrollChange = true;
                  this.scrollHeight = dimensions.h;
                }
                if (!this.setContainerMeasures() && !force && !scrollChange) {
                  this.isResizing = false;
                  resolve();
                  return;
                }
                let current = this.getDimensions(this.width, this.height)
                let currentHeight = current && current.height ? current.height : 0;
                let currentWidth = current && current.width ? current.width : 0;
                if ( !currentHeight ){
                  currentHeight = this.scrollHeight + this.outHeight;
                }
                if ( currentHeight > this.currentMaxHeight ){
                  currentHeight = this.currentMaxHeight;
                }
                if ( !currentWidth ){
                  currentWidth = this.scrollWidth;
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
                if (this.realWidth !== currentWidth) {
                  this.realWidth = currentWidth;
                }
                if (this.realHeight !== currentHeight) {
                  this.realHeight = currentHeight;
                }
                this.$forceUpdate();
                this.updatePosition();
                this.$nextTick(() => {
                  this.setResizeMeasures();
                  this.$nextTick(() => {
                    this.$emit('resize');
                    this.$nextTick(() => {
                      if (!this.isResized) {
                        this.isResized = true;
                      }
                      this.isResizing = false;
                      resolve();
                    })
                  });
                });
              });
            }, this.latency);
          }
        });
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
          el.style.width = this.formatSize(width);
          el.style.height = this.formatSize(height);
          //bbn.fn.log("getDimensions", width, height)
          try {
            parent.insertAdjacentElement('beforeend', el);
            r = {
              width: el.clientWidth || el.offsetWidth || null,
              height: el.clientHeight || el.offsetHeight || null
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
        //this.init();
        this._setMinMax();
        // The coordinates of the target position
        let coor = this._getCoordinates();
        // No scroll by default
        let scrollV = false;
        let scrollH = false;
        // HEIGHT
        let top = null;
        // Natural or defined height
        let height = this.realHeight;
        let width = this.realWidth;
        /*
        this.scrollWidth = width;
        this.scrollHeight = height - outHeight;
        */
        // If no vertical position at all, centered (same top and bottom)
        if ((coor.top === null) && (coor.bottom === null)) {
          coor.top = Math.floor((this.containerHeight - height) / 2) 
                    + ((this.containerHeight - height) % 2);
          coor.bottom = Math.floor((this.containerHeight - height) / 2);
        }
        else if ((coor.top === null) && coor.bottom) {
          coor.top = this.containerHeight - coor.bottom - height;
        }
        else if (coor.top && (coor.bottom === null)) {
          coor.bottom = this.containerHeight - coor.top - height;
        }
        if (coor.top < 0) {
          coor.top = 0;
        }
        if (this.element) {
          if (coor.top + height > this.containerHeight) {
            let isTopBigger = (coor.bottom < height) && coor.top > coor.bottom;
            if (isTopBigger) {
              if (coor.bottom + height > this.containerHeight) {
                top = 0;
              }
              else {
                top = this.containerHeight - coor.bottom - height;
              }
            }
          }
        }
        else if ((coor.top + height > this.containerHeight) || (coor.bottom + height > this.containerHeight)) {
          if (!this.top) {
            coor.top = 0;
          }
          scrollV = true;
        }
        if (top === null) {
          if (coor.top) {
            top = coor.top;
          }
          else if (scrollV) {
            top = 0;
          }
          else {
            top = this.containerHeight - (coor.bottom | 0) - height;
          }
        }

        // WIDTH
        let left = null;
        // If no horizontal position at all, centered (same left and right)
        if ((coor.left === null) && (coor.right === null)) {
          coor.left = Math.floor((this.containerWidth - width) / 2) 
                      + ((this.containerWidth - width) % 2);
          coor.right = Math.floor((this.containerWidth - width) / 2);
        }
        else if ((coor.left === null) && coor.right) {
          coor.left = this.containerWidth - coor.right - width;
        }
        else if (coor.left && (coor.right === null)) {
          coor.right = this.containerWidth - coor.left - width;
        }
        if (coor.left < 0) {
          coor.left = 0;
        }

        if (this.element) {
          if (coor.left + width > this.containerWidth) {
            let isLeftBigger = (coor.right < width) && (coor.left > coor.right);
            if (isLeftBigger) {
              if (coor.right + width > this.containerWidth) {
                left = 0;
              }
              else {
                left = this.containerWidth - coor.right - width;
              }
            }
          }
        }
        else if ((coor.left + width > this.containerWidth) || (coor.right + width > this.containerWidth)) {
          if (!this.left) {
            coor.left = 0;
          }
        }
        if (left === null) {
          if (coor.left) {
            left = coor.left;
          }
          else if (scrollH) {
            left = 0;
          }
          else {
            left = this.containerWidth - coor.right - width;
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
        bbn.fn.log("FROM UPDAT POSITION LINE 847");
        //this.onResize();
      },
      /**
       * Handles the resize of the scroller.
       * @method scrollResize
       * @fires onResize
       * @fires updateComponents
       */
      scrollResize() {
        return this.keepCool(() => {
          if (this.scrollResizeTimeout !== false) {
            clearTimeout(this.scrollResizeTimeout);
          }
          this.scrollResizeTimeout = setTimeout(() => {
            this.scrollResizeTimeout = false;
            if (!this.isInit || !this.isResizing) {
              let sc = this.getRef('scroll');
              if (!sc || !sc.ready) {
                return this.scrollResize();
              }
              else {
                if (!this.isInit) {
                  this._setMinMax();
                }
                return this.$nextTick().then(() => {
                  sc.getNaturalDimensions().then(() => {
                    let nb = this.mountedComponents.length;
                    this.updateComponents();
                    let sizeChanged = !this.isInit
                    || (nb !== this.mountedComponents.length);
                    if (!this.isInit) {
                      this.ready = true;
                      this.$nextTick(() => {
                        this.init();
                      })
                    }
                    else if (sizeChanged) {
                      this.isResized = false;
                      this.onResize();
                    }
                  })
                })
              }
            }
          }, 50);
        }, 'scrollresize', 25)
      },
      /**
       * Handles the resize of the scroller.
       * @method scrollResize
       * @fires onResize
       * @fires updateComponents
       *
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
          /*
          else if (!this.scrollWidth || !this.scrollHeight) {
            //sc.initSize();
          }
          else{
            this.onResize();
          }
          *
         else {
            sc.getNaturalDimensions().then((dimensions) => {
              this.scrollWidth = dimensions.w;
              this.scrollHeight = dimensions.h;
              this.onResize();
            });
         }
        }, 100);
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
      //@todo not used
      pressKey(e) {
        switch (e.key) {
          case "Enter":
          case "Space":
            this.select(this.currentIndex);
            break;
          case "Escape":
          case "ArrowLeft":
            if (this.closable) {
              this.$emit('close');
            }
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
        if (!force) {
          if (!this.closable && !this.autoHide && !force) {
            return;
          }
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
          this.$emit("close", this, closeEvent);
          if (this.afterClose) {
            this.afterClose(this);
          }
        }
      },
      /**
       * Closes all levels.
       * @method closeAll
       * @fires ancesters
       */
      closeAll() {
        if (this.level) {
          let ancesters = this.ancesters('bbn-floater');
          for (let i = this.level; i >= 0; i--) {
            if (ancesters[i]) {
              //bbn.fn.log(ancesters, i, ancesters[i]);
              ancesters[i].close(true);
            }
          }
        }
        this.close(true);
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
     */
    created(){
      this.componentClass.push('bbn-resize-emitter');
      this.isResizing = true;
    },
    /**
     * @event mounted
     * @fires ancesters
     * @fires closeAll
     */
    mounted() {
      this._setMinMax();
      this.ready = true;
      /*
      this.$nextTick(() => {
        let ancesters = this.ancesters('bbn-floater');
        if (this.element) {
          let ct = ancesters.length ? ancesters[ancesters.length-1] : this;
          let scroll = ct.closest('bbn-scroll');
          if (scroll) {
            scroll.$once('scroll', () => {
              this.closeAll();
            });
          }
        }
      });
      */
    },
    watch: {
      /*
      lastKnownCtWidth() {
        if (this.ready && !this.isResizing) {
          this.keepCool(() => {
            bbn.fn.log("ON CHANGE CT WIDTH");
            this._setMinMax();
            this.onResize();
            this.updatePosition();
          }, 'changeDimension', 50)
        }
      },
      lastKnownCtHeight() {
        if (this.ready && !this.isResizing) {
          this.keepCool(() => {
            bbn.fn.log("ON CHANGE CT HEIGHT");
            this._setMinMax();
            this.onResize();
            this.updatePosition();
          }, 'changeDimension', 50)
        }
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
            this.onResize();
          });
        }
      },
      /**
       * @watch isOver
       */
      isOver(v, oldV){
        if (this.autoHide && this.isResized && this.ready && !this.isResizing) {
          if (v && this.mouseLeaveTimeout) {
            clearTimeout(this.mouseLeaveTimeout);
          }
          else if (!v) {
            this.mouseLeaveTimeout = setTimeout(() => {
              if (!this.isOver) {
                this.close();
              }
              this.mouseLeaveTimeout = false;
            }, bbn.fn.isNumber(this.autoHide) ? this.autoHide : 1500);
          }
        }
      }
    }

  });

})(window.Vue, window.bbn);
