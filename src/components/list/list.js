/**
 * @file bbn-list component
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
  Vue.component('bbn-list', {
    /**
     * @mixin bbn.vue.basicComponent
     * @mixin bbn.vue.listComponent
     * @mixin bbn.vue.keynavComponent
     * @mixin bbn.vue.positionComponent
     * @mixin bbn.vue.keepCoolComponent
     * @mixin bbn.vue.resizerComponent
     * @mixin bbn.vue.eventsComponent
     * @mixin bbn.vue.componentInsideComponent
     */
    mixins: [
      bbn.vue.basicComponent,
      bbn.vue.listComponent,
      bbn.vue.keynavComponent,
      bbn.vue.positionComponent,
      bbn.vue.keepCoolComponent,
      bbn.vue.resizerComponent,
      bbn.vue.eventsComponent,
      bbn.vue.componentInsideComponent
    ],
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
        default: true
      },
      /**
       * The mode of the component.
       * Possible values: 'free', 'options', 'selection'.
       * @prop {String} ['free'] mode
       */
      mode: {
        type: String,
        default: "free",
        validator: m => ['free', 'options', 'selection'].includes(m)
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
        type: [Boolean, Number],
        default: false
      },
      /**
       * Alternates the background color on the list
       * @prop {Boolean} [false] alternateBackground
       */
      alternateBackground :{
        type: Boolean,
        default: false
      },
      groupable: {
        type: Boolean,
        default: false
      },
      sourceGroup: {
        type: String,
        default: 'group'
      },
      groupComponent: {
        type: [String, Object, Vue]
      },
      groupStyle: {
        type: String
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
        overIdx: -1,
        mouseLeaveTimeout: false,
        isOpened: true,
        scroll: null,
        hasScroll: false,
        currentComponent: null,
        tmpDisabled: false
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
      },
      filteredData(){
        let data = this.currentData;
        if (this.currentData.length
          && this.currentFilters
          && this.currentFilters.conditions
          && this.currentFilters.conditions.length
          && (!this.serverFiltering || !this.isAjax)
        ) {
          data = bbn.fn.filter(data, a => {
            return this._checkConditionsOnItem(this.currentFilters, a.data);
          });
        }
        if (this.groupable && this.sourceGroup) {
          let grouped = {},
              ungrouped = [];
          bbn.fn.each(data, d => {
            if (d.data[this.sourceGroup] !== undefined) {
              if (grouped[d.data[this.sourceGroup]] === undefined) {
                grouped[d.data[this.sourceGroup]] = [];
              }
              grouped[d.data[this.sourceGroup]].push(d);
            }
            else {
              ungrouped.push(d);
            }
          });
          data = [];
          bbn.fn.each(Object.values(grouped), g => data.push(...g));
          data.push(...ungrouped);
        }
        return data;
      },
    },
    methods: {
      /**
       * Manages the icon of the items.
       * @method _updateIconSituation
       */
      _updateIconSituation(){
        let hasIcons = false;
        bbn.fn.each(this.filteredData, a => {
          if ( a.data && a.data.icon ){
            hasIcons = true;
            return false;
          }
        });
        if ( hasIcons !== this.hasIcons ){
          this.hasIcons = hasIcons;
        }
      },
      mouseenter(e, idx){
        bbn.fn.log("Nouse ener");
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
      resetOverIdx(){
        bbn.fn.log("Reset OverIdx");
        if (this.suggest === false) {
          this.overIdx = -1;
        }
        else if (this.suggest === true) {
          this.overIdx = 0;
        }
        else if (this.filteredData[this.suggest]) {
          this.overIdx = this.suggest;
        }
      },
      mouseleave(){
        bbn.fn.log("Nouse leave");
        this.isOver = false;
        this.resetOverIdx();
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
      select(idx){
        if ( this.tmpDisabled === idx ){
          return;
        }
        this.tmpDisabled = idx;
        setTimeout(() => {
          this.tmpDisabled = false;
        }, 1000);
        let item = this.filteredData[idx] || null;
        let ev = new Event('select', {cancelable: true});
        if ( item && item.data && !item.data.disabled ){
          this.currentIndex = idx;
          if ( item.data[this.children] && item.data[this.children].length ){
            this.isOpened = !this.isOpened;
          }
          else{
            let v = item.data[this.sourceValue];
            if (!this.selected.includes(v)) {
              this.$emit("select", item.data, idx, item.index, ev);
            }
            if (!ev.defaultPrevented) {
              if ( (this.mode === 'selection') && !item.selected ){
                let prev = bbn.fn.getRow(this.filteredData, "selected", true);
                if ( prev ){
                  this.currentData[prev.index].selected = false;
                }
                item.selected = true;
              }
              else {
                item.selected = !item.selected;
              }
              if (v !== undefined) {
                if (item.selected) {
                  if (this.unique) {
                    this.selected.splice(0, this.selected.length);
                  }
                  if (!this.selected.includes(v)) {
                    this.selected.push(v);
                  }

                }
                else if (this.selected.includes(v)) {
                  this.selected.splice(this.selected.indexOf(v), 1);
                }
              }
              if ( item.data.action ){
                if ( typeof(item.data.action) === 'string' ){
                  if ( bbn.fn.isFunction(this[item.data.action]) ){
                    this[item.data.action]();
                  }
                }
                else if (bbn.fn.isFunction(item.data.action) ){
                  item.data.action(idx, item.data);
                }
              }
              else if ( item.data.url ) {
                bbn.fn.link(item.data.url);
              }
            }
          }
        }
      },
      unselect(value){
        bbn.fn.each(bbn.fn.filter(this.currentData, a => {
          return this.selected.includes(a.data[this.sourceValue]);
        }), a => {
          if (a.selected) {
            a.selected = false;
          }
        });
        this.selected.splice(0, this.selected.length);
      }
    },
    /**
     * @event created
     * @fires _updateIconSituation
     */
    created(){
      this.$on('dataloaded', () => {
        this._updateIconSituation();
      });
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
        setTimeout(() => {
          this.resetOverIdx();
        }, 50);
      });
    },
    watch: {
      /**
       * @watch currentOver
       * @param {Boolean} newVal 
       */
      overIdx(newVal, oldVal) {
        bbn.fn.log("overIdx is changing")
        this.keepCool(() => {
          bbn.fn.log("Scroll to?");
          if (this.hasScroll && newVal && !this.isOver) {
            bbn.fn.log("Scroll to!")
            this.closest('bbn-scroll').scrollTo(null, this.getRef('li' + newVal));
          }
        }, 'overIdx', 50)
      },
      /**
       * @watch source
       */
      source: {
        deep: true,
        handler(){
          if ( this.isAutobind ){
            this.updateData();
          }
        }
      },
      /*
      selected(){
        this.updateData();
      }
      */
    }

  });

})(window.Vue, window.bbn);

