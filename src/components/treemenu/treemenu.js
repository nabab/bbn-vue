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

return {
    name: 'bbn-treemenu',
    /**
     * @mixin bbn.wc.mixins.basic
     * @mixin bbn.wc.mixins.resizer
     */
    mixins:
    [
      bbn.wc.mixins.basic,
      bbn.wc.mixins.resizer
    ],
    props: {
      /**
       * The placeholder on the search input of the tree.
       * @prop {String} ['Search'] placeholder
       */
      placeholder: {
        type: String,
        default: bbn._('Search')
      },
      /**
       * The source of the tree.
       * @prop {String|Array|Function} [[]] source
       */
      source: {
        type: [String, Array, Function],
        default(){
          return [];
        }
      },
      /**
       * @prop {Boolean} [false] shortcuts
       */
      shortcuts: {
        type: Boolean,
        default: false
      },
      /**
       * Set to false hide the search input.
       * @prop {Boolean} [true] search
       */
      search: {
        type: Boolean,
        default: true
      },
      /**
       * The array of menus.
       * @prop {Array} [[]] menus
       */
      menus: {
        type: Array,
        default(){
          return [];
        }
      },
      /**
       * The initial menu
       * @prop {String} current
       */
      current: {
        type: String
      }
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
         * True if the type of the prop source is not Array.
         * @data {Boolean} isAjax
         */
        isAjax: isAjax,
        /**
         * The menu's items.
         * @data {Array} items
         */
        items: isAjax ? [] : this.source,
        /**
         * The current menu.
         * @data {String} current
         */
        currentMenu: this.current || null,
        /**
         * The last menu.
         * @data [null] lastMenu
         */
        lastMenu: null
      };
    },
    computed: {
      /**
       * Defines position and width of the component.
       * @computed elementStyle
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
       * Creates the menu of the given node.
       * @method getMenu
       * @param {Object} node
       * @returns {Array}
       */
      getMenu(node){
        if ( !this.shortcuts || node.numChildren ){
          return [];
        }

        let obj = {
          url: node.data.link,
          icon: node.data.icon,
          text: node.data.text,
          id: node.data.id
        };
        return [{
          text: bbn._('Create a shortcut'),
          icon: 'nf nf-fa-external_link',
          action: () => {
            this.$emit('shortcut', obj);
          }
        }];
      },
      /**
       * Maps the source of the tree.
       * @method mapSrc
       * @param {Object} data
       * @param {Number} level
       * @return {Object}
       */
      mapSrc(data, level){
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
       * Links to the prop link or url of the given item.
       * @method go
       * @param {Object} node
       * @param {Event} event
       * @emits select
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
       * @fires $nextTick
       * @fires focusSearch
       */
      resizeScroll(){
        if ( this.$refs.scroll ){
          this.$refs.scroll.onResize()
        }
        let code = bbn.fn.md5(JSON.stringify(this.currentMenu));
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
       * @fires getRef
       */
      reset(){
        let tree = this.getRef('tree');
        if (bbn.fn.isVue(tree)) {
          tree.reset();
        }
      },
      /**
       * Gets the data of the component
       * @method getData
       * @returns {Object}
       */
      getData(){
        return {
          menu: this.currentMenu
        };
      },
      /**
       * Method triggered at '@ready' of the component to set the current menu.
       * @method readyTree
       * @fires $nextTick
       * @fires getRef
       * @fires reset
       */
      readyTree(){
        this.$nextTick(() => {
          let dd = this.getRef('dropdown');
          if (bbn.fn.isVue(dd)
            && dd.value
            && bbn.fn.getRow(this.menus, {value: dd.value})
            && (dd.value !== this.currentMenu)
          ){
            this.currentMenu = dd.value;
          }
          else {
            this.reset();
          }
        })
      },
      /**
       * Focuses the search input.
       * @method focusSearch
       * @focus getRef
       */
      focusSearch(){
        if (!bbn.fn.isMobile()) {
          let search = this.getRef('search');
          if (search) {
            search.focus();
          }
        }
      }
    },
    /**
     * Resizes the tree-menu and sets its prop 'ready' to true.
     * @event mounted
     * @fires onResize
     */
    mounted(){
      this.onResize();
      //this._position();
      this.ready = true;
    },
    watch: {
      /**
       * Resets the tree-menu when the current menu changes.
       * @watch currentMenu
       * @fires reset
       * @fires getRef
       */
      currentMenu(val){
        if ( (val !== null) && bbn.fn.isVue(this.getRef('tree')) ){
          this.reset();
        }
      }
    }
  };
