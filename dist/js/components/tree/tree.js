(bbn_resolve) => { ((bbn) => {
let script = document.createElement('script');
script.innerHTML = `<div :class="componentClass"
     tabindex="0"
     @keydown.up.down.left.right.enter.space.page-down.page-up.end.home.prevent.stop="keyNav"
>
  <div v-if="loading" class="loader">
    <bbn-loadicon></bbn-loadicon> <span v-text="_('Loading')"></span>...
  </div>
  <component v-else-if="isLoaded"
             :is="isRoot ? 'bbn-scroll' : 'div'"
             ref="scroll"
  >
    <transition name="bbn-tree-toggle"
                @after-enter="onOpen"
                @after-leave="onClose"
    >
      <ul v-if="filteredData.length && (isRoot || $parent.isExpanded)"
          :class="{
            'bbn-tree-child': !!level,
            'bbn-tree-root': isRoot
          }"
      >
        <bbn-tree-node inline-template
                        v-for="(it, i) in filteredData"
                        :source="it"
                        :key="level + '-' + i"
                        :idx="it.index"
                        :component="it.component || component"
                        :selectable="it.selectable !== undefined ? it.selectable : selectable"
                        :multiple="it.multiple !== undefined ? it.multiple : multiple"
                        :level="level"
                        :selection="it.selection !== undefined ? it.selection : selection"
                        :path="it.path"
                        ref="node"
                        :quickFilter="quickFilter"
                        :sortable="it.sortable !== undefined ? it.sortable : sortable"
                        :uid="uid"
        >
          <li :class="['bbn-tree-node', 'bbn-unselectable', {
                        'bbn-state-active': (isActive && !isSelected) || (tree.dragging && tree.overNode && !tree.overOrder && (tree.overNode === _self) && tree.draggable),
                        'bbn-state-selected': isSelected
                      }]"
              v-show="isVisible"
              :title="source.tooltip || source.data.text"
          >
            <span v-if="sortable && (source.num === 1)"
                  :class="['bbn-w-100', 'bbn-tree-order-top', {
                    'bbn-tree-order': tree.dragging && (tree.dragging.parent === parent) && !quickFilter,
                    'bbn-state-active': !!isOverOrderTop
                  }]"
                  style="height: 2px; line-height: 2px;"
                  ref="orderTop"
                  @mouseover.stop="mouseOver"
            ></span>
            <span :class="['bbn-tree-node-block', source.cls || '', {'bbn-tree-node-block-no-component': !!component}]"
                  @mouseover.stop="mouseOver"
            >
              <span class="bbn-tree-node-block-expander bbn-p"
                    @click="if ( numChildren && (level >= tree.minExpandLevel) ){
                      isExpanded = !isExpanded;
                    }"
                    @mouseover="if ( tree.draggable && tree.dragging && numChildren && (level >= tree.minExpandLevel) ){
                      isExpanded = true;
                    }"
              >
                <!-- If there are no children we leave the white space -->
                <span v-if="!numChildren || (level < tree.minExpandLevel)"> </span>
                <i v-else
                    :class="{
                      'nf nf-fa-caret_down': isExpanded,
                      'nf nf-fa-caret_right': !isExpanded
                    }"
                ></i>
              </span>
              <span v-if="tree.uid && (tree.selection || !!selection)">
                <bbn-checkbox :value="data[tree.uid]"
                              :checked="isChecked()"
                              @change="checkNode"
                              :disabled="isDisabled()"
                ></bbn-checkbox>
              </span>
              <component v-if="!!component"
                          :is="component"
                          :source="data"
              ></component>
              <bbn-context v-else
                            :context="true"
                            :source="getMenu"
                            @open="isActive = true"
                            @close="isActive = false"
              >
                <span :class="['bbn-tree-node-block-selectable', {'bbn-p': !!selectable}]"
                      @dblclick="dblClickOnNode"
                      @click="clickOnNode"
                      @mousedown.left="startDrag"
                      @mouseup.left="
                      if ( !doubleClk ){
                        if ( !tree.realDragging && selectable ){
                          isSelected = !isSelected;
                        }
                        doubleClk = true;
                      }"
                      tabindex="0"
                >
                  <span v-if="tree.icons"
                        :class="[{'with-zoom': ready}, 'bbn-tree-node-block-icon']"
                  >
                    <!-- If icon is specifically false we leave the white space -->
                    <span v-if="source.icon === false"></span>
                    <i v-else
                        :class="getIcon()"
                        :style="iconStyle"
                    ></i>
                  </span>
                  <span class="bbn-tree-node-block-title">
                    <span v-html="source.text"></span>
                  </span>
                </span>
              </bbn-context>
            </span>
            <bbn-tree v-if="!!numChildren"
                      ref="tree"
                      :key="level + '-' + idx + '-tree'"
                      class="bbn-text"
                      :component="component"
                      :source="tree.isAjax && !tree.hybrid ? tree.source : (data[tree.children] ? data[tree.children] : [])"
                      :level="level + 1"
                      :object="tree.object ? !tree.hybrid : false"
                      :path="path"
                      :autobind="false"
                      :filterable="isFilterable"
                      :selectable="source.selectable !== undefined ? source.selectable : tree.selectable"
                      :selection="source.selection !== undefined ? source.selection : tree.selection"
                      :cls="source.cls !== undefined ? source.cls : tree.cls"
                      :quickFilter="quickFilter"
                      :sortable="source.sortable !== undefined ? source.sortable : tree.sortable"
                      :multiple="source.multiple !== undefined ? source.multiple : tree.multiple"
                      :uid="uid"
                      :opened="!!tree.opened"
            ></bbn-tree>
            <span v-if="sortable"
                  :class="['bbn-w-100', 'bbn-tree-order-bottom', {
                    'bbn-tree-order': tree.dragging && (tree.dragging.parent === parent) && !quickFilter,
                    'bbn-state-active': !!isOverOrderBottom
                  }]"
                  style="height: 2px; line-height: 2px;"
                  ref="orderBottom"
                  @mouseover.stop="mouseOver"
            ></span>
          </li>
        </bbn-tree-node>
      </ul>
    </transition>
    <div class="bbn-tree-helper-container"
         v-if="(draggable || sortable) && isRoot"
         ref="helperContainer">
      <ul class="bbn-tree-helper"
          ref="helper"
          v-show="!!tree.realDragging"
      ></ul>
    </div>
  </component>
  <h2 v-else-if="isRoot"
      v-html="_('No items') + '...'"
  ></h2>
</div>
`;
script.setAttribute('id', 'bbn-tpl-component-tree');
script.setAttribute('type', 'text/x-template');
document.body.insertAdjacentElement('beforeend', script);
let css = document.createElement('link');
css.setAttribute('rel', "stylesheet");
css.setAttribute('href', bbn.vue.libURL + "dist/js/components/tree/tree.css");
document.head.insertAdjacentElement('beforeend', css);
/**
 * @file bbn-tree component
 * @description bbn-tree is the component that is easily implemented by allowing data to be displayed hierarchically using a tree structure.
 * The component can contain the data loaded only once or it can be created dynamically by making ajax calls, it also allows (after a correct configuration) to perform operations on them, for example drag & drop.
 * @copyright BBN Solutions
 * @author BBN Solutions
 * @created 10/02/2017
 */

(function(bbn){
  "use strict";

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

  Vue.component('bbn-tree', {
    /**
     * @mixin bbn.vue.basicComponent
     * @mixin bbn.vue.localStorageComponent
     * @mixin bbn.vue.listComponent
     */
    mixins: [bbn.vue.basicComponent, bbn.vue.localStorageComponent, bbn.vue.listComponent],
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
       * @prop {Array|String|Object|Function} source
       */
      source: {
        Type: [Array, String, Object, Function]
      },
      /**
       * The class given to the node (or a function returning the class name).
       * @prop {Function|String} cls
       */
      cls: {
        type: [Function, String]
      },
      /**
       * A component for the node.
       * @prop {Function|String|Object} component
       */
      component: {
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
       * @prop {Array|Function} menu
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
       * @prop {String|Function} iconColor
       */
      iconColor: {
        type: [String, Function]
      },
      /**
       * The value of the UID to send for the root tree.
       * @prop {String|Number} root
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
       * @prop {Arrayu} [[]] droppables
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
       * @prop {Function} trasferData
       */
      transferData: {
        type: Function
      },
      /**
       * An array containing the expanded nodes idx.
       * @prop {Array} [[]] expanded
       */
      expanded: {
        type: Array,
        default(){
          return [];
        }
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
      //@todo never used selectedValues
      selectedValues: {
        type: [Array, String],
        default(){
          return []
        }
      },
      value: {},
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
       * True if the tre has to be sortable.
       * @prop {Boolean} [false] sortable
       */
      sortable: {
        type: Boolean,
        default: false
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
       * Set to true if the prop 'ajax' is true,
       * the tree will make the ajax call only for
       * the source of the root level and will take
       * the current data for the source of other levels
       * @prop {Boolean} [false] hybrid
       */
      hybrid: {
        type: Boolean,
        default: false
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
         * An array containing the indexes of expanded nodes.
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
        nodes: []
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
          ret = bbn.fn.filter(this.currentData, (a) => {
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
          bbn.fn.each(NODE_PROPERTIES, p => {
            o[p] = item[p];
          })
          if ( item[this.tree.children] ){
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
        if ( this.tree.getRef('scroll') ){
          this.tree.getRef('scroll').onResize();
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
       * Returns a node basing on the given context.
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
          let parent = this.tree.activeNode.parent,
              data = parent.filteredData.filter(d => !!d.visible),
              min = 0,
              max = data.length - 1,
              idx = bbn.fn.search(data, {index: this.tree.activeNode.idx}),
              subtree = this.tree.activeNode.getRef('tree');
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
            this.updateData();
          }
          else {
            node = !node ? this.node : node;
            let tree = node.getRef('tree');
            if ( tree ){
              tree.isLoaded = false;
              tree.updateData();
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
      /**
       * Opens the node(s) corresponding to the prop 'path'
       * @method openPath
       */
      openPath(){
        this.$nextTick(() => {
          if ( this.path.length ){
            let current = bbn.fn.extend(true, [], this.path);
            if ( bbn.fn.isString(current[0]) ){
              current = [current];
            }
            bbn.fn.each(current, p => {
              let path = bbn.fn.extend(true, [], p),
                  criteria = path.shift(),
                  idx = -1;
              if ( bbn.fn.isObject(criteria) ){
                idx = bbn.fn.search(this.filteredData, {data: criteria});
                if ( idx === -1 ){
                  bbn.fn.each(this.filteredData, (d, i) => {
                    if ( !bbn.fn.numProperties(bbn.fn.diffObj(bbn.fn.extend(true, {}, d.data), criteria)) ){
                      idx = i;
                      return true;
                    }
                  })
                }
              }
              else if ( this.tree.uid ){
                idx = bbn.fn.search(this.filteredData, {['data.' + this.tree.uid]: criteria});
              }
              else if ( bbn.fn.isNumber(criteria) ){
                idx = criteria;
              }
              if ( idx > -1 ){
                if ( path.length ){
                  this.$set(this.filteredData[idx], 'expanded', true);
                  this.$set(this.filteredData[idx], 'selected', false);
                  if ( !bbn.fn.isArray(this.filteredData[idx].path) ){
                    this.$set(this.filteredData[idx], 'path', []);
                  }
                  this.filteredData[idx].path.push(path);
                }
                else {
                  this.$set(this.filteredData[idx], 'selected', true);
                  this.$nextTick(() => {
                    setTimeout(() => {
                      this.scrollToSelected();
                    }, 200)
                  })
                }
              }
            })
          }
        })
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
       *  Moves a node to or inside a tree.
       * @method move
       * @param {Object} node 
       * @param {Object} target 
       * @param {Boolean} [false] force 
       */
      move(node, target, force = false){
        let ev = false;
        if ( !force ){
          ev = new Event("move", {cancelable: true});
          this.tree.$emit('move', node, target, ev);
        }
        if ( force || (ev && !ev.defaultPrevented) ){
          let idx = node.idx,
              parent = node.parent,
              nodes = node.findAll('bbn-tree-node'),
              expanded = nodes.filter(n => !!n.isExpanded),
              selected = nodes.filter(n => !!n.isSelected),
              toPath = [];
          if ( (idx >= 0) && parent ){
            if ( !target.numChildren ){
              target.$set(target, 'numChildren', 1);
            }
            else{
              target.numChildren++;
            }
            this.$nextTick(() => {
              let targetTree = target.getRef('tree');
              if ( node.isExpanded ){
                expanded.unshift(node);
              }
              bbn.fn.each(expanded, n => {
                let p = parent.getNodePath(n);
                p.push(false);
                toPath.push(p);
              });
              if ( node.isSelected ){
                selected.unshift(node);
              }
              bbn.fn.each(selected, n => {
                toPath.push(parent.getNodePath(n));
              });
              if ( parent.node ){
                parent.node.numChildren--;
              }
              if ( this.tree.isAjax ){
                let nodeSource = bbn.fn.extend(true, {}, parent.currentData[idx]);
                nodeSource.num = targetTree.currentData.length || 1;
                nodeSource.index = nodeSource.num - 1
                targetTree.currentData.push(nodeSource);
              }
              else {
                let nodeSource = parent.source.splice(idx, 1)[0];
                if ( !bbn.fn.isArray(target.source.data[this.tree.children]) ){
                  target.$set(target.source.data, this.tree.children, []);
                }
                target.source.data[this.tree.children].push(nodeSource);
              }
              bbn.fn.each(expanded, n => {
                n.removeFromExpanded(false);
              });
              bbn.fn.each(selected, n => {
                n.removeFromSelected(false);
              });
              this.$nextTick(() => {
                let callOpenPath = false;
                if ( !target.isExpanded ){
                    target.isExpanded = true;
                }
                else if ( !this.tree.isAjax ){
                  targetTree.updateData();
                  callOpenPath = true;
                }
                if ( toPath.length ){
                  bbn.fn.each(toPath, p => {
                    targetTree.path.push(p);
                  })
                }
                if ( callOpenPath ){
                  targetTree.openPath();
                }
                parent.currentData.splice(idx, 1);
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
          if ( NODE_PROPERTIES.indexOf(n) === -1 ){
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
          path: []
        };
        // Expanded
        bbn.fn.each(this.currentExpanded, c => {
          let e = this.getNodePath(c);
          e.push(false);
          cfg.path.push(e);
        });
        // Selected
        bbn.fn.each(this.currentSelected, c => {
          cfg.path.push(this.getNodePath(c));
        });
        return cfg;
      },
      /**
       * Gets the local storage.
       * @method getLocalStorage
       */
      getLocalStorage(){
        if ( this.isRoot && this.hasStorage ){
          let cfg = this.getStorage(this.storageFullName || this.storageName, !!this.storageFullName);
          if ( cfg && cfg.path !== undefined ){
            this.path.splice(0, this.path.length, ...cfg.path);
          }
          else {
            this.path.splice(0, this.path.length);
          }
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
        if ( this.isRoot && this.selectedNode ){
          let scroll = this.getRef('scroll');
          if ( scroll ){
            scroll.scrollTo(0, this.selectedNode.$el);
          }
        }
      },
      /**
       * Scrolls the tree to the active node.
       * @method scrollToActive
       */
      scrollToActive(){
        if ( this.isRoot && this.activeNode ){
          let scroll = this.getRef('scroll');
          if ( scroll ){
            scroll.scrollTo(0, this.activeNode.$el);
          }
        }
      }
    },
    /**
     * Emits the event beforeLoad and load. And opens the nodes defined in the prop path.
     * @event beforeCreate
     * @emits beforeLoad
     * @emits load
     */
    beforeCreate(){
      this.$on('beforeUpdate', e => {
        if ( this.isAjax && (this.tree.isLoading || this.isLoading) ){
          e.preventDefault();
        }
        if ( !e.defaultPrevented ){
          this.tree.$emit('beforeLoad', this.getPostData());
        }
      });
      this.$on('startloading', () => {
        //this.tree.isLoading = true;
        this.loading = true;
      });
      this.$on('dataReceived', d => {
        //this.tree.isLoading = false;
        this.loading = false;
        this.$emit('load', d);
      });
      this.$on('dataloaded', () => {
        if ( !this.isLoaded && this.ready ){
          this.getLocalStorage()
          this.openPath();
        }
        this.isLoaded = true;
      });
    },
    /**
     * Definition of the root tree and parent node.
     * @event created
     */
    created(){
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
     * Gets the local storage.
     * @event beforeMount
     */
    beforeMount(){
      this.getLocalStorage();
    },
    /**
     * Updates the data of the tree and sets the prop 'ready' to true.
     * @event mounted
     * @fires updateData
     */
    mounted(){
      this.$nextTick(() => {
        if ( this.node.isExpanded ){
          this.updateData();
        }
      })
      this.ready = true;
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
       * Opens the corresponding node when the prop 'path' changes.
       * @watch path
       * @param {String} newVal
       * @emits pathChange
       */
      path(newVal){
        if ( !this.isLoaded ){
          if ( this.isRoot || this.ready ){
            this.openPath();
          }
        }
        this.$emit('pathChange', newVal);
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
            type: [String, Function, Vue, Object]
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
          }
        },
        methods: {
          randomString: bbn.fn.randomString,
          /**
           * Return true if the node is checked
           * @method isChecked
           * @memberof bbn-tree-node
           */
          isChecked(){
           return this.tree.checked.includes(this.data[this.tree.uid])
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
           * @memberof bbn-tree-node
           */
          startDrag(e){
            setTimeout(() => {
              if ( !this.doubleClk && (this.tree.draggable || this.sortable)  ){
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
                let fn = (e) => {
                  this.endDrag(e);
                  document.removeEventListener('mouseup', fn);
                };
                document.addEventListener('mouseup', fn);
                document.addEventListener('mousemove', this.drag);
              }
            }, 100)
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
            e.stopImmediatePropagation();
            e.preventDefault();
            this.tree.getRef('helper').style.left = (e.pageX + 2) + 'px';
            this.tree.getRef('helper').style.top = (e.pageY + 2) + 'px';
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
            if ( !this.tree.realDragging ){
              if ( this.tree.selectedNode ){
                //this.tree.selectedNode.isSelected = false;
              }
              let ev = new Event("dragStart");
              this.tree.$emit("dragStart", this, ev);
              if (!ev.defaultPrevented) {
                this.tree.realDragging = true;
                let helper = this.tree.getRef('helper');
                if ( helper ) {
                  helper.innerHTML = this.$el.outerHTML;
                }
              }
            }
            else{
              if ( this.tree.droppableTrees.length ){
                bbn.fn.each(this.tree.droppableTrees, (a) => {
                  let v = a && a.$el ? a.$el.querySelector('.dropping') : null;
                  if ( v && v.classList ){
                    v.classList.remove('dropping');
                  }
                });
              }
              let ok = false;
              for ( let a of this.tree.droppableTrees ){
                if (
                  a.overNode &&
                  (a.dragging !== a.overNode) &&
                  !a.isNodeOf(a.overNode, this.tree.dragging) &&
                  (!a.overNode.$refs.tree || (a.overNode.$refs.tree[0] !== this.parent))
                ){
                  let t = e.target,
                      parents = [];
                  while (t) {
                    parents.unshift(t);
                    t = t.parentNode;
                  }
                  if ( parents.length ){
                    bbn.fn.each(parents, (b, i) => {
                      if ( b === a.overNode.$el ){
                        ok = 1;
                        return false;
                      }
                      else if ( b === this.$el ){
                        return false;
                      }
                    })
                  }
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
            let removed = false;
            if ( this.tree.realDragging ){
              this.tree.getRef('helper').innerHTML = '';
              this.tree.realDragging = false;
              if ( this.tree.droppableTrees.length ){
                for ( let a of this.tree.droppableTrees ){
                  if (
                    a.overNode &&
                    (this.tree.dragging !== a.overNode) &&
                    !a.isNodeOf(a.overNode, this.tree.dragging)
                  ){
                    if ( a.overOrder ){
                      let numBefore = this.tree.dragging.source.num,
                          numAfter = a.overOrder.classList.contains('bbn-tree-order-top') ? 1 : a.overNode.source.num + 1;
                          if ( numBefore !== numAfter ){
                            this.reorder(this.tree.dragging.source.num, numAfter);
                          }
                    }
                    else if ( this.tree.draggable ){
                      if( a.overNode.$el.querySelector('span.node') && a.overNode.$el.querySelector('span.node').classList ){
                        if ( a.overNode.$el.querySelector('span.node').classList.contains('dropping') ){
                          a.overNode.$el.querySelector('span.node').classList.remove('dropping')
                        }
                      }
                      this.removeDragging();
                      removed = true;
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
              }
              else{
                let ev = new Event("dragEnd");
                this.removeDragging();
                removed = true;
                this.tree.$emit("dragEnd", this, ev);
              }
            }
            if ( !removed ){
              this.removeDragging();
            }
          },
          removeDragging(){
            document.removeEventListener('mousemove', this.drag);
            for ( let a of this.tree.droppableTrees ){
              a.dragging = false;
            }
          },
          reorder(oldNum, newNum, force){
            if ( oldNum !== newNum ){
              let arr = this.parent.filteredData.slice(),
                  ele = arr.splice(oldNum-1, 1),
                  ev = new Event('beforeOrder', {cancelable: true});
              if ( ele.length ){
                if ( !force ){
                  this.tree.$emit('beforeOrder', oldNum, newNum, this.tree.dragging, ev);
                }
                if ( !!force || !ev.defaultPrevented ){
                  arr.splice(newNum-1, 0, ele[0]);
                  bbn.fn.each(arr, (e, i) => {
                    if ( e.num !== (i + 1) ){
                      let data = bbn.fn.extend(true, {}, e.data);
                      e.num = i + 1;
                      if ( e.data.num !== undefined ){
                        //e.data.num = e.num;
                      }
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
            this.tree.overNode = this.tree.dragging && (this.tree.draggable || this.sortable) ? this : false;
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
            if ( !this.tree.currentSelected.includes(this) ){
              let sameParent = this.tree.selectedNode && (this.tree.selectedNode.parent === this.parent);
              if ( (this.tree.selectedNode && !this.tree.multiple) || (sameParent && !this.parent.multiple) ){
                this.tree.selectedNode.isSelected = false;
              }
              let ev = new Event('beforeSelect', {cancelable: true});
              if ( emit ){
                this.tree.$emit('beforeSelect', this, ev);
              }
              if ( !ev.defaultPrevented ){
                this.tree.currentSelected.push(this);
                if ( storage ){
                  this.$nextTick(() => {
                    this.tree.setLocalStorage();
                  })
                }
                if ( emit ){
                  this.tree.$emit('select', this);
                }
                if ( this.tree !== this.parent ){
                  this.parent.currentSelected.push(this);
                  if ( emit ){
                    this.parent.$emit('select', this);
                  }
                }
              }
            }
          },
          removeFromSelected(emit = true, storage = true){
            let idx = this.tree.currentSelected.indexOf(this),
                idx2 = this.parent.currentSelected.indexOf(this),
                ev = new Event('beforeSelect', {cancelable: true});
            if ( emit ){
              this.tree.$emit('beforeUnselect', this, ev);
            }
            if ( !ev.defaultPrevented ){
              if ( idx > -1 ){
                this.tree.currentSelected.splice(idx, 1);
                if ( storage ){
                  this.$nextTick(() => {
                    this.tree.setLocalStorage();
                  })
                }
                if ( emit ){
                  this.tree.$emit('unselect', this);
                }
              }
              if ( (idx2 > -1) && (this.tree !== this.parent) ){
                this.parent.currentSelected.splice(idx, 1);
                if ( emit ){
                  this.parent.$emit('unselect', this);
                }
              }
            }
          },
          addToExpanded(emit = true, storage = true){
            if ( !this.tree.currentExpanded.includes(this) ){
              let ev = new Event('beforeUnfold', {cancelable: true});
              if ( emit ){
                this.tree.$emit('beforeUnfold', this, ev);
              }
              if ( !ev.defaultPrevented ){
                this.tree.currentExpanded.push(this);
                if ( storage ){
                  this.$nextTick(() => {
                    this.tree.setLocalStorage();
                  })
                }
                if ( emit ){
                  this.tree.$emit('unfold', this);
                }
                if ( this.tree !== this.parent ){
                  this.parent.currentExpanded.push(this);
                  if ( emit ){
                    this.parent.$emit('unfold', this);
                  }
                }
                return true;
              }
            }
            return false;
          },
          removeFromExpanded(emit = true, storage = true){
            let idx = this.tree.currentExpanded.indexOf(this),
                idx2 = this.parent.currentExpanded.indexOf(this),
                ev = new Event('beforeFold', {cancelable: true});
            if ( emit ){
              this.tree.$emit('beforeFold', this, ev);
            }
            if ( !ev.defaultPrevented ){
              if ( idx > -1 ){
                this.tree.currentExpanded.splice(idx, 1);
                if ( storage ){
                  this.$nextTick(() => {
                    this.tree.setLocalStorage();
                  })
                }
                if ( emit ){
                  this.tree.$emit('fold', this);
                }
              }
              if ( (idx2 > -1) && (this.tree !== this.parent) ){
                this.parent.currentExpanded.splice(idx, 1);
                if ( emit ){
                  this.parent.$emit('fold', this);
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
          }
        },
        /**
         * Defines the props tree and parent of the node
         * @event created
         * @memberof bbn-tree-node
         */
        created(){
          this.parent = this.closest('bbn-tree');
          this.tree = this.parent.tree || this.parent;
          if ( this.source.selected ){
            this.addToSelected();
          }
          if ( !this.parent.nodes.includes(this) ){
            this.parent.nodes.push(this);
          }
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
            });
            this.resize();
            setTimeout(() => {
              this.ready = true;
            }, 250)
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
           * @watch isExpanded
           * @fires tree.updateData
           * @fires getRef
           * @fires resize
           * @fires addToExpanded
           * @fires removeFromExpanded
           * @fires tree.isNodeOf
           * @memberof bbn-tree-node
           */
          isExpanded(newVal){
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
  });

})(bbn);

if (bbn_resolve) {bbn_resolve("ok");}
})(bbn); }