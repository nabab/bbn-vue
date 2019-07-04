/**
 * @file bbn-treemenu component
 *
 * @description The bbn-treemenu component is a vertical menu that shows a hierarchical list of elements, with the possibility of searching for the desired element.
 * Very useful, it allows you to quickly find what the user is looking for, making it dynamic in the presentation, containing the items that satisfy the research.
 *
 * @copyright BBN Solutions
 *
 * @author BBN Solutions
 * 
 * @created 15/02/2017
 */

((bbn) => {
  "use strict";

  /**
   * Classic input with normalized appearance
   */
  Vue.component('bbn-treemenu', {
    /**
     * @mixin bbn.vue.basicComponent
     * @mixin bbn.vue.resizerComponent 
     */
    mixins: [bbn.vue.basicComponent, bbn.vue.resizerComponent],
    props: {
      /**
       * The placeholder on the search input of the tree
       * @prop {String} ['Search'] placeholder
       */
      placeholder: {
        type: String,
        default: "Search"
      },
      /**
       * The source of the tree
       * @prop {String|Array|Function} source
       */
      source: {
        type: [String, Array, Function],
        default(){
          return [];
        }
      },
      /**
       * @prop {Boolean} shortcuts
       */
      shortcuts: {
        type: Boolean,
        default: false
      },
      /**
       * The position top
       * @prop {Number} [0] top
       */
      top: {
        type: Number,
        default: 0
      },
      /**
       * The position bottom
       * @prop {Number} [0] bottom
       */
      bottom: {
        type: Number,
        default: 0
      },
      /**
       * The horizontal position
       * @prop {String} ['left'] position
       */
      position: {
        type: String,
        default: 'left'
      },
      
      /**
       * Set to true to have  tree's items expanded
       * @prop {Boolean} [false] opened
       */
      opened: {
        type: Boolean,
        default: false
      },
      /**
       * Set to false hide the search input
       * @prop {Boolean}  [false] search
       */
      search: {
        type: Boolean,
        default: true
      },
      //@todo not used
      hideable: {
        type: Boolean,
        default: true
      },
      /**
       * @prop {Array} [[]] menus
       */
      menus: {
        type: Array,
        default(){
          return [];
        }
      },
      /**
       * @prop current
       */
      current: {}
    },
    data(){
      let isAjax = !Array.isArray(this.source)
      return {
        /**
         * @data {String} [''] searchExp
         */
        searchExp: '',
        /**
         * Returns the value of the prop opened 
         * @data {Boolaen} isOpened
         */
        isOpened: this.opened,
        /**
         * @data {Boolean}  [false] hasBeenOpened
         */
        hasBeenOpened: false,
        /**
         * @data {Number} posTop
         */
        posTop: this.top,
        /**
         * @data {Number} posBottom
         */
        posBottom: this.bottom,
        /**
         * True if the type of the prop source is not Array
         * @data {Number} isAjax
         */
        isAjax: isAjax,
        /**
         * @data {Array} items
         */
        items: isAjax ? [] : this.source,
        /**
         * @data current
         */
        currentMenu: this.current
      };
    },
    methods: {
      /**
       * Creates the menu of the given node
       * @method getMenu
       * @param {Object} node 
       */
      getMenu(node){
        if ( !this.shortcuts || node.numChildren ){
          return [];
        }
        let obj = {
          url: node.data.link,
          icon: node.icon,
          text: node.text,
          id: node.data.id
        };
        return [{
          text: bbn._('Create a shortcut'),
          icon: 'nf nf-fa-external_link_alt',
          command: () => {
            this.$emit('shortcut', obj);
          }
        }];
      },
      /**
       * Defines the position of the component 
       * @methos _position 
       * @fires posObject
       * 
       */
      _position(){
        this.$el.style.top = this.posTop + 'px';
        this.$el.style.bottom = this.posBottom + 'px';
        this.$el.style[this.position === 'right' ? 'right' : 'left'] = this.isOpened ? 0 : -(this.$el.clientWidth + 40);
        this.$nextTick(() => {
          if ( this.isOpened ){
            this.getRef('search').focus();
          }
        });
      },
      /**
       * Defines position and width of the component
       * @method posObject 
       * @return {Object}
       */
      posObject(){
        let o = {};
        o[this.position === 'right' ? 'right' : 'left'] = this.isOpened ? 0 : -(this.$el.clientWidth + 40);
        return o;
      },
      /**
       * Shows the component
       * @method show
       * @fires _position
       */
      show(){
        this.isOpened = true;
        this._position();
      },
      /**
       * Hides the component
       * @method hide
       * @fires _position
       */
      hide(){
        if ( !this.hideable ){
          return;
        }
        this.isOpened = false;
        this._position();
      },
      /**
       * Shows/Hides the component
       * @method toggle
       * @fires hide
       * @fires show
       */
      toggle(){
        if ( this.isOpened ){
          this.hide();
        }
        else{
          this.show();
        }
      },
      /**
       * Maps the source of the tree
       * @method mapSrc
       * @param {Object} data 
       * @param {Number} idx 
       * @param {Number} level 
       * @return {Object}
       */
      mapSrc(data, idx, level){
        data.cls = 'bbn-treemenu-' + (level > 6 ? x : level);
        if ( level < 3 ){
          data.cls += ' bbn-bottom-sspace';
        }
        if ( data.items && data.items.length ){
          data.cls += ' bbn-b';
          data.selectable = false;
        }
        return data;
      },
      /**
       * Links to the prop link or url of the given item
       * @method go
       * @param {Object} node 
       * @param {Event} event 
       * @fires hide
       */
      go(node, event){
        //bbn.fn.log(node);
        event.preventDefault();
        if ( node && node.data && (node.data.link || node.data.url) ){
          bbn.fn.link(node.data.link || node.data.url);
          this.hide();
        }
      },
      /**
       * Handles the resize of the scroll
       * @method resizeScroll
       */
      resizeScroll(){
        if ( this.$refs.scroll ){
          this.$refs.scroll.onResize()
        }
      },
      /**
       * Reload the tree
       * @method reset
       * @fires tree.load
       */
      reset(){
        this.$refs.tree.reset();
        this.$refs.tree.load();
      },
      /**
       * Gets the data of the component
       * @method getData
       */
      getData(){
        return {menu: this.currentMenu};
      },
      /**
       * @method checkMouseDown
       * @param {Event} e 
       * @fires toggle
       */
      checkMouseDown(e){
        bbn.fn.log("checkMouseDown", this.isOpened);
        if ( this.isOpened &&
          !e.target.closest(".bbn-treemenu") &&
          !e.target.closest(".bbn-menu-button")
        ){
          e.preventDefault();
          e.stopImmediatePropagation();
          this.toggle();
        }
      },
      /**
       * Adds or removes the event listener for mousedown and touchstart
       * @method _setEvents
       * @param add 
       */
      _setEvents(add){
        if ( add ){
          document.addEventListener('mousedown', this.checkMouseDown);
          document.addEventListener('touchstart', this.checkMouseDown);
        }
        else{
          document.removeEventListener('mousedown', this.checkMouseDown);
          document.removeEventListener('touchstart', this.checkMouseDown);
        }
      }
    },
    /**
     * @event mounted
     * @fires onResize
     * @fires _position
     */
    mounted(){
      this.onResize();
      this._position();
      this.ready = true;
    },
    /**
     * @event created
     * @fires _setEvents
     */
    created(){
      this._setEvents();
    },
    /**
     * @event destroyed
     * @fires _setEvents
     */
    destroyed(){
      this._setEvents();
    },
    watch: {
      /**
       * @watch isOpened
       * @param {Boolean} newVal 
       * @fires tree.load
       * @fires _setEvents
       */
      isOpened(newVal){
        if ( newVal ){
          if ( !this.hasBeenOpened ){
            this.hasBeenOpened = true;
            this.$refs.tree.load();
          }
          this._setEvents(true);
        }
        else{
          this._setEvents();
        }
      },
      /**
       * @watch currentMenu
       * @fires reset
       */
      currentMenu(){
        this.reset()
      }
    }
  });

})(bbn);
