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
       * Set to false hide the search input
       * @prop {Boolean}  [false] search
       */
      search: {
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
        currentMenu: null,
        lastMenu: null
      };
    },
    computed: {
      /**
       * Defines position and width of the component
       * @method elementStyle 
       * @return {Object}
       */
      elementStyle(){
        let o = {
          top: '0px',
          bottom: '0px'
        };
        let prop = this.position === 'right' ? 'right' : 'left';
        o[prop] = 0;
        if (!this.ready) {
          o.opacity = 0;
        }
        else if (!this.isOpened) {
          o[prop] = -(this.$el.clientWidth + 40) + 'px';
        }
        return o;
      }
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
          action: () => {
            this.$emit('shortcut', obj);
          }
        }];
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
        this.searchExp = '';
        if ( node && node.data && (node.data.link || node.data.url) ){
          bbn.fn.link(node.data.link || node.data.url);
          this.$emit('select', node, event);
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
        let code = md5(JSON.stringify(this.currentMenu));
        if (code !== this.lastMenu) {
          this.lastMenu = code;
          this.$nextTick(() => {
            this.focusSearch();
          })
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
      readyTree(){        
        this.$nextTick(() => {
          this.currentMenu = this.current;
        })
      },
      focusSearch(){
        let search = this.getRef('search');
        if (search) {
          search.focus();
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
      //this._position();
      this.ready = true;      
    },
    watch: {
      /**
       * @watch currentMenu
       * @fires reset
       */
      currentMenu(val){
        if ( (val !== null) && (this.$refs.tree !== undefined) ){         
          this.reset();         
        }        
      }
    }
  });

})(bbn);
