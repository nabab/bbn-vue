/**
 * @file bbn-lists component
 *
 * @description A fully customizable selectable list.
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
  Vue.component('bbn-slider-menu', {
    mixins: [bbn.vue.basicComponent, bbn.vue.listComponent, bbn.vue.keynavComponent, bbn.vue.resizerComponent],
    props: {
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
       * The source of the floater.
       * @prop {Function|Array|String|Object} source
       */
      source: {
        type: [Function, Array, String, Object]
      },
      //@todo not used
      options: {
        type: Object
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
        default: true
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
      expanded: {
        type: Array,
        default(){
          return [];
        }
      },
      suggest: {
        type: Boolean,
        default: false
      },
      selected: {
        type: Array,
        default(){
          return []
        }
      }
    },
    data(){
      return {
        currentSelected: this.selected.slice(),
        /**
         * @data {Number} [0] currentDepth
         */
        currentDepth: 0,
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
        hasScroll: false,
        currentComponent: null,
        selectedIndex: false,
        maxDepth: 0

      };
    },
    computed: {
      items(){
        bbn.fn.log("REDOING ITEMS");
        let depth = 0;
        let res = [{
          data: this.source,
          selected: true,
          visible: this.currentSelected.length === 0,
          last: false,
          depth: depth
        }];
        let sel = '';
        let list = this.source;
        bbn.fn.each(this.currentSelected, (a, i) => {
          if (sel) {
            sel += '.';
          }
          sel += a + '.' + this.children;
          let tmp = bbn.fn.getProperty(this.source, sel);
          bbn.fn.log(sel, tmp);
          if (tmp && tmp.length ) {
            list = tmp
            depth++;
            res.push({
              data: list,
              selected: true,
              visible: i === this.currentSelected.length - 1,
              last: i === this.currentSelected.length - 1,
              depth: depth
            });
          }
        });
        if (list && list.length) {
          let hasChildren = false;
          bbn.fn.each(list, (a) => {
            if (a[this.children] && a[this.children].length) {
              if (!hasChildren) {
                hasChildren = true;
                depth++;
              }
              res.push({
                data: a[this.children],
                selected: false,
                visible: false,
                last: true,
                depth: depth
              });
            }
          })
        }
        this.maxDepth = depth;
        return res;
      },
    },
    methods: {
      getStyle(item){
        let left = '100%';
        if (item.visible) {
          left = '0px';
        }
        else if (item.selected) {
          left = '-100%';
        }
        return {
          left: left
        }
      },
      mouseleave(){
        this.isOver = false;
        this.overIdx = this.suggest ? 0 : null;
      },
      remove(idx){
        //bbn.fn.log(this.currentData, idx);
        this.realDelete(idx);
      },
      /**
       * Handles the selection of the floater's items.
       * @method select
       * @param {Number} idx 
       * @fires closeAll
       * @emits select
       */
      select(itemIdx, dataIdx){
        bbn.fn.log("SELE", this.items[itemIdx], this.maxDepth);
        if ((this.items[itemIdx].depth < this.maxDepth) && this.items[itemIdx].data && this.items[itemIdx].data.length) {
          this.currentSelected.push(dataIdx)
        }
        this.$emit('select', this.items[itemIdx]);
        this.selectedIndex = dataIdx;
      },
      unselect(){
        this.selectedIndex = false;
        this.currentSelected.pop();
      },
      reset(){
        this.selectedIndex = false;
        this.currentSelected.splice(0, this.currentSelected.length);
      }
    },
    /**
     * @event mounted
     */
    mounted(){
      this.currentComponent = this.realComponent;
      if (!this.component && !this.template && this.$slots.default) {
        let tpl = this.getRef('slot').innerHTML;
        if (tpl) {
          this.currentTemplate = tpl;
          this.currentComponent = {
            props: ['source'],
            data(){
              return this.source;
            },
            template: this.currentTemplate
          };
        }
      }
      this.$nextTick(() => {
        if (this.$parent.$options && (this.$parent.$options._componentTag === 'bbn-scroll')) {
          this.hasScroll = true;
        }
        this.ready = true;
      });
    }

  });

})(window.Vue, window.bbn);

