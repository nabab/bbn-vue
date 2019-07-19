/**
 * @file bbn-floater component
 *
 * @description bbn-floater is a component that represents a container that can be bound to another element.
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
  Vue.component('bbn-list', {
    mixins: [bbn.vue.basicComponent, bbn.vue.listComponent, bbn.vue.keynavComponent, bbn.vue.resizerComponent],
    props: {
      /**
       * @prop container
       * 
       */
      origin: {},
      /**
       * The maximum width of the floater.
       * @prop {Number} maxWidth
       */
      maxWidth: {
        type: Number
      },
      /**
       * The maximum height of the floater.
       * @prop {Number} maxHeight
       */
      maxHeight: {
        type: Number
      },
      /**
       * The minimum width of the floater.
       * @prop {Number} minWidth
       */
      minWidth: {
        type: Number
      },
      /**
       * The minimum height of the floater.
       * @prop {Number} maxHeight
       */
      minHeight: {
        type: Number
      },
      /**
       * The width of the floater.
       * @prop {String|Number|Boolean} width
       */
      width: {
        type: [String, Number, Boolean]
      },
      /**
       * The height of the floater.
       * @prop {String|Number|Boolean} height
       */
      height: {
        type: [String, Number, Boolean]
      },
      /**
       * The position 'left'.
       * @prop {Number} left
       */
      left: {
        type: Number
      },
      /**
       * The position 'right'.
       * @prop {Number} right
       */
      right: {
        type: Number
      },
      /**
       * The position 'top'.
       * @prop {Number} top
       */
      top: {
        type: Number
      },
      /**
       * The position 'bottom'.
       * @prop {Number} bottom
       */
      bottom: {
        type: Number
      },
      /**
       * The source of the floater.
       * @prop {Function|Array|String|Object} source
       */
      source: {
        type: [Function, Array, String, Object]
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
       * The floater's orientation.
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
       * Defines the ability of the floater to be scrollable.
       * @prop {Boolean}  [false] scrollable
       */
      scrollable: {
        type: Boolean,
        default: false
      },
      /**
       * Set to true to show the floater.
       * @prop {Boolean} [true] visible
       */
      visible: {
        type: Boolean,
        default: true
      },
      //@todo not used.
      unique: {
        type: Boolean,
        default: false
      },
      /**
       * The mode of the component.
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
       * The hierarchical level, root is 0, and for each generation 1 is added to the level.
       * @prop {Number} [0] level
       */
      level: {
        type: Number,
        default: 0
      },
      /**
       * Set to true to auto-hide the component.
       * @prop {Boolean} [false] autoHide
       */
      autoHide: {
        type: Boolean,
        default: false
      },
      /**
       * The array containings the tree's children.
       * @prop {String} ['items'] children
       */
      children: {
        type: String,
        default: 'items'
      },
      /**
       * The title of the floater's header.
       * @psop {String} title
       */
      title: {
        type: String
      },
      /**
       * The footer of the floater.
       * @psop {String} footer
       */
      footer: {
        type: String
      },
      /**
       * The buttons in the footer.
       * @psop {Array} buttons
       */
      buttons: {
        type: Array,
        default(){
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
       * @prop {Number} [25] latency
       */
      latency: {
        type: Number,
        default: 25
      },
      expanded: {
        type: Array,
        default(){
          return [];
        }
      },
      suggest: {
        type: Boolean,
        default: false
      }
    },
    data(){
      return {
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
        mountedComponents: [],
        isOver: false,
        /**
         * The index (on filteredData) on which is the mouse cursor or the keyboard navigation
         * @data {Number} [-1] overItem
         * @memberof listComponent
         */
        overIdx: this.suggest ? 0 : null,
        mouseLeaveTimeout: false,
        isOpened: true,
        scroll: null,
        hasScroll: false
      };
    },
    computed: {
      /**
       * Normalizes the property 'width'.
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
       * Normalizes the property 'height'.
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
      /**
       * An object of css property to apply to the floater.
       * @computed currentStyle
       * @return {Object}
       */
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
       * Manages the icon of the items.
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
      mouseenter(e, idx){
        if ( !this.isOver ){
          // if the list appears under the nouse while it is inactive
          e.target.addEventListener('mousemove', () => {
            this.overIdx = idx;
            this.isOver = true;
          }, {once: true});
        }
        else{
          this.overIdx = idx;
          this.isOver = true;
        }
      },
      mouseleave(){
        this.isOver = false;
        this.overIdx = this.suggest ? 0 : null;
      },
      isSelected(idx){
        let r = false;
        if ( this.filteredData[idx] ){
          if ( this.selection ){
            if (this.filteredData[idx].selected && (this.mode !== 'options')){
              r = true;
            }
          }
          else if ( this.selected.length && this.sourceValue){
            r = this.selected.includes(this.filteredData[idx].data[this.sourceValue]);
          }
        }
        return r;
      },
      /**
       * Handles the selection of the floater's items.
       * @method select
       * @param {Number} idx 
       * @fires closeAll
       * @emits select
       */
      select(idx){
        let item = this.filteredData[idx] || null;
        if ( item && item.data && !item.data.disabled ){
          this.currentIndex = idx;
          if ( item.data[this.children] && item.data[this.children].length ){
            this.isOpened = !this.isOpened;
          }
          else{
            if ( (this.mode === 'selection') && !item.selected ){
              let prev = bbn.fn.get_row(this.filteredData, "selected", true);
              if ( prev ){
                this.currentData[prev.index].selected = false;
              }
              item.selected = true;
            }
            else {
              item.selected = !item.selected;
            }
            if ( item.data.command ){
              if ( typeof(item.data.command) === 'string' ){
                if ( bbn.fn.isFunction(this[item.data.command]) ){
                  this[item.data.command]();
                }
              }
              else if (bbn.fn.isFunction(item.command) ){
                item.data.command(idx, item.data);
              }
            }
            else if ( item.data.url ) {
              bbn.fn.link(item.data.url);
            }
            this.$emit("select", item.data, idx, item.index);
          }
        }
      }
    },
    /**
     * @event mounted
     */
    mounted(){
      if (this.$parent.$options && (this.$parent.$options._componentTag === 'bbn-scroll')) {
        this.hasScroll = true;
      }
      this.ready = true;
      setTimeout(() => {
        this.overIdx = this.suggest ? 0 : null;
      }, 50);
    },
    watch: {
      /**
       * @watch source
       */
      source: {
        deep: true,
        handler(){
          this.updateData();
        }
      },
      /**
       * @watch currentOver
       * @param {Boolean} newVal 
       */
      overIdx(newVal, oldVal) {
        if (
          this.hasScroll &&
          (newVal >= 0)
        ) {
          if ( oldVal === null ){
            setTimeout(() => {
              this.$parent.scrollTo(this.getRef('li' + newVal), true);
            }, 100);
          }
          else if (!this.isOver) {
            this.$parent.scrollTo(this.getRef('li' + newVal));
          }
        }
      },
      selected(){
        this.updateData();
      }
    }

  });

})(window.Vue, window.bbn);
