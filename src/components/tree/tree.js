/**
 * @file bbn-tree component
 *
 * @description bbn-tree is the component that is easily implemented by allowing data to be displayed hierarchically using a tree structure.
 * The component can contain the data loaded only once or it can be created dynamically by making ajax calls, it also allows (after a correct configuration) to perform operations on them, for example drag & drop.
 *
 * @copyright BBN Solutions
 *
 * @author BBN Solutions
 *
 * @created 10/02/2017. 
 */


(function(bbn){
  "use strict";

  const NODE_PROPERTIES = ["selected", "selectedClass", "activeClass", "exp anded", "tooltip", "icon", "selectable", "text", "data", "cls", "component", "num", "source", "level", "items"];

  Vue.component('bbn-tree', {
    /**
     * @mixin bbn.vue.basicComponent 
     * @mixin bbn.vue.localStorageComponent 
     */
    mixins: [bbn.vue.basicComponent, bbn.vue.localStorageComponent],
    // The events that will be emitted by this component
    _emitter: ['dragstart', 'drag', 'dragend', 'select', 'open'],
    props: {
      /**
       * @prop {String} filterString
       */
      filterString: {
        type: String
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
       *  @prop {Boolean} [false] excludedSectionFilter
       */
      excludedSectionFilter: {
        type: Boolean,
        default: false
      },
      /**
       * The level until which the tree must be opened
       * @prop {Number} [0] minExpandLevel
       */
      minExpandLevel: {
        type: Number,
        default: 0
      },
      /**
       * True if the whole tree must be opened
       * @prop {Boolean} [false] opened
       */
      opened: {
        type: Boolean,
        default: false
      },
      /**
       * A function for mapping the tree data
       * @prop {Function} map
       */
      map: {
        type: Function,
      },
      /**
       * The data to send to the server
       * @prop {Object|Function} data
       */
      data: {
        type: [Object, Function],
        default(){
          return {};
        }
      },
      /**
       * An array of objects representing the nodes
       * @prop {Array|String|Object|Function} source
       */
      source: {
        Type: [Array, String, Object, Function]
      },
      /**
       * Set to false if the source shouldn't be loaded at mount time
       * @prop {Boolean} [true] autoload
       */
      autoload: {
        type: Boolean,
        default: true
      },
      /**
       * The class given to the node (or a function returning the class name)
       * @prop {Function|String} cls
       */
      cls: {
        type: [Function, String]
      },
      /**
       *  A component for the node
       * @prop {Function|String|Object} component
       */
      component: {
        type: [Function, String, Object]
      },
      /**
       * The data field used as UID
       * @prop {String} uid
       */
      uid: {
        Type: String
      },
      /**
       * Set to true for having the nodes draggable
       * @prop {Boolean} [false] draggable
       */
      draggable: {
        type: Boolean,
        default: false
      },
      /**
       * Set to true prepend a checkbox to the item
       * @prop {Boolean} [false] checkable
       */
      checkable: {
        type: Boolean,
        default: false
      },
      /**
       * An array (or a function returning one) of elements for the node context menu
       * @prop {Array|Function} menu
       */

      menu: {
        type: [Array, Function]
      },
      /**
       * An string (or a function returning one) for the icon's color
       * @prop {String|Function} iconColor
       */
      iconColor: {
        type: [String, Function]
      },
      /**
       * The value of the UID to send for the root tree
       * @prop {String|Number} root
       */
      root: {
        type: [String, Number]
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
       * Other trees where nodes can be dropped on
       * @prop {Arrayu} [[]] droppables
       */
      droppables: {
        type: Array,
        default(){
          return [];
        }
      },
      /**
       * Set to true allows to use an object for the tree items
       * @prop {Boolean} [false] object
       */
      object: {
        type: Boolean,
        default: false
      },
      /**
       * If set to false a draggable tree will not be able to drop on itself
       * @prop {Boolean} [true] selfDrop
       */
      selfDrop: {
        type: Boolean,
        default: true
      },
      /**
       * Helper to transform data when passing from one tree to another
       * @prop {Function} trasferData
       */
      transferData: {
        type: Function
      },
      /**
       * An array containing the expanded nodes idx
       * @prop {Array} [[]] expanded
       */
      expanded: {
        type: Array,
        default(){
          return [];
        }
      },
      /**
       * The opened path if there is one
       * @prop {Array} [[]] path
       */
      path: {
        type: Array,
        default(){
          return [];
        }
      },
      /**
       * Set to true allows to select multiple nodes in the tree
       * @prop {Boolean} [true] multiselect
       */
      multiselect: {
        type: Boolean,
        default: true
      },
      //@todo never used selectedValues
      selectedValues: {
        type: [Array, String],
        default(){
          return []
        }
      },
      value: {}
    },

    data(){
      let items = [];
      let isAjax = false;
      let isFunction = false;
      if ( (typeof(this.source) === 'string') ){
        isAjax = true;
      }
      else if ( bbn.fn.isFunction(this.source) ){
        isFunction = true;
      }
      else{
        if ( bbn.fn.isArray(this.source) ){
          items = this._map(this.source);
        }
        else if ( this.object ){
          items = this._objectMapper(this.source)
        }
        else{
          throw new Error(bbn._('The source of the tree must be an array or the object property must be set to true if it is an object'));
        }
      }
      return {
        /**
         * Only for the origin tree
         * @data {Boolean} [false] isRoot
         */
        isRoot: false,
        /**
         * The parent node if not root
         * @data {Boolean} [false] node
         */
        node: false,
        /**
         * The parent tree if not root
         * @data {Boolean} [false] tree
         */
        tree: false,
        /**
         * The URL where to pick the data from if isAjax
         * @data {String|Boolean} url
         */
        url: typeof(this.source) === 'string' ? this.source : false,
        /**
         * Is the data provided from the server side
         * @data {Boolean} [false] isAjax
         */
        isAjax: isAjax,
        /**
         * True when the data is currently loading in the tree (unique to the root)
         * @data {Boolean} [false] isFunction
         */
        isFunction: isFunction,
        /**
         * True when the data is currently loading in the tree (unique to the root)
         * @data {Boolean} [false] isLoading
         */
        isLoading: false,
        /**
         * True when the data is currently loading in the current tree
         * @data {Boolean} [false] loading
         */
        loading: false,
        /**
         * True once the data of the tree has been loaded
         * @data {Boolean} [false] isLoaded
         */
        isLoaded: false,
        /**
         * True once the component is mounted
         * @data {Boolean} [false] isMounted
         */
        isMounted: false,
        /**
         * The actual list of items (nodes)
         * @data {items} [Array] items
         */
        items: items,
        /**
         * The currently active node component object
         * @data {Boolean} [false] activeNode
         */
        activeNode: false,
        /**
         * The currently selected node component object
         * @data {Boolean} [false] selectedNode
         */
        selectedNode: false,
        /**
         * The component node object over which the mouse is now
         * @data {overNode} [false] overNode
         */
        overNode: false,
        /**
         * Dragging state, true if an element is being dragged
         * @data {Boolean} [false] dragging
         */
        dragging: false,
        /**
         * Real dragging will start after the mouse's first move, useful to kow if we are in a select or drag context
         * @data {Boolean} [false] realDragging
         */
        realDragging: false,
        /**
         * An array containing the indexes of checked nodes
         * @data {Array} [[]] checked
         */
        checked: [],
        /**
         * An array containing the indexes of disabled checkbox
         * @data {Array} [[]] disabled
         */
        disabled: [],
        /**
         * An array containing the indexes of expanded nodes
         * @data {Array} [[]] currentExpanded
         */
        currentExpanded: [],
        // @todo never used
        currentSelectedValues: []
      };
    },

    computed: {
      /**
       * @computed droppableTrees
       * @return {Array}
       */
      droppableTrees(){
        let r = this.selfDrop ? [this] : [];
        if ( this.droppables.length ){
          for ( let a of this.droppables ){
            r.push(a);
          }
        }
        return r;
      }
    },

    methods: {
      /**
       * Normalize the list of items basing on it's type
       * @method _objectMapper
       * @param {Array|Object} items 
       * @return {Object}
       */
      _objectMapper(items){
        let res = [];
        if ( bbn.fn.isArray(items) ){
          bbn.fn.each(items, (a, i) => {
            let num = 0;
            let o = {
              text: bbn._('Node') + ' ' + i,
              num_children: num
            };
            if ( bbn.fn.isArray(a) ){
              num = a.length;
            }
            else if ( a && (typeof a === 'object') ){
              num = bbn.fn.numProperties(a);
            }
            else if ( a ){
              o.text = typeof a === 'string' ? a : a.toString();
            }
            if ( num ){
              o.num_children = num;
              o[this.children] = this._objectMapper(a);
            }
            res.push(o);
          })
        }
        else if ( items && (typeof items === 'object') && bbn.fn.numProperties(items) ){
          bbn.fn.iterate(items, (a, n) => {
            let num = 0;
            let o = {
              text: n,
              num_children: num
            };
            if ( bbn.fn.isArray(a) ){
              num = a.length;
            }
            else if ( a && (typeof a === 'object') ){
              num = bbn.fn.numProperties(a);
            }
            else if ( a ){
              o.text = ('<strong>' + o.text + ': </strong>' + a);
            }
            if ( num ){
              o.num_children = num;
              o[this.children] = this._objectMapper(a);
            }
            res.push(o);
          });
        }
        return res;
      },
      /**
       * A function to normalize the structure of items
       * @method _map
       * @param {Array|Function} items 
       * @param {Number} level 
       * @fires map
       * @fires _map
       * @return {Array}
       */
      _map(items, level){
        if ( this.map ){
          let res = [];
          if ( !level ){
            level = 1; 
          }
          else{
            level++;
          }
          if ( bbn.fn.isFunction(items) ){
            items = items(this.level ? this : null);
          }
          bbn.fn.each(items, (a, i) => {
            let b = this.map(a, i, level);
            if ( b[this.children] ){
              b[this.children] = this._map(b[this.children], level);
            }
            res.push(b);
          });
          return res;
        }
        return items.slice();
      },
      /**
       * Returns the items basing on the prop isAjax and isFunction
       * @fires _map
       * @return {Array}
       */
      getItems(){
        let items = [];
        if ( !this.isAjax && !this.isFunction ){
          items = this._map(this.source);
        }
        return items;
      },
      /**
       * Resets the tree to the original configuration
       * @method reset
       * @fires load
       * @fires getItems
       */
      reset(){
        if ( this.isAjax ){
          this.isLoaded = false;
        }
        this.items = [];
        this.$forceUpdate();
        this.$nextTick(() => {
          if ( this.isAjax ){
            this.load();
          }
          else{
            this.items = this.getItems();
            this.$forceUpdate();
          }
        })
      },

      /**
       * Resize the root scroller
       * @method resize
       */
      resize(){
        if ( this.tree.$refs.scroll ){
          this.tree.$refs.scroll.onResize();
        }
      },

      /**
       * Make the root tree resize and emit an open event
       * @method onOpen
       * @fires resize
       * @emits open
       */
      onOpen(){
        this.resize();
        this.$emit('open');
        this.tree.$emit('open', this);
      },
      /**
       * Make the root tree resize and emit a close event
       * @method onClose
       * @fires resize
       * @emits close
       */
      onClose(){
        this.resize();
        this.$emit('close');
        this.tree.$emit('close', this);
      },

      /**
       * Find a node based on its props
       * @method _findNode
       * @param {Object} props 
       * @param {Object} node 
       * @return {Object}
       */
      _findNode(props, node){
        let ret = false;
        if ( node ){
          if ( node.numChildren && !node.isExpanded ){
            node.isExpanded = true;
          }
          if ( node.$children && node.numChildren && node.isExpanded && Object.keys(props) ){
            bbn.fn.each(node.$children, (n, i) => {
              if ( n.data ){
                let tmp = {};
                bbn.fn.each(Object.keys(props), (k, j) => {
                  if ( n.data[k] === undefined ){
                    return true;
                  }
                  tmp[k] = n.data[k];
                });
                if ( JSON.stringify(tmp) === JSON.stringify(props) ){
                  ret = n;
                }
              }
            });
          }
        }
        return ret;
      },

      /**
       * Find a node based on path
       * @method getNode
       * @param {Array} arr 
       * @param context 
       * @fires _findNode
       * @return {Object}
       */
      getNode(arr, context){
        let root = context || this.$refs.root;

        if ( arr ){
          if ( !bbn.fn.isArray(arr) ){
            arr = [arr];
          }
          arr = arr.map((v) => {
            if ( (typeof v === 'number') || (typeof v === 'string') ){
              return {idx: v}
            }
            return v;
          });
          let node = false;
          bbn.fn.each(arr, (v, i) => {
            node = this._findNode(v, root);
          });
          return node;
        }
      },

      /**
       * Returns the menu of a given node
       * @method getMenu
       * @param {Object} node 
       * @fires reload
       * @fires menu
       * @return {Array}
       */
      getMenu(node){
        let idx = $(node.$el).index();
        let menu = [];
        if ( node.numChildren ){
          menu.push({
            text: node.isExpanded ? bbn._("Close") : bbn._("Open"),
            icon: node.isExpanded ? 'nf nf-fa-arrow_circle_up' : 'nf nf-fa-arrow_circle_down',
            command: () => {
              node.isExpanded = !node.isExpanded;
            }
          });
        }
        if ( this.isAjax && node.numChildren && node.$refs.tree && node.$refs.tree[0].isLoaded ){
          menu.push({
            text: bbn._("Refresh"),
            icon: 'nf nf-fa-refresh',
            command: () => {
              this.reload(node);
            }
          })
        }
        if ( this.menu ){
          let m2 = bbn.fn.isFunction(this.menu) ? this.menu(node, idx) : this.menu;
          if ( m2.length ){
            bbn.fn.each(m2, function(a,i){
              menu.push({
                text: a.text,
                icon: a.icon ? a.icon : '',
                command: a.command ? () => {
                  a.command(node)
                } : false
              });
            })
          }
        }
        return menu;
      },

      
      /**
       * Returns an object with the data to send for a given node.
       * If UID has been given obj will only have this prop other the whole data object
       * @method dataToSend
       * @fires data
       * @return {Object}
       */
      dataToSend(){
        // The final object to send
        let r = {},
            uid = this.uid || this.tree.uid;
        // If the uid field is defined
        if ( uid ){
          // If an item has been given we send the corresponding data, or otherwise an empty string
          if ( this.node ){
            r[uid] = this.node.data && this.node.data[uid] ? this.node.data[uid] : '';
          }
          else if ( this.isRoot ){
            r[uid] = this.root ? this.root : '';
          }
        }
        else if ( this.node ){
          r = this.node.data;
        }
        else if (bbn.fn.isFunction(this.data) ){
          r = this.data();
        }
        else{
          r = this.data;
        }
        return r;
      },

      /**
       * Makes an object out of the given properties, adding to data all non existing props
       * @method normalize
       * @param {Object} obj 
       * @return {Boolean|Object}
       */
      normalize(obj){
        let r = {
          data: {}
        };
        if ( obj.text || obj.icon ){
          for ( let n in obj ){
            if ( obj.hasOwnProperty(n) && (typeof n === 'string') ){
              if ( NODE_PROPERTIES.indexOf(n) > -1 ){
                r[n] = obj[n];
              }
              else{
                r.data[n] = obj[n];
              }
            }
          }
          return r;
        }
        return false;
      },

      /**
       * Manages the key navigation inside the tree
       * @method keyNav
       * @param {Event} e The event
       */
      keyNav(e){
        e.preventDefault();
        e.stopImmediatePropagation();
        if ( this.tree.activeNode ){
          let idx = false,
              min = 1,
              max = this.tree.activeNode.$parent.$children.length - 1,
              parent = this.tree.activeNode.$parent;
          bbn.fn.each(this.tree.activeNode.$parent.$children, (a, i) => {
            if ( a === this.tree.activeNode ){
              idx = i;
              return false;
            }
          });
          bbn.fn.log("keyNav", idx, max, e.key);
          switch ( e.key ){
            case 'Enter':
            case ' ':
              this.tree.activeNode.isSelected = !this.tree.activeNode.isSelected;
              break;
            case 'PageDown':
            case 'End':
              if ( this.tree.activeNode ){
                this.tree.activeNode.isActive = false;
              }
              let node = this.$refs.root;
              while ( node.$children.length && node.isExpanded ){
                node = node.$children[node.$children.length-1];
              }
              node.isActive = true;
              break;

            case 'PageUp':
            case 'Home':
              if ( this.tree.activeNode ){
                this.tree.activeNode.isActive = false;
              }
              if ( this.$refs.root.$children[1] ){
                this.$refs.root.$children[1].isActive = true;
              }
              break;

            case 'ArrowLeft':
              if ( this.tree.activeNode.isExpanded ){
                this.tree.activeNode.isExpanded = false;
              }
              else if ( this.tree.activeNode.$parent !== this.$refs.root ){
                this.tree.activeNode.$parent.isActive = true;
              }
              break;
            case 'ArrowRight':
              if ( !this.tree.activeNode.isExpanded ){
                this.tree.activeNode.isExpanded = true;
              }
              break;
            case 'ArrowDown':
              if ( this.tree.activeNode.isExpanded && (this.tree.activeNode.items.length > 1) ){
                this.tree.activeNode.$children[1].isActive = true;
              }
              else if ( idx < max ){
                bbn.fn.log("ORKING");
                parent.$children[idx+1].isActive = true;
              }
              else {
                let c = this.tree.activeNode,
                    p = this.tree.activeNode.$parent;
                while ( (p.level > 0) && !p.$children[idx+1] ){
                  c = p;
                  p = p.$parent;
                  bbn.fn.each(p.$children, (a, i) => {
                    if ( a === c ){
                      idx = i;
                      return false;
                    }
                  });
                }
                if ( p.$children[idx+1] ){
                  p.$children[idx+1].isActive = true;
                }
              }
              break;
            case 'ArrowUp':
              if ( idx > min ){
                if ( parent.$children[idx - 1].isExpanded && parent.$children[idx - 1].items.length ){
                  let p = parent.$children[idx - 1],
                      c = p.$children[p.$children.length - 1];
                  while ( c.isExpanded && c.items.length ){
                    p = c;
                    c = p.$children[p.$children.length - 1];
                  }
                  c.isActive = true;
                }
                else{
                  parent.$children[idx - 1].isActive = true;
                }
              }
              else{
                if ( parent !== this.$refs.root ){
                  parent.isActive = true;
                }
                /*
                let c = this.tree.activeNode.$parent,
                    p = c.$parent,
                    idx = false;


                while ( p.$children[idx-1] && p.$children[idx-1].isExpanded && p.$children[idx-1].items.length ){
                  p = p.$children[idx-1];
                  idx = p.$children.length - 1;
                }
                if ( p.$children[idx-1] ){
                  p.$children[idx-1].isActive = true;
                }
                */
              }
              break;
          }
        }
        else if ( this.tree.selectedNode ){
          this.tree.activeNode = this.tree.selectedNode;
        }
      },

      /**
       * Reloads a node already loaded
       * @method reload
       * @param {Object} node 
       * @fires load
       * 
       */
      reload(node){
        if ( this.isAjax ){
          if ( !node ){
            if ( this.isRoot ){
              this.items = [];
              this.isLoaded = false;
              this.$nextTick(() => {
                this.load();
              })
            }
            else{
              this.node.isExpanded = false;
              this.node.$refs.tree[0].isLoaded = false;
              this.node.$forceUpdate();
              this.$nextTick(() => {
                this.node.isExpanded = true;
              })
            }
          }
          else if ( node.$refs.tree ){
            node.isExpanded = false;
            node.$refs.tree[0].isLoaded = false;
            node.$forceUpdate();
            this.$nextTick(() => {
              node.isExpanded = true;
            })
          }
        }
      },
      /**
       * @method mapper
       * @param {Function} fn 
       * @param {Array} data 
       * @fires mapper
       * @return {Array}
       */
      mapper(fn, data){
        let res = [];
        bbn.fn.each(data, (a, i) => {
          let tmp = fn(a);
          if ( tmp[this.children] ){
            tmp[this.children] = this.mapper(fn, tmp[this.children]);
          }
          res.push(tmp);
        });
        return res;
      },

      /**
       * Loads a node
       * @method load
       * @fires dataToSend
       * @emits load
       */
      load(){
        // It must be Ajax and not being already in loading state
        if ( this.isAjax && !this.tree.isLoading && !this.isLoaded ){
          this.tree.isLoading = true;
          this.loading = true;
          this.tree.$emit('beforeLoad', this.dataToSend());
          bbn.fn.post(this.tree.url, this.dataToSend(), (res) => {
            this.tree.isLoading = false;
            this.loading = false;
            if ( res.data ){
              this.items = this.tree._map(res.data);
              this.$emit('load', res);
              /*
              if ( this.tree.map ){
                this.items = this.mapper(this.tree.map, res.data);
              }
              else{
                this.items = res.data;
              }
              */
            }
            this.isLoaded = true;
          })
        }
      },
      /**
       * Opens the node corresponding to the prop 'path'
       * @method openPath
       * 
       */
      openPath(){
        if ( this.path.length ){
          let path = this.path.slice(),
              criteria = path.shift(),
              idx = -1;
          if ( typeof(criteria) === 'object' ){
            idx = bbn.fn.search(this.items, {data: criteria});
          }
          else if ( this.tree.uid ){
            let cr = {};
            cr[this.tree.uid] = criteria;
            idx = bbn.fn.search(this.items, cr);
          }
          else if ( typeof(criteria) === 'number' ){
            idx = criteria;
          }
          bbn.fn.log("OopenPath", path, idx, criteria, this.items);
          if ( idx > -1 ){
            bbn.fn.each(this.items, (a, i) => {
              if ( i !== idx ){
                this.$set(this.items[idx], "path", []);
              }
            })
            if ( path.length ){
              this.$children[idx].isExpanded = true;
              this.$children[idx].path = path;
            }
            else{
              this.$set(this.items[idx], "selected", true);
            }
          }
        }
        else {
          //this.$set(this.items[idx], "path", []);
        }
      },

      /**
       * Unselects the currently selected node
       * @method unselect
       */
      unselect(){
        if ( this.tree.selectedNode ){
          this.tree.selectedNode.isSelected = false;
        }
      },

      /**
       * Deactivate the active node
       * @method deactivateAll
       */
      deactivateAll(){
        if ( this.tree.activeNode ){
          this.tree.activeNode.isActive = true;
        }
      },

      /**
       * Returns true if the first argument node descends from the second
       * @method isNodeOf
       * @param {Object} childNode 
       * @param {Object} parentNode 
       * @return {Boolean}
       */
      isNodeOf(childNode, parentNode){
        childNode = bbn.vue.closest(childNode, 'bbn-tree-node');
        while ( childNode ){
          if ( childNode === parentNode ){
            return true;
          }
          childNode = bbn.vue.closest(childNode, 'bbn-tree-node');
        }
        return false;
      },

      /**
       *  Moves a node to or inside a tree
       * @method move
       * @param {Object} node 
       * @param {Object} target 
       * @param {Number} index 
       */
      move(node, target, index){
        let idx = $(node.$el).index(),
            parent = node.parent;
        if ( idx > -1 ){
          if ( !target.numChildren ){
            target.numChildren = 1;
            target.$forceUpdate();
          }
          else{
            target.numChildren++;
          }
          this.$nextTick(() => {
            let targetTree = target.$refs.tree[0];
            parent.numChildren--;
            let params = parent.items.splice(idx, 1)[0];
            targetTree.items.push(params);
            if ( !targetTree.isExpanded ){
              targetTree.isExpanded = true;
            }
            parent.$forceUpdate();
            target.$forceUpdate();
          });
        }
      },

      /*
      // dragging action
      drag(e){
        if ( this.tree.dragging ){
          e.preventDefault();
          e.stopImmediatePropagation();
          $(this.$el).find(".dropping").removeClass("dropping");
          bbn.fn.log(e);
          let $container = $(e.target).offsetParent(),
              top = e.layerY,
              left = e.layerX,
              p;
          while ( $container[0] !== this.$refs.scroll.$refs.scrollContent ){
            p = $container.position();
            top += p.top;
            left += p.left;
            $container = $container.offsetParent();
          }
          this.tree.$refs.helper.style.left = left + 'px';
          this.tree.$refs.helper.style.top = top + 'px';
          let ok = false;
          if (
            this.overNode &&
            (this.tree.dragging !== this.overNode) &&
            !this.isNodeOf(this.overNode, this.tree.dragging)
          ){
            let $t = $(e.target);
            $t.parents().each((i, a) => {
              if ( a === this.overNode.$el ){
                ok = 1;
                return false;
              }
              else if ( a === this.$el ){
                return false;
              }
            });
          }
          if ( ok ){
            $(this.overNode.$el).children("span.node").addClass("dropping");
          }
          else{
            this.overNode = false;
          }
        }
      },
      */

      /**
       * Returns an object with all the unknown properties of the node component
       * @param {Object} data 
       * @return {Object}
       */
      toData(data){
        let r = {};
        for ( let n in data ){
          if ( NODE_PROPERTIES.indexOf(n) === -1 ){
            r[n] = data[n];
          }
        }
        return r;
      }
    },

    /**
     * Definition of the root tree and parent node
     * @event created
     * @fires _map
     */
    created(){
      let cp = bbn.vue.closest(this, 'bbn-tree');
      if ( !cp ){
        this.isRoot = true;
        this.node = false;
        this.tree = this;
      }
      else{
        while ( cp && cp.level ){
          cp = bbn.vue.closest(cp, 'bbn-tree');
        }
        if ( cp && !cp.level ){
          this.tree = cp;
          this.isAjax = this.tree.isAjax;
        }
        this.node = bbn.vue.closest(this, 'bbn-tree-node');
      }
      if ( this.isFunction ){
        this.items = this._map(this.source(this.level ? this.node : null));
      }
      if ( !this.isAjax || this.items.length ){
        this.isLoaded = true;
      }
    },
    /**
     * @event mounted
     * @fires load
     */
    mounted(){
      if ( this.isRoot && this.autoload ){
        this.load();
      }
      else if ( this.isExpanded ){
        this.load();
      }
      this.ready = true;
    },

    watch: {
      /**
       * @watch activeNode
       * @param {Object} newVal 
       */
      activeNode(newVal){
        if ( newVal ){
          this.$refs.scroll.scrollTo(0, newVal.$el);
        }
      },
      /**
       * @watch path
       * @param newVal 
       * @emits pathChange
       */
      path(newVal){
        bbn.fn.log("Change path", newVal);
        this.$emit('pathChange');
      },
      /**
       * @watch source
       * @fires reset
       * @fires load
       */
      source(){
        this.reset();
        this.load();
      }
    },

    components: {
      /**
       * @component bbn-tree-node
       */
      'bbn-tree-node': {
        name: 'bbn-tree-node',
        props: {
          /**
           * @prop {String} filterString
           * @memberof bbn-tree-node
           */
          filterString: {
            type: String
          },
          /**
           * @prop {Boolean} [false] excludedSectionFilter
           * @memberof bbn-tree-node
           */
          excludedSectionFilter: {
            type: Boolean,
            default: false
          },
          /**
           * True if the node is the one selected
           * @prop {Boolean} [false] selected
           * @memberof bbn-tree-node
           */
          selected:{
            type: Boolean,
            default: false
          },
          /**
           * True if the node is expanded (opened)
           * @prop {Boolean} [false] expanded
           * @memberof bbn-tree-node
           */
          expanded:{
            type: Boolean,
            default: false
          },
          /**
           * A message to show as tooltip
           * @prop {String} tooltip
           * @memberof bbn-tree-node
           */
          tooltip: {
            type: String
          },
          /**
           * The icon - or not
           * @prop {Boolean|String} icon
           * @memberof bbn-tree-node
           */
          icon:{
            type: [Boolean, String]
          },
          /**
           * True if the node is selectable
           * @prop {Boolean} [true] selectable
           * @memberof bbn-tree-node
           */
          selectable: {
            type: Boolean,
            default: true
          },
          /**
           * True if the node is checkable
           * @prop {Boolean} [true] checkable
           * @memberof bbn-tree-node
           */
          checkable: {
            type: Boolean,
            default: true
          },
          /**
           * The text inside the node, its title
           * @prop {String} text
           * @memberof bbn-tree-node
           */
          text: {
            type: String
          },
          /**
           * The data attached to the node
           * @prop {Object} [{}] data
           * @memberof bbn-tree-node
           */
          data: {
            type: Object,
            default(){
              return {};
            }
          },
          /**
           * The opened path if there is one
           * @prop {Array} [[]] path
           * @memberof bbn-tree-node
           */
          path: {
            type: Array,
            default(){
              return [];
            }
          },
          /**
           * A class to give to the node
           * @prop {String} cls
           * @memberof bbn-tree-node
           */
          cls: {
            type: [String]
          },
          /**
           * A component for the node
           * @prop {String|Function|Vue} component
           * @memberof bbn-tree-node
           */
          component: {
            type: [String, Function, Vue]
          },
          /**
           * The number of children of the node
           * @prop {Number} num
           * @memberof bbn-tree-node
           */
          num: {
            type: Number
          },
          /**
           * The list of children from the node
           * @prop {Array} [[]] source
           * @memberof bbn-tree-node
           */
          source: {
            type: Array,
            default(){
              return [];
            }
          },
          /**
           * Node's level (see tree)
           * @prop {Number} [1] level
           * @memberof bbn-tree-node
           */
          level: {
            type: Number,
            default: 1
          },
          /**
           * @prop {Number} idx
           * @memberof bbn-tree-node
           */
          idx: {
            type: Number
          }
        },

        data: function(){
          return {
            /**
             * @data {Boolean} [false] double
             * @memberof bbn-tree-node
             */
            double: false,
            /**
             * The parent tree
             * @data {Boolean} [false] parent
             * @memberof bbn-tree-node
             */
            parent: false,
            /**
             * The root tree
             * @data {Boolean} [false] tree
             * @memberof bbn-tree-node
             */
            tree: false,
            /**
             * Sanitized list of items
             * @data {Array} items
             * @memberof bbn-tree-node
             */
            items: this.source.slice(),
            /**
             * True if the node is active
             * @data {Boolean} [false] isActive
             * @memberof bbn-tree-node
             */
            isActive: false,
            /**
             * True if the node is selected
             * @data {Boolean} isSelected
             * @memberof bbn-tree-node
             */
            isSelected: !!this.selected,
            /**
             * True if the node is expanded
             * @data {Boolean} isExpanded
             * @memberof bbn-tree-node
             */
            isExpanded: this.expanded,
            /**
             * The number of children
             * @data {Number} numChildren
             * @memberof bbn-tree-node
             */
            numChildren: this.num !== undefined ? this.num : this.source.length,
            /**
             * The animation of the node
             * @data {Boolean} animation
             * @memberof bbn-tree-node
             */
            animation: this.level > 0,
            /**
             * True if the component bbn-tree-node is mounted
             * @data {Boolean} [false] isMounted
             * @memberof bbn-tree-node
             */
            isMounted: false,
            /**
             * @data {Boolean} [false] isMatch
             * @memberof bbn-tree-node
             */
            isMatch: true,
            /**
             * @data {Number} [0] numMatches
             * @memberof bbn-tree-node
             */
            numMatches: 0,
            /**
             * @data {Boolean} [false] excludedFilter
             * @memberof bbn-tree-node
             */
            excludedFilter: false
          }
        },
        computed: {
          /**
           * The style of the item's icon
           * @computed iconStyle
           * @return {Object}
           * @memberof bbn-tree-node
           */
          iconStyle(){
            let style = {};
            if ( this.tree.iconColor ){
              style.color =bbn.fn.isFunction(this.tree.iconColor) ? this.tree.iconColor(this) : this.tree.iconColor;
            }
            return style;
          },
          /**
           * @computed menu
           * @return {Function}
           * @memberof bbn-tree-node
           */
          menu(){
            return this.getMenu()
          }
        },
        methods: {
          /**
           * Return true if the node is checked
           * @method isChecked
           * @memberof bbn-tree-node
           */
          isChecked(){
           return this.tree.checked.indexOf(this.data[this.tree.uid])  > -1
          },
          /**
           * Return true if the node is disabled
           * @method isDisabled
           * @memberof bbn-tree-node
           */
          isDisabled(){
            return this.tree.disabled.indexOf(this.data[this.tree.uid]) > -1
          },
          /**
           * Checks the node and emits the events check and uncheck
           * @method checkNode
           * @emits check
           * @emits uncheck
           * @memberof bbn-tree-node
           */
          checkNode(val){
            if ( val && this.data[this.tree.uid] && (this.tree.checked.indexOf(this.data[this.tree.uid]) === -1) ){
              this.tree.checked.push(this.data[this.tree.uid]);
              this.tree.$emit('check', this.data[this.tree.uid]);
            }
            else if ( !val ){
              let tmp = this.tree.checked.indexOf(this.data[this.tree.uid]);
              if ( tmp > -1 ){
                this.tree.checked.splice(tmp, 1);
                this.tree.$emit('uncheck', this.data[this.tree.uid]);
              }
            }
          },
           /**
           * Activate the node
           * @method activate
           * @fires activate
           * @memberof bbn-tree-node
           */
          activate(){
            let ev = new Event('activate');
            this.tree.$emit('activate', this, ev);
          },
          remove(){

          },
          update(attr){
            for ( let n in attr ){
              this[n] = attr[n];
            }
          },
          add(obj){

          },
          /**
           * Resize the parent tree
           * @method tree.resize
           * @memberof bbn-tree-node
           */
          resize(){
            this.tree.resize();
          },
          /**
           * Gets the menu of the parent tree
           * @method getMenu
           * @memberof bbn-tree-node
           * @fires tree.getMenu
           */
          getMenu(){
            return this.tree.getMenu(this);
          },
          beforeEnter(){
            if ( this.animation ){
              alert("beforeEnter " + $(this.$refs.container).height());
            }
          },
          enter(){
            if ( this.animation ){
              alert("enter " + $(this.$refs.container).height());
            }
          },
          afterEnter(){
            if ( this.animation ){
              alert("afterEnter " + $(this.$refs.container).height());
            }
          },
          /**
           * Handles the start of dragging of the tree
           * @method startDrag  
           * @param {Event} e The event
           * @memberof bbn-tree-node
           */
          startDrag(e){
            if ( !this.double && this.tree.draggable ){
              e.preventDefault();
              e.stopImmediatePropagation();
              this.tree.dragging = this;
              if ( this.tree.droppableTrees.length ){
                bbn.fn.each(this.tree.droppableTrees, (a, i) => {
                  if ( a !== this.tree ){
                    a.dragging = this;
                  }
                });
              }
              $(document.body).one('mouseup', this.endDrag);
              $(document.body).on("mousemove", this.drag);
            }
          },
          /**
           * Handles the dragging of the node
           * @method drag  
           * @param {Event} e The event
           * @emits tree.dragStart
           * @emits  dragOver
           * @memberof bbn-tree-node
           */
          drag(e){
            bbn.fn.log("DS");
            e.stopImmediatePropagation();
            e.preventDefault();
            this.tree.$refs.helper.style.left = (e.pageX + 20) + 'px';
            this.tree.$refs.helper.style.top = e.pageY + 'px';
            if ( !this.tree.realDragging ){
              if ( this.tree.selectedNode ){
                this.tree.selectedNode.isSelected = false;
              }
              let ev = new Event("dragStart");
              this.tree.$emit("dragStart", this, ev);
              if (!ev.defaultPrevented) {
                this.tree.realDragging = true;
                let helper = this.tree.$refs.helper;
                helper.innerHTML = this.$el.outerHTML;
                $(helper).appendTo(document.body);
              }
            }
            else{
              for ( let a of this.tree.droppableTrees ){
                $(a.$el).find(".dropping").removeClass("dropping");
              }
              let ok = false;
              for ( let a of this.tree.droppableTrees ){
                if (
                  a.overNode &&
                  (a.dragging !== a.overNode) &&
                  !a.isNodeOf(a.overNode, this.tree.dragging) &&
                  (!a.overNode.$refs.tree || (a.overNode.$refs.tree[0] !== this.parent))
                ){
                  let $t = $(e.target);
                  $t.parents().each((i, b) => {
                    if ( b === a.overNode.$el ){
                      ok = 1;
                      return false;
                    }
                    else if ( b === this.$el ){
                      return false;
                    }
                  });
                }
                if ( ok ){
                  let ev = new Event("dragOver", {cancelable: true});
                  a.$emit("dragOver", this, ev, a.overNode);
                  if (!ev.defaultPrevented) {
                    bbn.fn.each(a.overNode.$el.chilNodes, (ele) => {
                      if ((ele.tagName === 'SPAN') && (ele.classList.contains('node'))) {
                        ele.classList.add('dropping');
                        return false;
                      }
                    })
                  }
                }
                else{
                  a.overNode = false;
                }
              }
            }
          },
          /**
           * Handles the end of dragging
           * @method endDrag
           * @param {Event} e The event
           * @emits tree.dragEnd
           * @memberof bbn-tree-node
           */
          endDrag(e){
            e.preventDefault();
            e.stopImmediatePropagation();
            if ( this.tree.realDragging ){
              $(this.tree.$refs.helper).appendTo(this.tree.$refs.helperContainer).empty();
              this.tree.realDragging = false;
              if ( this.tree.droppableTrees.length ){
                for ( let a of this.tree.droppableTrees ){
                  if (
                    a.overNode &&
                    (this.tree.dragging !== a.overNode) &&
                    !a.isNodeOf(a.overNode, this.tree.dragging)
                  ){
                    $(a.overNode.$el).children("span.node").removeClass("dropping");
                    let ev = new Event("dragEnd", {cancelable: true});
                    a.tree.$emit("dragEnd", ev, this, a.overNode);
                    if ( !ev.defaultPrevented ){
                      if ( a === this.tree ){
                        this.tree.move(this, a.overNode);
                      }
                    }
                  }
                }
              }
              else{
                let ev = new Event("dragEnd");
                this.tree.$emit("dragEnd", this, ev);
              }
            }
            $(document.body).off("mousemove", this.drag);
            for ( let a of this.tree.droppableTrees ){
              a.dragging = false;
            }
            /*
            if (
              this.tree.overNode &&
              (this.tree.dragging !== this.tree.overNode) &&
              !this.tree.isNodeOf(this.tree.overNode, this.tree.dragging)
            ){
              this.tree.move(this, this.tree.overNode);
            }
            */
          },
          /**
           * Defines the parent tree overNode
           * @method mouseOver
           * @memberof bbn-tree-node
           */
          mouseOver(){
            this.tree.overNode = this;
          },
          /**
           * @method checkPath
           * @memberof bbn-tree-node
           */
          checkPath(){
            if ( this.tree.path.length > this.level ){
              let item = this.tree.path.slice(this.level, this.level + 1)[0],
                  type = typeof item,
                  match = false;
              if ( (type === 'object') && (bbn.fn.search([this.data], item) === 0) ){
                match = true;
              }
              else if ( this.tree.uid && this.data[this.tree.uid] && (this.data[this.tree.uid] === item) ){
                match = true;
              }
              else if ( (type === 'number') && (this.idx === item) ){
                match = true;
              }
              if ( match ){
                if ( this.tree.path.length > (this.level + 1) ){
                  this.isExpanded = true;
                }
                else{
                  if ( this.numChildren ){
                    this.isExpanded = true;
                  }
                  this.isSelected = true;
                  this.tree.$refs.scroll.scrollTo(0, this.$el);
                }
              }
            }
          },
          // @todo never used
          getPath(numeric){
            let r = [],
                parent = this;
            while ( parent ){
              if ( this.tree.uid ){
                r.unshift(parent.data[this.tree.uid]);
              }
              else if ( numeric ){
                r.unshift(parent.index);
              }
              else{
                r.unshift(parent.data);
              }
              parent = bbn.vue.closest(parent, 'bbn-tree-node');
            }
            return r;
          }
        },
        /**
         * Defines the props tree and parent of the node
         * @event created
         * @memberof bbn-tree-node
         */
        created(){
          this.parent = bbn.vue.closest(this, 'bbn-tree');
          this.tree = this.parent.tree || this.parent;
        },
        /**
         * @event mounted
         * @fires checkPath
         * @fires resize
         */
        mounted(){
          if ( this.tree.opened ){
            this.isExpanded = true;
          }
          else if ( this.level < this.tree.minExpandLevel ){
            this.isExpanded = true;
          }
          this.$nextTick(() => {
            if ( !this.animation ){
              setTimeout(() => {
                this.animation = true;
              }, 500)
            }
            this.isMounted = true;
            this.$nextTick(() => {
              this.checkPath();
            });
            this.resize();
            this.ready = true;
            /*
            $(this.$el)
              .draggable({
                //containment: this.tree.$refs.scroll.$refs.scrollContent,
                //appendTo: this.tree.$refs.scroll.$refs.scrollContent,
                //appendTo: document.body,
                helper: "clone",
                opacity: 0.6,
                drag: (e, ui) => {
                  //let posY = ui.top;
                  //bbn.fn.log(e.pageY, e, ui);
                }
              })
              .children(".node")
              .droppable({
                accept: '.bbn-tree-node',
                hoverClass: 'dropping'
              });
              */
          })
        },
        watch: {
          /**
           * @watch double
           * @param {Boolean} newVal 
           * @memberof bbn-tree-node
           */
          double(newVal){
            if ( newVal ){
              setTimeout(() => {
                this.double = false
              }, 500);
            }
          },
          /**
           * @watch isExpanded
           * @param {Boolean} newVal 
           * @fires tree.load
           * @fires resize
           * @fires tree.isNodeOf
           * @memberof bbn-tree-node
           */
          isExpanded(newVal){
            if ( newVal ){
              if ( this.numChildren && !this.$refs.tree[0].isLoaded ){
                this.$refs.tree[0].load();
              }
              else{
                this.resize();
              }
            }
            else{
              if ( this.tree.selectedNode && this.tree.isNodeOf(this.tree.selectedNode, this) ){
                this.isSelected = true;
              }
              this.resize();
            }
          },
          /**
           * @watch isSelected
           * @param {Boolean} newVal 
           * @param {Boolean} oldVal 
           * @emits tree.unselect
           * @emits tree.select
           * @memberof bbn-tree-node
           */
          isSelected(newVal, oldVal){
            if ( newVal ){
              if ( this.tree.selectedNode ){
                this.tree.selectedNode.isSelected = false;
                this.tree.$emit('unselect', this);
              }
              let ev = new Event('select');
              this.tree.$emit('select', this, ev);
              this.tree.selectedNode = this;
            }
          },
          /**
           * @watch isActive
           * @param {Boolean} newVal 
           * @emits tree.activate
           * @emits tree.deactivate
           * @memberof bbn-tree-node
           */
          isActive(newVal){
            if ( this.tree.activeNode ){
              this.tree.selectedNode.isActive = false;
            }
            this.tree.activeNode = this;
            this.tree.$emit(newVal ? 'activate' : 'deactivate', this);
          },
          /**
           * @watch filterString
           * @param {String} newVal 
           * @memberof bbn-tree-node
           */
          filterString(newVal){
            this.numMatches = 0;
            if ( !newVal ){
              this.isMatch = true;
            }
            else{
              this.isMatch = bbn.fn.compare(this.text, newVal, 'icontains');

              let childrens = this.findAll('bbn-tree-node'),
                  ctrl = false;

              if ( this.isMatch ){
                let vm = this;
                if ( this.excludedSectionFilter && childrens.length ){
                  ctrl = false;
                  childrens.forEach( node => {
                    if ( bbn.fn.compare(node.text, newVal, 'icontains') ){
                      ctrl = true;
                    }
                    node.$set(node, 'excludedFilter',true);
                  });
                  // if ( !ctrl ){
                  //   bbn.fn.each(this.findAll('bbn-tree-node'), node => {
                  //     node.$set(node, 'excludedFilter', true);
                  //   });
                  // }
                }
                if ( vm.parent && vm.parent.node ){
                  vm = vm.parent.node;
                  while ( vm ){
                    vm.numMatches++;
                    vm = vm.parent.node;
                  }
                }
              }
              else if ( this.excludedSectionFilter  ){
                ctrl = false;
                if ( childrens.length ){
                  bbn.fn.each(childrens, node => {
                    if (  bbn.fn.compare(node.text, newVal, 'icontains') ){
                      ctrl = true;
                    }
                    node.$set(node, 'excludedFilter',false);
                  });
                  if ( !ctrl ){
                    this.$set(this,'excludedFilter',false);
                  }
                }
              }
            }
          }
        }
      }
    }
  });

})(bbn);
