((bbn) => {
let script = document.createElement('script');
script.innerHTML = `<div :class="[
        {
          'bbn-reset': true,
          'bbn-bordered': true,
          'bbn-background-internal': true,
          'bbn-invisible': !isResized
        },
        componentClass
      ]"
      v-if="isVisible"
      tabindex="0"
      @focus="onFocus"
      @resize.stop="onResize"
      @mouseleave="isResized ? isOver = false : (() => {})()"
      @mouseenter="isResized ? isOver = true : (() => {})()"
      @keydown.esc.prevent.stop="close"
      @subready.stop
      :style="currentStyle">
  <div :style="containerStyle"
       :class="{'bbn-flex-height': outHeight > 0}">
    <header v-if="title"
            ref="header"
            :class="{
              'bbn-header': true,
              'bbn-bordered-bottom': true,
              'bbn-unselectable': true,
              'bbn-block': true,
              'bbn-w-100': !isResizing
            }">
      <div v-if="title"
           class="bbn-w-100">
        <h3 v-html="title"
            class="bbn-no-margin bbn-spadded"
            ref="title"/>
      </div>
      <div class="bbn-top-right bbn-p bbn-lg">
        <div v-if="maximizable !== false"
            class="bbn-h-100 bbn-middle bbn-reactive"
            @click.stop.prevent="isMaximized = !isMaximized"
            tabindex="0"
            :title="_('Full screen')">
          <i :class="'nf nf-mdi-window_' + (isMaximized ? 'restore' : 'maximize')"/>
        </div>
        <div v-if="closable !== false"
            class="bbn-h-100 bbn-middle bbn-reactive"
            @click.stop.prevent="close"
            tabindex="0"
            :title="_('Close')">
          <i class="nf nf-fa-times"/>
        </div>
      </div>
    </header>
    <div :class="{
          'bbn-flex-fill': footer || title || (buttons && buttons.length),
          'bbn-h-100': !title && !footer && (!buttons || !buttons.length),
          'bbn-w-100': true
        }">
          <!--v-if="isMounted">-->
      <bbn-scroll :latency="latency"
                  ref="scroll"
                  v-if="ready"
                  @ready="scrollReady = true"
                  :scrollable="scrollable"
                  :max-width="currentMaxWidth || null"
                  :max-height="scrollMaxHeight || null"
                  :min-width="currentMinWidth || null"
                  :min-height="currentMinHeight > outHeight ? currentMinHeight - outHeight : null"
                  @resize="scrollResize">
        <component v-if="component"
                  :is="component"
                  v-bind="realComponentOptions"/>
        <slot v-else-if="$slots.default"/>
        <div v-else-if="!!content" 
            v-html="content"
            :class="scrollable ? 'bbn-block' : 'bbn-100'"/>
        <bbn-list v-else-if="filteredData.length"
                  :mode="mode"
                  :suggest="suggest"
                  :source="filteredData"
                  :component="itemComponent"
                  :template="template"
                  :uid="uid"
                  :children="children"
                  :selected="selected"
                  :class="'bbn-floater-list bbn-menulist ' + mode"
                  origin="floater"
                  @select="select"
                  :source-value="sourceValue"
                  :source-text="sourceText"/>
        <h3 v-else v-text="noData"/>
      </bbn-scroll>
    </div>
    <footer v-if="footer"
            v-html="footer"
            :class="{
              'bbn-w-100': !isResizing,
              'bbn-block': isResizing
            }"
            ref="footer"/>
    <footer v-else-if="currentButtons.length"
            :class="{
              'bbn-w-100': !isResizing,
              'bbn-block': isResizing,
              'bbn-button-group': true
            }"
            ref="buttons">
      <bbn-button v-for="(b, i) in currentButtons"
                  :key="i"
                  :ref="'button' + i"
                  @ready="t => focusable = t"
                  v-bind="b"/>
    </footer>
  </div>
</div>`;
script.setAttribute('id', 'bbn-tpl-component-floater');
script.setAttribute('type', 'text/x-template');
document.body.insertAdjacentElement('beforeend', script);
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
      bbn.vue.componentInsideComponent,
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
        default: 50
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
        type: [Boolean, Number],
        default: false
      }
    },
    data() {
      let fns = [];
      if ( this.onClose ){
        fns.push(this.onClose);
      }
      let opt = this.componentOptions || {};
      if (this.component && this.source && !bbn.fn.numProperties(opt)) {
        opt.source = this.source;
      }

      return {
        realComponentOptions: opt,
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
         * @data {Boolean} [false] isResized Remains false until realWidth & realHeight are defined
         */
        isResized: false,
        /**
         * @data {Boolean} [false] isInit
         */
        isInit: false,
        definedWidth: null,
        definedHeight: null,
        resizerFn: null,
        scrollReady: false,
        scrollResized: false
      };
    },
    computed: {
      /**
       * Normalizes the property 'left'.
       * @computed formattedLeft
       * @return {String}
       */
      formattedLeft() {
        return this.currentLeft !== null ? this.formatSize(this.currentLeft) : '0px';
      },
      /**
       * Normalizes the property 'top'.
       * @computed formattedTop
       * @return {String}
       */
      formattedTop() {
        return this.currentTop !== null ? this.formatSize(this.currentTop) : '0px';
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
          };
        }
        else {
          s = {
            top: this.formattedTop,
            left: this.formattedLeft,
            width: this.formattedWidth,
            height: this.formattedHeight
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
        s.opacity = this.isResized ? 1 : 0;
        return s;
      },
      containerStyle(){
        if (this.isResizing && this.currentMaxWidth) {
          return {
            width: this.formatSize(this.currentMaxWidth),
            height: this.formatSize(this.currentMaxHeight)
          };
        }
        return {
          width: '100%',
          height: '100%'
        }
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
        return this.currentVisible && this.hasContent;
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
      },
      hasButtons(){
        return this.currentButtons.length > 0;
      }
    },
    methods: {
      /**
       * Setting up min/max width/height based on environment and properties
       */
      _setMinMax(){
        // Absolute defaults
        let minWidth = [0];
        let minHeight = [0];
        let maxWidth = [bbn.env.width];
        let maxHeight = [bbn.env.height];

        // Min properties
        let tmp = this.getDimensions(this.minWidth, this.minHeight);
        if (tmp.width) {
          minWidth.push(tmp.width);
        }

        if (tmp.height) {
          minHeight.push(tmp.height);
        }

        // Min based on element - can't be smaller than the element
        if (this.element && this.elementWidth) {
          tmp = this.element.getBoundingClientRect();
          if (tmp.width) {
            minWidth.push(tmp.width);
          }
        }

        // Max properties
        tmp = this.getDimensions(this.maxWidth, this.maxHeight);
        if (tmp.width) {
          maxWidth.push(tmp.width);
        }

        if (tmp.height) {
          maxHeight.push(tmp.height);
        }

        // Max based on container - can't be bigger if container is specified
        let coord = {};
        if (this.container) {
          coord = (bbn.fn.isDom(this.container) ? this.container : this.$el.offsetParent).getBoundingClientRect();
          if (coord.width) {
            maxWidth.push(coord.width);
          }

          if (coord.height) {
            maxHeight.push(coord.height);
          }

        }

        // Setting container dimensions vars
        this.containerWidth = coord.width || bbn.env.width;
        this.containerHeight = coord.height || bbn.env.height;

        // Depends on an element (dropdown, context) and will position by it
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
            outHeight += header.offsetHeight;
          }
        }
        if (this.footer) {
          let footer = this.getRef('footer');
          if (footer) {
            outHeight += footer.offsetHeight;
          }
        }
        else if (this.currentButtons) {
          let footer = this.getRef('buttons');
          if (footer) {
            outHeight += footer.offsetHeight;
          }
        }
        if (outHeight !== this.outHeight) {
          this.outHeight = outHeight;
        }
        tmp = false;
        this.currentMinWidth = Math.max(...minWidth);
        this.currentMinHeight = Math.max(...minHeight);
        this.currentMaxHeight = Math.min(...maxHeight);
        this.currentMaxWidth = Math.min(...maxWidth);
        if ((maxHeight < minHeight) || (maxHeight < minHeight)) {
          throw new Error(bbn._("Wrong min/max width/height set in the properties"));
        }
        if (this.width || this.height) {
          tmp = this.getDimensions(this.width, this.height);
          if (tmp) {
            if (tmp.width
              && (this.currentMaxWidth >= tmp.width)
              && (this.currentMinHeight <= tmp.width)
            ) {
              this.definedWidth = tmp.width;
            }
            else if (this.definedWidth) {
              this.definedWidth = null;
            }
            if (tmp.height
                && (this.currentMaxHeight >= tmp.height)
                && (this.currentMinHeight <= tmp.height)
            ) {
              this.definedHeight = tmp.height;
            }
            else if (this.definedHeight) {
              this.definedHeight = null;
            }
          }
        }
      },
      /**
       * @todo not used the method getComponents() doesn't exist
       */
      updateComponents() {
        bbn.fn.each(this.getComponents(), (a) => {
          if (a.$vnode.componentOptions) {
            let type = a.$vnode.componentOptions.tag || a._uid;
            if (this.mountedComponents.indexOf(type) === -1) {
              this.mountedComponents.push(type);
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
      onResize(force){
        bbn.fn.log("onResize", this.scrollResized, this.isVisible);
        if (this.scrollResized
            && this.isVisible
            && this.$el
            && (this.setContainerMeasures() || !this.isInit || force)
        ) {
          bbn.fn.log("onResize2");
          this.realResize();
        }
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
      realResize() {
        return this.keepCool(() => {
          let p;
          let go = this.isVisible
              && this.scrollReady
              && bbn.fn.isDom(this.$el)
              && (!this.isResizing || !this.isResized);
          if (go) {
            this.isResizing = true;
            this._setMinMax();  
          }
          return new Promise((resolve) => {
            // Should be triggered by the inner scroll once mounted
            if (go) {
              bbn.fn.log("realResize", this);
              if (this.definedWidth && this.definedHeight) {
                if ((this.realWidth !== this.definedWidth)
                  ||(this.realHeight !== this.definedHeight)
                ) {
                  this.currentWidth = this.definedWidth;
                  this.realWidth = this.definedWidth;
                  this.currentHeight = this.definedHeight;
                  this.realHeight = this.definedHeight;
                  this.updatePosition();
                  resolve(1);
                  return;
                }
                resolve(0);
                return;
              }
              else {
                if (this.resizerFn) {
                  clearTimeout(this.resizerFn);
                }
                this.resizerFn = setTimeout(() => {
                  bbn.fn.log("RESIZER FN");
                  this.resizerFn = false;
                  let scroll = this.getRef('scroll');
                  bbn.fn.log(scroll);
                  if (!scroll || !scroll.ready){
                    // We do nothing and wait that the scroll does the resize
                    resolve(0);
                    return;
                  }
                  // this will change the dimension and the visibility the time to calculate the sizes
                  scroll.getNaturalDimensions().then(() => {
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
                    let currentHeight = this.definedHeight || 0;
                    let currentWidth = this.definedWidth || 0;
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
                    let isChanged = 0;
                    if (!this.realWidth || (Math.abs(this.realWidth - currentWidth) > 2)) {
                      isChanged = 1;
                      this.realWidth = currentWidth;
                    }
                    if (!this.realHeight || (Math.abs(this.realHeight - currentHeight) > 2)) {
                      isChanged = 1;
                      this.realHeight = currentHeight;
                    }
                    resolve(isChanged);
                  });
                }, this.latency);
              }
            }
            else {
              resolve(0);
              return;
            }
          }).then((r) => {
            if (r) {
              if (!this.isInit) {
                this.isInit = true;
              }

              this.$forceUpdate();

              this.$nextTick(() => {
                this.isResizing = false;
                if (this.element && !this.isResized) {
                  this.isResized = true;
                }
                this.$nextTick(() => {
                  this.setResizeMeasures();
                  this.$forceUpdate();
                  this.$nextTick(() => {
                    this.updatePosition();
                    if (!this.isResized) {
                      this.isResized = true;
                    }
                    this.$emit('resize');
                  });
                });
              })
            }
            else if (go && this.isInit) {
              this.isResizing = false;
            }
          });
        }, 'scroll', 20);
      },
      /**
       * Returns an object of numbers as width and height based on whatever unit given.
       * 
       * @method getDimensions
       * @param {Number} width
       * @param {Number} height
       * @return {Object}
       */
      getDimensions(width, height) {
        if (bbn.fn.isNumber(width, height) && height && width) {
          return {
            width: parseInt(width),
            height: parseInt(height)
          };
        }

        let r = {
          width: 0,
          height: 0
        };
        let parent = this.container || this.$root.$el;

        if (parent && (width || height)) {
          if (!parent.insertAdjacentElement) {
            bbn.fn.log(parent);
            throw new Error("Impossible to insert adjacent element to calculate dimensions");
          }

          let el = document.createElement('div');
          el.style.position = 'absolute';
          el.style.opacity = 0;
          el.className = 'bbn-reset'
          el.style.width = this.formatSize(width);
          el.style.height = this.formatSize(height);
          //bbn.fn.log("getDimensions", width, height)
          try {
            parent.insertAdjacentElement('beforeend', el);
            r = {
              width: el.offsetWidth || el.clientWidth || null,
              height: el.offsetHeight || el.clientHeight || null
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
       * @fires onResize
       */
      updatePosition(){
        let r = {
          x: {
            camel: 'Width',
            posStart: 'left',
            posEnd: 'right',
            ideal: this.isHorizontal ? 'right' : 'left',
            nideal: this.isHorizontal ? 'left' : 'right',
            res: null,
          },
          y: {
            camel: 'Height',
            posStart: 'top',
            posEnd: 'bottom',
            ideal: this.isHorizontal ? 'top' : 'bottom',
            nideal: this.isHorizontal ? 'bottom' : 'top',
            res: null
          }
        };

        let coor = this.element ?
          JSON.parse(JSON.stringify(this.element.getBoundingClientRect()))
          : {
            top: bbn.fn.isNumber(this.top) ? this.top : null,
            right: bbn.fn.isNumber(this.right) ? this.right : null,
            bottom: bbn.fn.isNumber(this.bottom) ? this.bottom : null,
            left: bbn.fn.isNumber(this.left) ? this.left : null
          };
        let ok = true;

        bbn.fn.iterate(r, a => {
          let scroll = false;
          let size = this['real' + a.camel];
          if (!size) {
            ok = false;
            return false;
          }

          let min = 0;
          if (this.element) {
            // If the floater is horizontal, it will ideally start at the 
            // top right of the element to open downwards
            // otherwise at the bottom left
            // if the floater cannot be put after the element
            if (coor[a.ideal] + size > this['container' + a.camel]) {
              let spaceAfter = this['container' + a.camel] - coor[a.ideal];
              let spaceBefore = coor[a.nideal];
              // Checking which of before or after is bigger
              let isBeforeBigger = spaceBefore > spaceAfter;
              if (isBeforeBigger) {
                if (spaceBefore <= size) {
                  a.res = 0;
                  size = spaceBefore;
                }
                else {
                  a.res = coor[a.nideal] - size;
                }
              }
              else {
                a.res = coor[a.ideal];
                size = spaceAfter;
              }
            }
            else {
              a.res = coor[a.ideal];
            }
          }
          else {
            if ((coor[a.posStart] !== null) || (coor[a.posEnd] !== null)) {
              a.res = coor[a.posStart] !== null ? coor[a.posStart] : this['container' + a.camel] - coor[a.posEnd] - size;
            }
            else {
              // If no vertical position at all, centered (same top and bottom)
              coor[a.posStart] = Math.floor((this['container' + a.camel] - size) / 2) 
                        + ((this['container' + a.camel] - size) % 2);
              if (coor[a.posStart] < 0) {
                coor[a.posStart] = 0;
              }
              if (coor[a.posStart] + size > this['container' + a.camel]) {
                if (this[a.posStart] === undefined) {
                  coor[a.posStart] = this['container' + a.camel] - size;
                }
                scroll = true;
              }
              else if (coor[a.posEnd] + size > this['container' + a.camel]) {
                if (this[a.posEnd] !== undefined) {
                  coor[a.posEnd] = this['container' + a.camel] - size;
                }
                scroll = true;
              }
              if (a.res === null) {
                if (coor[a.posStart] !== undefined) {
                  a.res = coor[a.posStart];
                }
                else if (scroll) {
                  a.res = 0;
                }
                else {
                  a.res = this['container' + a.camel] - (coor[a.posEnd] || 0) - size;
                }
              }
              a.res = a.res ? a.res + min : min;
              if (a.res < 0) {
                a.res = 0;
              }
            }
          }

          if (size !== this['real' + a.camel]) {
            this['real' + a.camel] = size;
          }
        });

        if (ok  && (r.x.res !== null) && (r.y.res !== null)) {
          this.currentLeft = Math.ceil(r.x.res).toString() + 'px';
          this.currentTop = Math.ceil(r.y.res).toString() + 'px';
        }

      },
      /**
       * Handles the resize of the scroller.
       * @method scrollResize
       * @fires onResize
       * @fires updateComponents
       */
      scrollResize() {
        if (!this.scrollResized) {
          this.scrollResized = true;
        }
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
       * @fires ancestors
       */
      closeAll() {
        if (this.level) {
          let ancestors = this.ancestors('bbn-floater');
          for (let i = this.level; i >= 0; i--) {
            if (ancestors[i]) {
              //bbn.fn.log(ancestors, i, ancestors[i]);
              ancestors[i].close(true);
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
        if (this.currentButtons.length && !this.isMobile){
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
     * @fires ancestors
     * @fires closeAll
     */
    mounted() {
      bbn.fn.startChrono('scroll');
      if (this.isVisible) {
        this.ready = true;
      }
      this.$nextTick(() => {
        let ancestors = this.ancestors('bbn-floater');
        if (this.element) {
          let ct = ancestors.length ? ancestors[ancestors.length-1] : this;
          let scroll = ct.closest('bbn-scroll');
          if (scroll) {
            scroll.$once('scroll', () => {
              this.close();
            });
          }
        }
      });
    },
    updated() {
      /*
      let d = this.oldData;
      this.oldData = JSON.parse(JSON.stringify(this.$data));
      if (d) {
        bbn.fn.log(bbn.fn.diffObj(d, this.oldData));
      }
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
        this.currentVisible = v;
      },
      isVisible(v) {
        if (v) {
          if (!this.ready) {
            this.ready = true;
          }
          else {
            this.onResize(true);
          }
        }
      },
      scrollReady(v) {
        if (v) {
          let nb = this.mountedComponents.length;
          let to = null;
          let fn = () => {
            if (to) {
              clearTimeout(to);
            }
            to = setTimeout(() => {
              this.updateComponents();
              if (this.mountedComponents.length !== nb) {
                nb = this.mountedComponents.length;
                fn();
              }
              else {
                bbn.fn.log("scroll reayd");
                this.realResize();
              }
            }, 50)
          };
          fn();
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
          this.$forceUpdate();

          this.$nextTick(() => {
            this.currentVisible = true;
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
      },
      hasButtons(){
        this.lastKnownCtWidth = 0;
        this.lastKnownCtHeight = 0;
        this.realResize();
      }
    }

  });

})(window.Vue, window.bbn);


})(bbn);