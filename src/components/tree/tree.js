/**
 * @file bbn-tree component
 * @description bbn-tree is the component that is easily implemented by allowing data to be displayed hierarchically using a tree structure.
 * The component can contain the data loaded only once or it can be created dynamically by making ajax calls, it also allows (after a correct configuration) to perform operations on them, for example drag & drop.
 * @copyright BBN Solutions
 * @author BBN Solutions
 * @created 10/02/2017
 */

return {
  /**
   * @mixin bbn.wc.mixins.basic
   * @mixin bbn.wc.mixins.localStorage
   * @mixin bbn.wc.mixins.list
   */
  mixins:
  [
    bbn.wc.mixins.basic,
    bbn.wc.mixins.localStorage,
    bbn.wc.mixins.list
  ],
  static() {
    const NODE_PROPERTIES = [
      'text',
      'icon',
      'num',
      'numChildren',
      'data',
      'cls',
      'selectedClass',
      'activeClass',
      'selection',
      'selectable',
      'multiple',
      'filterable',
      'sortable',
      'selected',
      'expanded',
      'component',
      'tooltip',
      'path',
      'visible'
    ];
  },
  props: {
    /**
     *  @prop {Boolean} [false] excludedSectionFilter
     */
    excludedSectionFilter: {
      type: Boolean,
      default: false
    },
    /**
     * The level until which the tree must be opened.
     * @prop {Number} [0] minExpandLevel
     */
    minExpandLevel: {
      type: Number,
      default: 0
    },
    /**
     * True if the whole tree must be opened.
     * @prop {Boolean} [false] opened
     */
    opened: {
      type: Boolean,
      default: false
    },
    /**
     * An array of objects representing the nodes.
     * @prop {(Array|String|Object|Function)} source
     */
    source: {
      Type: [Array, String, Object, Function]
    },
    /**
     * The class given to the node (or a function returning the class name).
     * @prop {(Function|String)} cls
     */
    cls: {
      type: [Function, String]
    },
    /**
     * A component for the entire node block.
     * @prop {(Function|String|Object)} component
     */
    component: {
      type: [Function, String, Object]
    },
    /**
     * A component for the node.
     * @prop {(Function|String|Object)} itemComponent
     */
    itemComponent: {
      type: [Function, String, Object]
    },
    /**
     * Set to true to have the nodes draggable.
     * @prop {Boolean} [false] draggable
     */
    draggable: {
      type: Boolean,
      default: false
    },
    /**
     * An array (or a function returning one) of elements for the node context menu.
     * @prop {(Array|Function)} menu
     */
    menu: {
      type: [Array, Function]
    },
    /**
     * Set to true to use the icon given in the source object of the node.
     * @prop {Boolean} [true] icons
     */
    icons: {
      type: Boolean,
      default: true
    },
    /**
     * An string (or a function returning one) for the icon's color.
     * @prop {(String|Function)} iconColor
     */
    iconColor: {
      type: [String, Function]
    },
    /**
     * The value of the UID to send for the root tree.
     * @prop {(String|Number)} root
     */
    root: {
      type: [String, Number]
    },
    /**
     * The hierarchy level, root is 0, and for each generation 1 is added to the level.
     * @prop {Number} [0] level
     */
    level: {
      type: Number,
      default: 0
    },
    /**
     * Other trees where nodes can be dropped on.
     * @prop {Array} [[]] droppables
     */
    droppables: {
      type: Array,
      default(){
        return [];
      }
    },
    /**
     * Set to true allows to use an object for the tree items.
     * @prop {Boolean} [false] object
     */
    object: {
      type: Boolean,
      default: false
    },
    /**
     * If set to false a draggable tree will not be able to drop on itself.
     * @prop {Boolean} [true] selfDrop
     */
    selfDrop: {
      type: Boolean,
      default: true
    },
    /**
     * Helper to transform data when passing from one tree to another.
     * @prop {Function} transferData
     */
    transferData: {
      type: Function
    },
    /**
     * The opened path if there is one.
     * @prop {Array} [[]] path
     */
    path: {
      type: Array,
      default(){
        return [];
      }
    },
    /**
     * Set to true for a selectable tree.
     * @prop {Boolean} [true] selectable
     */
    selectable: {
      type: Boolean,
      default: true
    },
    /**
     * @prop {Boolean} [true] hierarchy
     */
    hierarchy: {
      type: Boolean,
      default: true
    },
    /**
     * The string to use as quick filter in the tree.
     * @prop {String} [''] quickFilter
     */
    quickFilter: {
      type: String,
      default: ''
    },
    /**
     * The order of items.
     * @prop {Array} [[{field: 'num', dir: 'DESC'}, {field: 'text', dir: 'ASC'}]] order
     */
    order: {
      type: Array,
      default(){
        return [{
          field: 'num',
          dir: 'ASC'
        }]
      }
    },
    /**
     * @prop {Object} [{}] state
     */
    state: {
      type: Object,
      default(){
        return {};
      }
    },
    /**
     * Set to true if the prop 'ajax' is true,
     * the tree will make the ajax call only for
     * the source of the root level and will take
     * the current data for the source of other levels
     * @prop {Boolean} [false] hybrid
     */
    hybrid: {
      type: Boolean,
      default: false
    },
    /**
     * Set to false if you want remove the scroll inside the tree.
     * @prop {Boolean} [true] scrollable
     */
    scrollable: {
      type: Boolean,
      default: true
    }
  },
  data(){
    return {
      /**
       * Only for the origin tree.
       * @data {Boolean} [false] isRoot
       */
      isRoot: false,
      /**
       * The parent node if not root.
       * @data {Boolean|Vue} [false] node
       */
      node: false,
      /**
       * The parent tree if not root.
       * @data {Boolean|Vue} [false] tree
       */
      tree: false,
      /**
       * The URL where to pick the data from if isAjax.
       * @data {String|Boolean} url
       */
      url: typeof(this.source) === 'string' ? this.source : false,
      /**
       * True when the data is currently loading in the current tree.
       * @data {Boolean} [false] loading
       */
      loading: false,
      /**
       * True once the data of the tree has been loaded.
       * @data {Boolean} [false] isLoaded
       */
      isLoaded: false,
      /**
       * True once the component is mounted.
       * @data {Boolean} [false] isMounted
       */
      isMounted: false,
      /**
       * The currently active node component object.
       * @data {Boolean|Vue} [false] activeNode
       */
      activeNode: false,
      /**
       * The component node object over which the mouse is now.
       * @data {Boolean|Vue} [false] overNode
       */
      overNode: false,
      /**
       * Dragging state, true if an element is being dragged.
       * @data {Boolean|Vue} [false] dragging
       */
      dragging: false,
      /**
       * Real dragging will start after the mouse's first move, useful to kow if we are in a select or drag context.
       * @data {Boolean} [false] realDragging
       */
      realDragging: false,
      /**
       * An array containing the indexes of checked nodes.
       * @data {Array} [[]] checked
       */
      checked: [],
      /**
       * An array containing the indexes of disabled checkbox
       * @data {Array} [[]] disabled
       */
      disabled: [],
      /**
       * An array containing the components of expanded nodes.
       * @data {Array} [[]] currentExpanded
       */
      currentExpanded: [],
      /**
       * The component node object over which the mouse is now.
       * @data {Boolean|Vue} [false] overOrder
       */
      overOrder: false,
      /**
       * The array of nodes.
       * @data {Array} [[]] nodes
       */
      nodes: [],
      /**
       * The state for the storage.
       * @data {Array} [[]] nodes
       */
      currentState: {},
      /**
       * Set to true once it has been loaded.
       * @data {Array} [[]] nodes
       */
      isInit: false
    };
  },
  computed: {
    /**
     * The current data of the tree.
     * @computed filteredData
     * @fires _checkConditionsOnItem
     * @return {Array}
     */
    filteredData(){
      let ret = [];
      if (
        this.currentData.length &&
        this.currentFilters &&
        this.currentFilters.conditions &&
        this.currentFilters.conditions.length &&
        (!this.serverFiltering || !this.isAjax)
      ) {
        ret = bbn.fn.filter(this.currentData, a => {
          return this._checkConditionsOnItem(this.currentFilters, a.data);
        });
      }
      else{
        ret = this.currentData;
      }
      if ( this.sortable && this.order.length ){
        /* ret = bbn.fn.multiorder(ret, bbn.fn.map(this.order, o => {
          let r = bbn.fn.extend(true, {}, o);
          r.field = 'data.' + r.field;
          return r;
        })); */
        ret = bbn.fn.multiorder(ret, this.order);
        ret = bbn.fn.map(ret, (v, i) => {
          v.num = i + 1;
          return v;
        });
      }
      return ret;
    },
    /**
     * The selected node.
     * @computed selectedNode
     * @return {Vue|Boolean}
     */
    selectedNode(){
      return this.tree && this.tree.currentSelected.length ? this.tree.currentSelected[this.tree.currentSelected.length-1] : false;
    },
    /**
     * Array of droppables trees.
     * @computed droppableTrees
     * @return {Array}
     */
    droppableTrees(){
      let r = this.selfDrop ? [this] : [];
      if (this.droppables.length) {
        r.push(...this.droppables);
      }
      return r;
    }
  },
  methods: {
    /**
     * Normalizes the list of items basing on it's type.
     * @method _objectMapper
     * @param {Array|Object} items
     * @fires _objectMapper
     * @return {Array}
     */
    _objectMapper(items){
      let res = [];
      if ( bbn.fn.isArray(items) ){
        bbn.fn.each(items, (a, i) => {
          let numChildren = 0;
          let o = {
            text: bbn._('Node') + ' ' + i,
            numChildren: numChildren
          };
          if ( a !== undefined ){
            if ( bbn.fn.isArray(a) ){
              numChildren = a.length;
            }
            else if ( typeof a === 'object' ){
              numChildren = bbn.fn.numProperties(a);
            }
            else {
              o.text = typeof a === 'string' ? a : a.toString();
            }
          }
          if ( numChildren ){
            o.numChildren = numChildren;
            o[this.children] = this._objectMapper(a);
          }
          res.push(o);
        })
      }
      else if ( items && (typeof items === 'object') && bbn.fn.numProperties(items) ){
        bbn.fn.iterate(items, (a, n) => {
          let numChildren = 0;
          let o = {
            text: n,
            numChildren: numChildren
          };
          if ( a !== undefined ){
            if ( bbn.fn.isArray(a) ){
              numChildren = a.length;
            }
            else if ( typeof a === 'object' ){
              numChildren = bbn.fn.numProperties(a);
            }
            else {
              o.text = ('<strong>' + o.text + ': </strong>' + a);
            }
          }
          if ( numChildren ){
            o.numChildren = numChildren;
            o[this.children] = this._objectMapper(a);
          }
          res.push(o);
        });
      }
      return res;
    },
    _getTreeState(uid) {
      if ((uid !== undefined) && this.currentState[uid]) {
        //bbn.fn.log('CURRENT STATE FOUND', this.currentState[uid][this.children]);
        //return bbn.fn.clone(this.currentState[uid].items);
        return this.currentState[uid].items;
      }
      return {};
    },
    /**
     * A function to normalize the structure of items.
     * @method _map
     * @param {Array} items
     * @fires tree.map
     * @fires _objectMapper
     * @return {Array}
     */
    _map(items){
      if ( this.object ){
        items = this._objectMapper(items.reduce((r, k) => {
          r[k.value] = k.text;
          return r;
        }, {}));
      }
      items = bbn.fn.map(items, item => {
        let o = {};
        if ( this.tree.map ){
          item = this.tree.map(item.data !== undefined ? item.data : item, this.level + 1, item.data !== undefined ? item : {});
        }
        bbn.fn.each(bbnTreeCreator.NODE_PROPERTIES, p => {
          o[p] = p === 'text' ? item[this.tree.sourceText] : item[p];
        });
        if (!!item.data && !!item.data[this.tree.children]) {
          o.numChildren = item.data[this.tree.children].length;
        }
        if (!!item[this.tree.children]) {
          o.numChildren = item[this.tree.children].length;
        }
        if ( o.data === undefined ){
          o.data = item;
        }
        return o;
      });
      return items;
    },
    /**
     * Resets the tree to the original configuration.
     * @method reset
     * @fires updateData
     */
    reset(){
      this.isLoaded = false;
      //this.$set(this, 'currentData', []);
      //this.$forceUpdate();
      //this.$nextTick(() => {
        this.updateData();
      //})
    },
    /**
     * Resizes the root scroller.
     * @method resize
     */
    resize(){
      let scroll = this.tree.getRef('scroll');
      if (scroll && bbn.fn.isFunction(scroll.onResize)) {
        scroll.onResize();
      }
    },
    /**
     * Resizes the root tree and emit an open event
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
     * Resizes the root tree and emit a close event.
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
     * Finds a node based on its props.
     * @method findNode
     * @param {Object} props
     * @param {Object} node
     * @return {Object}
     */
    findNode(props, expand){
      let ret = false;
      if (this.isRoot || (this.node.numChildren && bbn.fn.isObject(props))) {
        if (expand && !this.isRoot && !this.node.isExpanded) {
          this.node.isExpanded = true;
        }
        else if (!this.node.isExpanded) {
          return false;
        }

        let cp = this.isRoot && this.scrollable ? this.getRef('scroll') : this;
        if (cp.$children) {
          let idx = bbn.fn.search(
            bbn.fn.arrayFromProp(
              cp.$children.filter(a => a.$options && (a.$options._componentTag === 'bbn-tree-node')),
              'data'
            ),
            props
          );
          if (idx > -1) {
            ret = cp.$children[idx];
          }
          else {
            bbn.fn.each(cp.$children, node => {
              let tree = node.getRef('tree');
              if (tree) {
                ret = tree.findNode(props, expand);
                if (ret) {
                  return false;
                }
              }
            })

          }
        }
      }
      return ret;
    },
    /**
     * Returns the node corresponding to the given idx.
     * @method getNodeByIdx
     * @param {Number} idx
     * @return {Vue|Boolean}
     */
    getNodeByIdx(idx){
      if ( bbn.fn.isNumber(idx) && this.nodes.length ){
        return bbn.fn.getRow(this.nodes, {idx: parseInt(idx)});
      }
      return false;
    },
    /**
     * Adds a node to the tree.
     * @param {Object} obj The item to add.
     * Returns {Boolean|Object}
     */
    addNode(obj){
      if ( bbn.fn.isObject(obj) ){
        obj = this._map([obj])[0];
        obj._bbn = true;
        obj.index = this.currentData.length;
        this.currentData.push(obj);
        return obj;
      }
      return false;
    },
    /**
     * Returns the menu of the given node.
     * @method getMenu
     * @param {Object} node
     * @fires reload
     * @fires menu
     * @return {Array}
     */
    getMenu(node){
      let menu = [],
          tree = node.getRef('tree');
      if ( node.numChildren ){
        menu.push({
          text: node.isExpanded ? bbn._("Close") : bbn._("Open"),
          icon: node.isExpanded ? 'nf nf-fa-arrow_circle_up' : 'nf nf-fa-arrow_circle_down',
          action: () => {
            node.isExpanded = !node.isExpanded;
          }
        });
      }
      if ( this.isAjax && node.numChildren && tree && tree.isLoaded ){
        menu.push({
          text: bbn._("Refresh"),
          icon: 'nf nf-fa-refresh',
          action: () => {
            this.reload(node);
          }
        })
      }
      if ( this.menu ){
        let m2 = bbn.fn.isFunction(this.menu) ? this.menu(node, node.idx) : this.menu;
        if ( m2.length ){
          bbn.fn.each(m2, function(a,i){
            menu.push({
              text: a.text,
              icon: a.icon ? a.icon : '',
              action: a.action ? () => {
                a.action(node)
              } : false
            });
          })
        }
      }
      return menu;
    },
    /**
     * Returns an object with the data to send for a given node.
     * If UID has been given obj will only have this prop other the whole data object.
     * @method getPostData
     * @fires data
     * @return {Object}
     */
    getPostData(){
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
      if (bbn.fn.isFunction(this.tree.data) ){
        r = bbn.fn.extend(true, {}, this.tree.data(this.node ? this.node.data : {}), r);
      }
      else{
        r = bbn.fn.extend(true, {}, this.tree.data, r);
      }
      return r;
    },
    /**
     * Manages the key navigation inside the tree.
     * @method keyNav
     * @param {Event} e The event
     */
    keyNav(e){
      this.tree.$emit('keynav', e.key);
      if ( this.tree.activeNode ){
        let parent = this.tree.activeNode.parent;
        let data = parent.filteredData.filter(d => !!d.visible);
        let min = 0;
        let max = data.length - 1;
        let idx = bbn.fn.search(data, {index: this.tree.activeNode.idx});
        let subtree = this.tree.activeNode.getRef('tree');
        switch ( e.key ){
          case 'Enter':
          case ' ':
            if ( this.tree.activeNode.selectable ){
              this.tree.activeNode.isSelected = !this.tree.activeNode.isSelected;
            }
            else {
              let ev = new Event('nodeClick', {cancelable: true});
              this.tree.$emit('nodeClick', this.tree.activeNode, ev);
            }
            break;
          case 'PageDown':
          case 'End':
            if ( data.length ){
              bbn.fn.getRow(parent.nodes, {idx: data[data.length-1].index}).isActive = true;
              this.scrollToActive();
            }
            break;
          case 'PageUp':
          case 'Home':
            if ( data.length ){
              bbn.fn.getRow(parent.nodes, {idx: data[0].index}).isActive = true;
              this.scrollToActive();
            }
            break;
          case 'ArrowLeft':
            if ( this.tree.activeNode.numChildren && this.tree.activeNode.isExpanded ){
              this.tree.activeNode.isExpanded = false;
            }
            else if ( !this.tree.activeNode.parent.isRoot ){
              this.tree.activeNode.parent.node.isActive = true;
              this.scrollToActive();
            }
            break;
          case 'ArrowRight':
            if ( this.tree.activeNode.numChildren ){
              if ( !this.tree.activeNode.isExpanded ){
                this.tree.activeNode.isExpanded = true;
              }
              else if ( subtree && subtree.nodes.length ){
                bbn.fn.getRow(subtree.nodes, {idx: subtree.filteredData[0].index}).isActive = true;
                this.scrollToActive();
              }
            }
            break;
          case 'ArrowDown':
            if ( (idx + 1) <= max ){
              bbn.fn.getRow(parent.nodes, {idx: data[idx+1].index}).isActive = true;
              this.scrollToActive();
            }
            else if ( parent.node && parent.node.parent ){
              data = parent.node.parent.filteredData.filter(d => !!d.visible);
              idx = bbn.fn.search(data, {index: parent.node.idx});
              if ( (idx > -1) && data[idx+1] ){
                bbn.fn.getRow(parent.node.parent.nodes, {idx: data[idx+1].index}).isActive = true;
                this.scrollToActive();
              }
            }
            break;
          case 'ArrowUp':
            if ( (idx - 1) >= min ){
              bbn.fn.getRow(parent.nodes, {idx: data[idx-1].index}).isActive = true;
              this.scrollToActive();
            }
            else if ( !parent.isRoot && parent.node ){
              parent.node.isActive = true;
              this.scrollToActive();
            }
            break;
        }
      }
      else if ( this.tree.selectedNode ){
        this.tree.activeNode = this.tree.selectedNode;
        this.scrollToActive();
      }
      else if ( this.tree.filteredData.length ){
        bbn.fn.getRow(this.tree.nodes, {idx: this.tree.filteredData[0].index}).isActive = true;
        this.scrollToActive();
      }
    },

    /**
     * Reloads a node already loaded.
     * @method reload
     * @param {Vue} node
     * @fires updateData
     */
    reload(node){
      //if ( this.isAjax ){
        if ( this.isRoot && !node ){
          this.isLoaded = false;
          return this.init();
        }
        else {
          node = !node ? this.node : node;
          let tree = node.getRef('tree');
          if ( tree ){
            tree.isLoaded = false;
            return tree.updateData();
          }
        }
      //}
    },
    /**
     * Loads a node.
     * @method load
     * @fires updateData
     */
    load(){
      this.updateData();
    },
    getNodeByUid(uid) {
      let res = false;
      if (this.uid) {
        bbn.fn.each(this.findAll('bbn-tree-node'), e => {
          if (e.source && e.source.data && (e.source.data[this.uid] === uid)) {
            res = e;
            return false;
          }
        })
      }
      return res;
    },
    /**
     * Returns the node's path.
     * @method getNodePath
     * @param {Object} node
     * @param {String} field
     */
    getNodePath(node, field){
      let f = field || this.uid || false,
          obj = Object.keys(node.data).length ? bbn.fn.extend(true, {}, node.data) : false,
          fromObj = !f || (node.data[f] === undefined);
      if ( !fromObj || obj ){
        let r = [fromObj ? obj : node.data[f]],
            tree = node.parent;
        while ( tree && (tree !== this) ){
          node = tree.node;
          r.unshift(fromObj ? bbn.fn.extend(true, {}, node.data) : node.data[f]);
          tree = node.parent;
        }
        return r;
      }
      return false;
    },

    /**
     * Unselects the currently selected node.
     * @method unselect
     */
    unselect(){
      if ( this.tree.selectedNode ){
        this.tree.selectedNode.isSelected = false;
        if (!this.multiple) {
          this.$emit('unselect', this);
        }
      }
    },

    /**
     * Deactivate the active nodes.
     * @method deactivateAll
     */
    deactivateAll(){
      if ( this.tree.activeNode ){
        this.tree.activeNode.isActive = true;
      }
    },

    /**
     * Returns true if the first argument node descends from the second.
     * @method isNodeOf
     * @param {Object} childNode
     * @param {Object} parentNode
     * @return {Boolean}
     */
    isNodeOf(childNode, parentNode){
      childNode = bbn.wc.closest(childNode, 'bbn-tree-node');
      while ( childNode ){
        if ( childNode === parentNode ){
          return true;
        }
        childNode = bbn.wc.closest(childNode, 'bbn-tree-node');
      }
      return false;
    },

    /**
     *  Moves a node to or inside a tree.
     * @method move
     * @param {Object} node
     * @param {Object} target
     * @param {Boolean} [false] force
     */
    move(node, target, force = false){
      // initializing and sending an event cancelable if force is false
      let ev = new Event("move", {cancelable: !force});
      this.tree.$emit('move', node, target, ev);
      // if the action has not been prevented
      if (!ev.defaultPrevented){
        // getting the parent of the source node
        let parent = node.parent;
        // getting the position of the source node
        let idx = !!node.parent ? bbn.fn.search(parent.currentData, {index: node.idx}) : -1;
        // getting all the nodes at a lower level than the source node
        let nodes = node.findAll('bbn-tree-node');
        // filtered by those who are expanded
        let expanded = nodes.filter(n => !!n.isExpanded);
        // and by those who are selected
        let selected = nodes.filter(n => !!n.isSelected);
        // verification if the node had parent et his index is greater than or equel to 0
        if ( (idx >= 0) && parent ){
          // if there is no children then we set the number of children to 1
          if ( !target.source.numChildren ){
            target.$set(target.source, 'numChildren', 1);
          }
          // otherwhise we increase the number of children by one
          else{
            target.source.numChildren++;
          }
          // updating the DOM of VUE
          this.$nextTick(() => {
            // get the ref and put it in the targetTree
            let targetTree = target.getRef('tree');
            if ( node.isExpanded ){
              // if the node is expanded we're adding it to the expanded
              expanded.unshift(node);
            }
            // if the node is selected we're adding it to the selected
            if ( node.isSelected ){
              selected.unshift(node);
            }
            // If the source node is inside a parent node and is moved then we lower the number of children by one
            if ( parent.node ){
              parent.node.numChildren--;
            }
            // adding the node and push it to the tree
            if (this.tree.isAjax) {
              let nodeSource = bbn.fn.extend(true, {}, parent.currentData[idx]);
              if (bbn.fn.isFunction(this.transferData)) {
                nodeSource = this.transferData(nodeSource);
              }
              let children = target.source.data[this.tree.children];
              if (!children) {
                target.source.data[this.tree.children] = [];
                children = target.source.data[this.tree.children]
              }
              if (!target.isExpanded) {
                targetTree.$once('dataloaded', () => {
                  // adding in the node source the length of the target tree if there is no length then we set it at 1
                  nodeSource.num = targetTree.currentData.length || 1;
                  // we're adding the index also
                  nodeSource.index = nodeSource.num - 1;
                  // and then we push node source in the targetTree
                  children.push(nodeSource);
                });
              }
              else {
                // adding in the node source the length of the target tree if there is no length then we set it at 1
                nodeSource.num = targetTree.currentData.length || 1;
                // we're adding the index also
                nodeSource.index = nodeSource.num - 1;
                // and then we push node source in the targetTree
                children.push(nodeSource);
              }
            }
            else {
              let nodeSource = parent.source.splice(idx, 1)[0];
              if (bbn.fn.isFunction(this.transferData)) {
                nodeSource = this.transferData(nodeSource);
              }
              // if the array is empty we set one
              if ( !bbn.fn.isArray(target.source.data[this.tree.children]) ){
                target.$set(target.source.data, this.tree.children, []);
              }
              // otherwise we just push the data inside the array
              target.source.data[this.tree.children].push(nodeSource);
            }
            // we remove the expanded node
            bbn.fn.each(expanded, n => {
              n.removeFromExpanded(false);
            });
            // we remove the selected node
            bbn.fn.each(selected, n => {
              n.removeFromSelected(false);
            });
            // remove the old node
            parent.currentData.splice(idx, 1);
            this.$nextTick(() => {
              // if the target node isn't expanded we do it
              if (!target.isExpanded) {
                target.isExpanded = true;
              }
              // then we update the data
              if (!this.tree.isAjax) {
                let path = target.getPath();
                targetTree.updateData().then(() => {
                  targetTree.expandPath(path);
                });
              }
            });
          });
        }
      }
    },
    /**
     * Returns an object with all the unknown properties of the node component.
     * @param {Object} data
     * @return {Object}
     */
    toData(data){
      let r = {};
      for ( let n in data ){
        if ( bbnTreeCreator.NODE_PROPERTIES.indexOf(n) === -1 ){
          r[n] = data[n];
        }
      }
      return r;
    },
    /**
     * Returns the current configuration of the tree.
     * @method getConfig
     * @returns {Object}
     */
    getConfig(){
      let cfg = {
        expanded: [],
        selected: [],
        state: this.currentState
      };
      if (!this.uid) {
        return cfg;
      }
      // Expanded
      bbn.fn.each(this.currentExpanded, c => {
        if (c.data && c.data[this.uid]) {
          cfg.expanded.push(c.data[this.uid])
        }
      });
      // Selected
      bbn.fn.each(this.currentSelected, c => {
        if (c.data
          && c.data[this.uid]
          && (!!this.multiple || !cfg.selected.length)
        ) {
          cfg.selected.push(c.data[this.uid])
        }
      });
      return cfg;
    },
    /**
     * Gets the local storage.
     * @method getLocalStorage
     */
    getLocalStorage(){
      if ( this.isRoot && this.hasStorage ){
        return this.getStorage(this.storageFullName || this.storageName, !!this.storageFullName);
      }
    },
    /**
     * Sets the local storage.
     * @method setLocalStorage
     */
    setLocalStorage(){
      let ev = new Event('setStorage', {cancelable: true}),
          cfg = this.getConfig();
      this.$emit('setStorage', cfg, this.storageFullName || this.storageName, ev);
      if ( !ev.defaultPrevented ){
        this.setStorage(cfg, this.storageFullName || this.storageName, !!this.storageFullName);
      }
    },
    /**
     * Scrolls the tree to the selected node.
     * @method scrollToSelected
     */
    scrollToSelected(){
      if ( this.tree && this.tree.selectedNode ){
        let scroll = this.tree.getRef('scroll');
        if ( scroll ){
          scroll.scrollTo(0, this.tree.selectedNode.$el);
        }
      }
    },
    /**
     * Scrolls the tree to the active node.
     * @method scrollToActive
     */
    scrollToActive(){
      if ( this.tree && this.tree.activeNode ){
        let scroll = this.tree.getRef('scroll');
        if ( scroll ){
          scroll.scrollTo(0, this.tree.activeNode.$el);
        }
      }
    },
    _setCurrentState(state) {
      //bbn.fn.log("State", this, state);
      this.currentState = state;
    },
    initStorage(){
      let state;
      if (this.hasStorage && this.isRoot) {
        let storage = this.getLocalStorage();
        if (storage) {
          state = storage.state || null;
        }
      }
      else if (this.state) {
        state = this.state;
      }
      if (state) {
        this._setCurrentState(state);
      }
    },
    expandPath(path, field, select = false, time = 1){
      field = field || this.uid || false;
      if (field
        && path
        && path.length
      ) {
        if (!bbn.fn.isArray(path)) {
          path = [path];
        }
        let currentPaths = path.slice(),
            uid = currentPaths.shift(),
            isLast = !currentPaths.length;
        if ((uid !== undefined)) {
          if (this.isLoading || !this.isLoaded) {
            this.$once('dataloaded', () => {
              this.$nextTick(() => {
                this.expandPath(path, field, select);
              });
            });
          }
          else if (this.isLoaded && !this.isLoading) {
            this.$nextTick(() => {
              let node = this.findNode({[field]: uid});
              if (node) {
                if (isLast && !!select) {
                  node.isSelected = true;
                }
                else if (!!node.numChildren) {
                  let tree = node.getRef('tree');
                  if (tree) {
                    if (!node.isExpanded) {
                      tree.$once('dataloaded', () => {
                        this.$nextTick(() => {
                          tree.expandPath(currentPaths, field, select);
                        })
                      });
                      node.isExpanded = true;
                    }
                    else if (!isLast) {
                      tree.expandPath(currentPaths, field, select);
                    }
                  }
                }
              }
              else if (time === 1) {
                setTimeout(() => {
                  this.expandPath(path, field, select, 2);
                }, 100);
              }
            })
          }
        }
      }
    },
    selectPath(path, field){
      this.expandPath(path, field, true);
    },
    initState(){
      if ((this.node.isExpanded
          || this.isRoot
          || bbn.fn.count(Object.values(this.currentState), {expanded: true})
          || bbn.fn.count(Object.values(this.currentState), {selected: true}))
        && bbn.fn.numProperties(this.currentState)
        && this.filteredData.length
      ) {
        setTimeout(() => {
          bbn.fn.iterate(this.currentState, (o, uid) => {
            let it = this.uid !== undefined ?
              this.findNode({[this.uid]: uid}) :
              false;
            if (it) {
              if ((o.items && bbn.fn.numProperties(o.items))
                || o.expanded
              ) {
                it.isExpanded = true;
              }
              if (o.selected) {
                if (it.selectable) {
                  it.isSelected = true;
                }
                else {
                  o.selected = false;
                }
              }
            }
            else {
              delete this.currentState[uid];
            }
          })
        }, 50);
      }
    },
    /**
     * @method init
     * @fires updateData
     * @fires initState
     */
    init(){
      if (this.node.isExpanded
        || this.isRoot
        || bbn.fn.count(Object.values(this.currentState), {expanded: true})
        || bbn.fn.count(Object.values(this.currentState), {selected: true})
      ) {
        return this.updateData().then(() => {
          this.isInit = true;
          this.initState();
        });
      }
      else {
        this.isInit = true;
      }
    },
    /**
     * Keep to prevent the one from list to exexute
     * @method listOnBeforeMount
     */
    listOnBeforeMount(){
      return;
    },
    /**
     * @method afterUpdate
     * @event dataloaded
     * @fires $nextTick
     * @fires initState
     */
    afterUpdate(){
      if (!this.isLoaded && this.ready && !this.tree.autobind) {
        this.$once('dataloaded', () => {
          this.$nextTick(this.initState);
        });
      }
    }
  },
  /**
   * Emits the event beforeLoad and load. And opens the nodes defined in the prop path.
   * Definition of the root tree and parent node.
   * @event beforeupdate
   * @event startloading
   * @event datareceived
   * @emits tree,beforeLoad
   * @emits load
   * @fires closest
   */
  created(){
    this.$on('beforeupdate', e => {
      if ( this.isAjax && (this.tree.isLoading || this.isLoading) ){
        e.preventDefault();
      }
      if ( !e.defaultPrevented ){
        this.tree.$emit('beforeload', this.getPostData());
      }
    });
    this.$on('startloading', () => {
      this.loading = true;
    });
    this.$on('datareceived', d => {
      this.loading = false;
      this.tree.$emit('load', d);
    });
    this.$on('dataloaded', d => {
      this.tree.$emit('afterload', d);
    });
    if ( bbn.fn.isFunction(this.source) ){
      this.isFunction = true;
    }
    let cp = this.closest('bbn-tree');
    if ( !cp ){
      this.isRoot = true;
      this.node = false;
      this.tree = this;
    }
    else {
      while ( cp && cp.level ){
        cp = cp.closest('bbn-tree');
      }
      if ( cp && !cp.level ){
        this.tree = cp;
        this.isAjax = this.tree.isAjax && !this.tree.hybrid;
      }
      this.node = this.closest('bbn-tree-node');
    }
  },
  /**
   * Updates the data of the tree and sets the prop 'ready' to true.
   * @event mounted
   * @fires updateData
   */
  mounted(){
    this.ready = true;
    this.initStorage();
    if (this.tree.autobind) {
      this.$nextTick(() => {
        this.init();
      })
    }
    else {
      this.isInit = true;
    }
  },
  watch: {
    /**
     *
     * @param {Object} newVal
     */
    activeNode(newVal){
      if ( newVal && this.isRoot ){
        let scroll = this.getRef('scroll');
        if ( scroll ){
          //scroll.scrollTo(0, newVal.$el);
        }
      }
    },
    selectedNode(newVal){
      if ( newVal && this.isRoot ){
        let scroll = this.getRef('scroll');
        if ( scroll ){
          //scroll.scrollTo(0, newVal.$el);
        }
      }
    },
    /**
     * Updates the ree overNode and overOrder when the prop 'dragging' changes.
     * @param {Boolean} newVal
     */
    dragging(newVal){
      if ( !newVal ){
        this.overNode = false;
        this.overOrder = false;
      }
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
         * True if the node is selectable
         * @prop {Boolean} [true] selectable
         * @memberof bbn-tree-node
         */
        selectable: {
          type: Boolean,
          default: false
        },
        multiple:{
          type: Boolean,
          default: false
        },
        /**
         * True if the node is selection
         * @prop {Boolean} [false] selection
         * @memberof bbn-tree-node
         */
        selection: {
          type: Boolean,
          default: true
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
         * A component for the node
         * @prop {String|Function|Vue} component
         * @memberof bbn-tree-node
         */
        component: {
          type: [String, Function, Object, Object]
        },
        /**
         * The list of children from the node
         * @prop {Array} [[]] source
         * @memberof bbn-tree-node
         */
        source: {
          type: Object,
          default(){
            return {};
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
        },
        quickFilter: {
          type: String,
          default: ''
        },
        sortable: {
          type: Boolean,
          default: true
        },
        uid: {
          type: String
        },
        treeState: {
          type: Object,
          default(){
            return {};
          }
        },
        flat: {
          type: Boolean,
          default: false
        }
      },
      data(){
        return {
          ready: false,
          /**
           * @data {Boolean} [false] doubleClk
           * @memberof bbn-tree-node
           */
          doubleClk: false,
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
           * True if the node is active
           * @data {Boolean} [false] isActive
           * @memberof bbn-tree-node
           */
          isActive: false,
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
          orderOver: false
        }
      },
      computed: {
        isOverOrderTop(){
          return this.tree && this.tree.realDragging && this.tree.overOrder && (this.tree.overOrder === this.getRef('orderTop'));
        },
        isOverOrderBottom(){
          return this.tree && this.tree.realDragging && this.tree.overOrder && (this.tree.overOrder === this.getRef('orderBottom'));
        },
        data(){
          return this.source.data;
        },
        isVisible(){
          let tree = this.getRef('tree');
          return !this.quickFilter ||
            ((this.source.text.toLowerCase().indexOf(this.quickFilter.toLowerCase()) > -1) && !this.numChildren) ||
            ((this.source.text.toLowerCase().indexOf(this.quickFilter.toLowerCase()) > -1) && !this.tree.excludedSectionFilter) ||
            (
              (this.source.text.toLowerCase().indexOf(this.quickFilter.toLowerCase()) > -1) &&
              !!this.tree.excludedSectionFilter &&
              !!(tree && tree.nodes && tree.nodes.filter(n => !!n.isVisible).length)
            ) ||
            !!(tree && tree.nodes && tree.nodes.filter(n => !!n.isVisible).length)
        },
        isExpanded: {
          get(){
            return !!this.source.expanded;
          },
          set(v){
            this.source.expanded = v;
          }
        },
        isSelected: {
          get(){
            return !!this.source.selected;
          },
          set(v){
            this.source.selected = v;
          }
        },
        isFilterable(){
          return this.source.filterable !== undefined ? !!this.source.filterable : !!this.tree.filterable;
        },
        hasFilters(){
          let tree = this.getRef('tree');
          return tree && tree.hasFilters;
        },
        numChildren: {
          get(){
            return this.source.numChildren;
          },
          set(v){
            this.source.numChildren = v;
          }
        },
        /**
         * The style of the item's icon
         * @computed iconStyle
         * @return {Object}s
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
         * @return {Array}
         * @memberof bbn-tree-node
         */
        menu(){
          return this.getMenu()
        },
        textFromText() {
          if (this.source.data.text) {
            return bbn.fn.html2text(this.source.data.text)
          }
          return '';
        }
      },
      methods: {
        randomString: bbn.fn.randomString,
        /**
         * Return true if the node is checked
         * @method isChecked
         * @memberof bbn-tree-node
         */
        isChecked(uid){
          return this.tree.checked.includes(uid)
        },
        /**
         * Return true if the node is disabled
         * @method isDisabled
         * @memberof bbn-tree-node
         */
        isDisabled(){
          return this.tree.disabled.includes(this.data[this.tree.uid])
        },
        /**
         * Checks the node and emits the events check and uncheck
         * @method checkNode
         * @emits check
         * @emits uncheck
         * @memberof bbn-tree-node
         */
        checkNode(val){
          if ( val && this.data[this.tree.uid] && !this.tree.checked.includes(this.data[this.tree.uid]) ){
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
         * @memberof bbn-tree-node
         */
        activate(){
          this.isActive = true;
        },
        update(attr){
          for ( let n in attr ){
            this[n] = attr[n];
          }
        },
        /**
         * Resize the parent tree
         * @method tree.resize
         * @memberof bbn-tree-node
         * @memberof bbn-tree-node
         */
        resize(){
          this.tree.resize();
        },
        reload(){
          this.tree.reload(this);
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
            //alert("beforeEnter " + $(this.$refs.container).height());
          }
        },
        enter(){
          if ( this.animation ){
            //alert("enter " + $(this.$refs.container).height());
          }
        },
        afterEnter(){
          if ( this.animation ){
            //alert("afterEnter " + $(this.$refs.container).height());
          }
        },
        /**
         * Handles the start of dragging of the tree
         * @method startDrag
         * @param {Event} e The event
         * @emits tree.dragstart
         * @memberof bbn-tree-node
         */
        startDrag(e){
          if ((this.tree.draggable || this.sortable) && !this.tree.realDragging) {
              if ( this.tree.selectedNode ){
                //this.tree.selectedNode.isSelected = false;
              }
              this.tree.$emit("dragstart", this, e);
              if (!e.defaultPrevented) {
                this.tree.dragging = this;
                this.tree.realDragging = true;
                if ( this.tree.droppableTrees.length ){
                  bbn.fn.each(this.tree.droppableTrees, dt => {
                    if (dt !== this.tree) {
                      dt.dragging = this;
                    }
                  });
                }
              }
          }
          else {
            e.preventDefault();
          }
        },
        /**
         * Handles the dragging of the node
         * @method drag
         * @param {Event} e The event
         * @emits tree.dragstart
         * @emits  dragover
         * @memberof bbn-tree-node
         */
        drag(e){
          this.mouseOver();
          // we prevent default from the event
          if ( this.sortable ){
            if ( e.target.classList.contains('bbn-tree-order') ){
              if ( this.tree.overOrder !== e.target ){
                this.tree.overOrder = e.target;
              }
            }
            else {
              this.tree.overOrder = false;
            }
          }
          if (!!this.tree.dragging) {
            let subTree = this.getRef('tree');
            if (!!this.tree.overNode
              && (this === this.tree.overNode)
              && (this !== this.tree.dragging)
              && !this.tree.isNodeOf(this, this.tree.dragging)
              && ((!subTree || (subTree !== this.parent)))
            ) {
              this.tree.$emit("dragover", this, this.tree.dragging, e);
              if (e.defaultPrevented) {
                this.tree.overNode = false;
              }
            }
            else {
              this.tree.overNode = false;
            }
          }
        },
        /**
         * Handles the leave of dragging
         * @method leaveDrag
         * @param {Event} e The event
         * @memberof bbn-tree-node
         */
        leaveDrag(e){
          this.tree.overNode = false;
        },
        /**
         * Handles the drop of dragging
         * @method drop
         * @param {Event} e The event
         * @emits dragend
         * @memberof bbn-tree-node
         */
        drop(e){
          e.preventDefault();
          e.stopImmediatePropagation();
          if (this.tree.dragging
            && this.tree.overNode
            && (this === this.tree.overNode)
          ) {
            let ev = new CustomEvent('drop', {
              cancelable: true,
              bubbles: true,
              detail: e.detail
            });
            let originalTree = this.tree.dragging.tree;
            this.tree.$emit('drop', this.tree.dragging, this, ev);
            if (!ev.defaultPrevented) {
              if (this.tree.overOrder) {
                let numBefore = this.tree.dragging.source.num,
                    numAfter = this.tree.overOrder.classList.contains('bbn-tree-order-top') ?
                      1 :
                      this.tree.overNode.source.num + (numBefore > this.tree.overNode.source.num ? 1 : 0);
                    if ((numBefore !== numAfter)
                      && (this.tree.dragging.parent === this.tree.overNode.parent)
                    ) {
                      this.reorder(this.tree.dragging.source.num, numAfter);
                    }
              }
              else if (this.tree.draggable
                && (this.tree.dragging.parent !== this.tree.overNode)
              ) {
                originalTree.move(this.tree.dragging, this);
              }
            }
          }
          let ev = new CustomEvent('dragend', {
            cancelable: true,
            bubbles: true
          });
          this.tree.$emit('dragend', ev);
        },
        /**
         * Handles the end of dragging
         * @method endDrag
         * @param {Event} e The event
         * @emits tree.dragend
         * @memberof bbn-tree-node
         */
        endDrag(e){
          e.preventDefault();
          e.stopImmediatePropagation();
          let ev = new CustomEvent('dragend', {
            cancelable: true,
            bubbles: true
          });
          this.tree.$emit('dragend', this.source, ev);
          if (!ev.defaultPrevented) {
            bbn.fn.each(this.tree.dragging.tree.droppableTrees, dt => {
              dt.overNode = false;
              dt.realDragging = false;
              dt.dragging = false;
            });
            if (!!this.tree.dragging && !this.tree.dragging.tree.selfDrop) {
              this.tree.dragging.tree.overNode = false;
              this.tree.dragging.tree.realDragging = false;
              this.tree.dragging.tree.dragging = false;
            }
          }
        },
        // the args are the old index the new index and if we force the reorder or not
        reorder(oldNum, newNum, force){
          // checking if the indexes are the same to order or not the data
          if ( oldNum !== newNum ){
            // arr became the filteredData i don't know what the slice is for
            let arr = this.parent.filteredData.slice();
            // remove the data at old index
            let ele = arr.splice(oldNum-1, 1);
            // create a new event beforeOrder that is cancelable
            let ev = new Event('beforeOrder', {cancelable: true});
            // if there is datas in ele
            if ( ele.length ){
              // and force is false
              if ( !force ){
                // we call the event beforeOrfer
                this.tree.$emit('beforeOrder', oldNum, newNum, this.tree.dragging, ev);
              }
              if ( !!force || !ev.defaultPrevented ){
                // remove the data at the index
                arr.splice(newNum-1, 0, ele[0]);
                bbn.fn.each(arr, (e, i) => {
                  // and add the data
                  if ( e.num !== (i + 1) ){
                    let data = bbn.fn.extend(true, {}, e.data);
                    e.num = i + 1;
                    if ( e.data.num !== undefined ){
                      //e.data.num = e.num;
                    }
                    // then it orders is
                    this.tree.$emit('order', data, e.num);
                  }
                });
                //this.parent.updateData();
              }
            }
          }
        },
        /**
         * Defines the parent tree overNode
         * @method mouseOver
         * @memberof bbn-tree-node
         */
        mouseOver(){
          this.tree.overNode = this.tree.dragging
            && (this !== this.tree.dragging)
            && (this.tree.draggable || this.sortable) ? this : false;
        },
        /**
         * @method checkPath
         * @memberof bbn-tree-node
         */
        checkPath(){
          return;
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
        // this function get the fullPath where you path the separtor as arguments
        getFullPath(separator, field) {
          let f = field || this.uid || false;
          if (f) {
            let st = '';
            let p = this;
            while (p && p.is('bbn-tree-node')) {
              if (p.data[f]) {
                if (p !== this) {
                  st = separator + st;
                }
                st = p.data[f] + st;
                p = p.parent.$parent;
              }
              else {
                return false;
              }
            }
            return st;
          }
          return false;
        },
        getPath(field){
          return this.tree.getNodePath(this, field);
        },
        addToSelected(emit = true, storage = true){
          // if the current node isn't already selected
          if ( !this.tree.currentSelected.includes(this) ){
            let sameParent = this.tree.selectedNode && (this.tree.selectedNode.parent === this.parent);
            if ( (this.tree.selectedNode && !this.tree.multiple) || (sameParent && !this.parent.multiple) ){
              this.tree.selectedNode.isSelected = false;
            }
            // initializing and calling the event beforeSelect
            let ev = new Event('beforeSelect', {cancelable: true});
            if ( emit ){
              this.tree.$emit('beforeSelect', this, ev);
            }
            if ( !ev.defaultPrevented ){
              // adding the node to selected
              this.tree.currentSelected.push(this);
              // call the event select
              if ( emit ){
                this.tree.$emit('select', this);
              }
              // adding the node selected
              if ( this.tree !== this.parent ){
                this.parent.currentSelected.push(this);
                if ( emit ){
                  // call the event select
                  this.parent.$emit('select', this);
                }
              }
              if (!!this.uid) {
                // getting all the nodes from root until this
                let path = this.tree.getNodePath(this);
                // Set the 'selected' property to true for this node on currentState
                path.reduce((o, uid) => {
                  if (!uid || !o) {
                    return undefined;
                  }
                  if (o[uid] === undefined) {
                    o[uid] = {
                      expanded: false,
                      items: {},
                      selected: false
                    };
                  }
                  if ((uid === this.data[this.uid])
                    && !o[uid].selected
                  ) {
                    o[uid].selected = true;
                  }
                  return o[uid].items;
                }, this.tree.currentState)
              }
              if ( storage ){
                this.$nextTick(() => {
                  // and put it in the local storage
                  this.tree.setLocalStorage();
                })
              }
            }
          }
        },
        removeFromSelected(emit = true, storage = true){
          // getting index of the currentTree select dans its parent
          let idx = this.tree.currentSelected.indexOf(this);
          let idx2 = this.parent.currentSelected.indexOf(this);
          // initializing and sending an event cancelable if emit is false
          let ev = new Event('beforeUnselect', {cancelable: true});
          if ( emit ){
            // if emit is here we call the event beforeUnselect
            this.tree.$emit('beforeUnselect', this, ev);
          }
          if ( !ev.defaultPrevented ){
            let path = [];
            if (!!this.uid) {
              // getting all the nodes from root until this
              path = this.tree.getNodePath(this);
            }
            // if the tree is selected
            if ( idx > -1 ){
              // we remove it
              this.tree.currentSelected.splice(idx, 1);
              if (emit && (this.multiple || !this.tree.currentSelected.length)) {
                this.tree.$emit('unselect', this);
              }
            }
            // if the tree is selected and different from his parent
            if ( (idx2 > -1) && (this.tree !== this.parent) ){
              // we remove it and call the event unselect
              this.parent.currentSelected.splice(idx, 1);
              if (emit && (this.multiple || !this.tree.currentSelected.length)) {
                this.parent.$emit('unselect', this);
              }
            }
            if (!!this.uid) {
              // uid of the last node
              let last = path[path.length - 1];
              // Set the 'selected' property to false for this node on currentState
              path.reduce((o, uid) => {
                if (!uid || !o) {
                  return undefined;
                }
                if (o[uid]) {
                  if (uid === last) {
                    o[uid].selected = false;
                    if (!bbn.fn.numProperties(o[uid].items)
                      && !o[uid].expanded
                    ) {
                      delete o[uid];
                    }
                  }
                }
                return !!o[uid] ? o[uid].items : false;
              }, this.tree.currentState);
            }
            if ( storage ){
              // if storage exists we call setLocalStorage
              this.$nextTick(() => {
                this.tree.setLocalStorage();
              })
            }
          }
        },
        addToExpanded(emit = true, storage = true) {
          if (!this.tree.currentExpanded.includes(this)) {
            // initializing and sending a cancelable event if emit is true
            let ev;
            if (emit) {
              ev = new Event('beforeUnfold', {cancelable: true});
              this.tree.$emit('beforeUnfold', this, ev);
            }
            if (!emit || !ev.defaultPrevented) {
              // adding to the list of nodes that are currently expanded
              this.tree.currentExpanded.push(this);
              // if storage is true we update its content
              // if emit is true we call unfold event
              if ( emit ){
                this.tree.$emit('unfold', this);
              }
              // Starting from the parent
              let parent = this.parent;
              // going up until there is no parent anymore
              while (parent && (parent !== this.tree)) {
                // adding itself to the currentExpanded
                parent.currentExpanded.push(this);
                // parent becomes the next parent tree if it exists otherwise it's null
                parent = parent.node ? parent.node.parent : null;
              }
              if (!!this.uid) {
                // getting all the nodes from root until this
                let path = this.tree.getNodePath(this);
                // Adds for each of them the expanded property and sets to true
                path.reduce((o, uid) => {
                  if (!uid || !o) {
                    return undefined;
                  }
                  if (o[uid] === undefined) {
                    o[uid] = {
                      expanded: true,
                      items: {},
                      selected: false
                    };
                  }
                  else if (!o[uid].expanded) {
                    o[uid].expanded = true;
                  }
                  return o[uid].items;
                }, this.tree.currentState)
              }
              if (storage) {
                this.$nextTick(() => {
                  this.tree.setLocalStorage();
                });
              }
              return true;
            }
          }
          return false;
        },
        removeFromExpanded(emit = true, storage = true) {
          // Getting the index of the tree which is expanded
          let idx = this.tree.currentExpanded.indexOf(this);
          // If the function indexOf works and return a good index
          if (idx > -1) {
            let ev;
            if (emit) {
              ev = new Event('beforeFold', {cancelable: true});
              this.tree.$emit('beforeFold', this, ev);
            }
            // Initializing and sending an event cancelable if emit is true
            // if the action has not been prevented
            if (!emit || !ev.defaultPrevented) {
              let path = [];
              if (!!this.uid) {
                // Getting all the nodes from root until this
                path = this.tree.getNodePath(this);
              }
              // Starting from the parent
              let parent = this.parent;
              // Going up until there is no parent anymore
              while (parent && (parent !== this.tree)) {
                // Getting the index of the first parent after tree
                let idx2 = parent.currentExpanded.indexOf(this);
                if (idx2 > -1) {
                  // If the return of the function allows it we remove it from the currentExpanded
                  parent.currentExpanded.splice(idx2, 1);
                }
                // Parent becomes the next parent tree if it exists otherwise it's null
                parent = parent.node ? parent.node.parent : null;
              }

              // And suppress the root currentExpanded
              this.tree.currentExpanded.splice(idx, 1);
              if (!!this.uid) {
                // uid of the last node
                let last = path[path.length - 1];
                // for each nodes which has the expanded property setted to true it's setted to false
                path.reduce((o, uid) => {
                  if (!uid || !o) {
                    return undefined;
                  }
                  if (o[uid]) {
                    if (uid === last) {
                      o[uid].expanded = false;
                      if (!o[uid].selected) {
                        delete o[uid];
                      }
                    }
                  }
                  return !!o[uid] ? o[uid].items : false;
                }, this.tree.currentState);
              }
              if (storage) {
                this.$nextTick(() => {
                  // Set the localStorage with the data we get
                  this.tree.setLocalStorage();
                });
              }

              if ( emit ){
                // Call the fold event
                this.tree.$emit('fold', this);
              }
            }
            return true;
          }
          return false;
        },
        /**
         * Single click on the node
         * @method clickOnNode
         * @emits nodeclick
         * @memberof bbn-tree-node
         */
        clickOnNode(ev){
          this.tree.$emit('nodeClick', this, ev);
        },
        /**
         * Double click on the node
         * @method dblClickOnNode
         * @emits nodeDblclick
         * @memberof bbn-tree-node
         */
        dblClickOnNode(ev){
          this.tree.$emit('nodeDblclick', this, ev);
        },
        getIcon(){
          return this.source.icon || (!!this.numChildren ? (this.isExpanded ? 'nf nf-fa-folder_open' : 'nf nf-fa-folder') : 'nf nf-fa-file');
        },
        remove(){
          if ( !this.parent.isAjax ){
            this.parent.currentData.splice(this.idx, 1);
          }
        },
        getCls(source, tree) {
          return source.cls !== undefined ? source.cls : (bbn.fn.isFunction(tree.cls) ? tree.cls(source, this.tree, this.parent) : tree.cls || '');
        }
      },
      /**
       * Defines the props tree and parent of the node
       * @event created
       * @memberof bbn-tree-node
       */
      created(){
        // Looking for the parent
        this.parent = this.closest('bbn-tree');
        // tree take the value of the parent tree or the parent
        this.tree = this.parent.tree || this.parent;
        // If we click a node we're calling the addToSelect function
        if ( this.source.selected ){
          this.addToSelected();
        }
        if ( !this.parent.nodes.includes(this) ){
          this.parent.nodes.push(this);
        }
        // If the tree is opened we're calling the addToExpanded function
        if ( this.tree.opened || (this.level < this.tree.minExpandLevel) ){
          this.$set(this.source, 'expanded', true);
          this.addToExpanded();
        }
      },
      /**
       * @event mounted
       * @fires checkPath
       * @fires resize
       */
      mounted(){
        this.$nextTick(() => {
          if ( !this.animation ){
            setTimeout(() => {
              this.animation = true;
            }, 500)
          }
          this.$set(this.source, 'visible', this.isVisible);
          this.isMounted = true;
          this.$nextTick(() => {
            if ( this.isExpanded && this.numChildren ){
              let tree = this.getRef('tree');
              if ( tree && !tree.isLoaded && !tree.isLoading ){
                tree.updateData();
              }
            }
            setTimeout(() => {
              this.ready = true;
            }, 50)
          });
          this.resize();
        })
      },
      beforeDestroy(){
        if ( this.isSelected ){
          this.removeFromSelected(true, false);
        }
        if ( this.isExpanded ){
          this.removeFromExpanded(true, false);
        }
        if ( this.isActive && (this.tree.activeNode === this) ){
          this.tree.activeNode = false;
        }
        if ( this.parent.nodes.includes(this) ){
          this.parent.nodes.splice(this.parent.nodes.indexOf(this), 1);
        }
      },
      watch: {
        /**
         * @watch doubleClk
         * @param {Boolean} newVal
         * @memberof bbn-tree-node
         */
        doubleClk(newVal){
          if ( newVal ){
            setTimeout(() => {
              this.doubleClk = false
            }, 500);
          }
        },
        /**
         * Beware it's a computed, use tree.currentData[idx].expanded to change it.
         *
         * @watch isExpanded
         * @fires tree.updateData
         * @fires getRef
         * @fires resize
         * @fires addToExpanded
         * @fires removeFromExpanded
         * @fires tree.isNodeOf
         * @memberof bbn-tree-node
         */
        isExpanded(newVal) {
          if ( newVal ){
            if ( this.addToExpanded() ){
              let tree = this.getRef('tree');
              if ( this.numChildren && tree && !tree.isLoaded ){
                tree.updateData();
              }
              else{
                this.resize();
              }
            }
          }
          else {
            if ( this.removeFromExpanded() ){
              if ( this.tree.selectedNode && this.tree.isNodeOf(this.tree.selectedNode, this) ){
                this.isActive = true;
              }
              this.resize();
            }
          }
        },
        /**
         * @watch isSelected
         * @param {Boolean} newVal
         * @fires addToSelected
         * @fires removeFromSelected
         * @memberof bbn-tree-node
         */
        isSelected(newVal){
          if ( newVal ){
            this.addToSelected();
          }
          else {
            this.removeFromSelected();
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
          if ( newVal ){
            if ( this.tree.activeNode && (this.tree.activeNode !== this) ){
              this.tree.activeNode.isActive = false;
            }
            this.tree.activeNode = this;
          }
          else if ( this.tree.activeNode === this ){
            this.tree.activeNode = false;
          }
          this.tree.$emit(newVal ? 'activate' : 'deactivate', this);
        },
        isVisible(newVal){
          this.$set(this.source, 'visible', !!newVal);
        }
      }
    }
  }
};
