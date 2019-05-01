/**
 * @file bbn-list displays a list of data.
 * <br>What represents can have a hierarchical structure.
 * <br>It can be used as a menu to perform actions. Each bbn-list item can also be a custom component.
 *
 *
 */


/**
 * Created by BBN on 10/02/2017.
 */


(function ($, bbn) {
  "use strict";

  const NODE_PROPERTIES = ["selected", "selectedClass", "activeClass", "expanded", "tooltip", "icon", "selectable", "text", "data", "cls", "component", "num", "source", "level", "items"];

  Vue.component('bbn-list', {
    mixins: [bbn.vue.basicComponent, bbn.vue.localStorageComponent],
    // The events that will be emitted by this component
    _emitter: ['dragstart', 'drag', 'dragend', 'select', 'open'],
    props: {
      // property to remove nf nf-fa-caret icons from all level of items of list
      arrowIcons: {
        type: Boolean,
        default: true
      },
      // a property to identify the index of the children in parent's childrens */
      nodeIdx: {
        type: Number
      },
      num: {
        type: Number,
        // default: 0
      },
      // The level until which the hierarchy must be opened
      minExpandLevel: {
        type: Number,
        default: 0
      },
      // True if the whole hierarchy must be opened
      opened: {
        type: Boolean,
        default: false
      },
      // the icon of the item when expanded
      expandedIcon: {
        type: String,
        default: 'nf nf-fa-angle_down'
      },
      // the icon of the item when expandible but closed
      closedIcon: {
        type: String,
        default: 'nf nf-fa-angle_right'
      },
      // A function for mapping the hierarchy data
      map: {
        type: Function,
      },
      // The data to send to the server
      data: {
        type: [Object, Function],
        default () {
          return {};
        }
      },
      // An array of objects representing the nodes
      source: {
        Type: [Array, String]
      },
      // Set to false if the source shouldn't be loaded at mount time
      autoload: {
        type: Boolean,
        default: true
      },
      selectable: {
        type: Boolean,
        default: false
      },
      unselectable: {
        type: Boolean,
        default: false
      },
      // The class given to the node (or a function returning the class name)
      cls: {
        type: [Function, String]
      },
      // A component for the node
      component: {
        type: [Function, String, Object]
      },
      // The data field used as UID
      uid: {
        Type: String
      },
      // Set to true for having the nodes draggable
      draggable: {
        type: Boolean,
        default: false
      },
      // Set to true border the li
      bordered: {
        type: Boolean,
        default: true
      },
      // An array (or a function returning one) of elements for the node context menu
      menu: {
        type: [Array, Function]
      },
      // An string (or a function returning one) for the icon's color
      iconColor: {
        type: [String, Function]
      },
      // The value of the UID to send for the root hierarchy
      root: {
        type: [String, Number]
      },
      // The hierarchy level, root is 0, and for each generation 1 is added to the level
      level: {
        type: Number,
        default: 0
      },
      // Other hierarchys where nodes can be dropped on
      droppables: {
        type: Array,
        default () {
          return [];
        }
      },
      // If set to false a draggable hierarchy will not be able to drop on itself
      selfDrop: {
        type: Boolean,
        default: true
      },
      value: {}
    },

    data() {
      let items = this.getItems();
      return {
        isLastParent: false,
        over: false,
        // True when the data is currently loading in the hierarchy (unique to the root)
        isLoading: false,
        // True when the data is currently loading in the current hierarchy
        loading: false,
        active: false,
        num_children: this.num !== undefined ? this.num : items.length,
        styled: false,
        // Only for the origin hierarchy
        isRoot: false,
        // The parent node if not root
        node: false,
        // The parent hierarchy if not root
        hierarchy: false,
        // The URL where to pick the data from if isAjax
        url: typeof (this.source) === 'string' ? this.source : false,
        // Is the data provided from the server side
        isAjax: typeof (this.source) === 'string',
        // True once the data of the hierarchy has been loaded
        isLoaded: false,
        // True once the component is mounted
        isMounted: false,
        // The actual list of items (nodes)
        items: items,
        // The currently active item
        activeItem: [],
        // The currently selected node component object
        selected: false,
        // The component node object over which the mouse is now
        overNode: false,
        // dragging state, true if an element is being dragged
        dragging: false,
        // Real dragging will start after the mouse's first move, useful to kow if we are in a select or drag context
        realDragging: false,
        expanded: [],
        selectedNode: false,
        checked: [],
        disabled: [],
      };
    },

    computed: {
      item_path() {
        let path = [],
          cp = this;
        while (cp.nodeIdx !== undefined) {
          path.unshift(cp.nodeIdx);
          cp = cp.$parent;
        }
        return path;
      },
      droppablehierarchys() {
        let r = this.selfDrop ? [this] : [];
        if (this.droppables && this.droppables.length) {
          for (let a of this.droppables) {
            r.push(a);
          }
        }
        return r;
      }
    },

    methods: {
      isSame(obj, ob) {
        return bbn.fn.numProperties(bbn.fn.diffObj(obj, ob)) === 0;
      },
      select(item, idx) {
        let path = [idx],
            cp = this;
        if ( (this.hierarchy.selectedNode === false) || ( this.hierarchy.selectedNode.text !== item.text) ) {
          this.selected = idx;
          while (cp.nodeIdx !== undefined) {
            path.unshift(cp.nodeIdx);
            cp = cp.$parent;
          }
          this.hierarchy.selectedNode = item;
          return this.hierarchy.$emit('select', item, idx, path );
        }
        else{
          this.selected = false;
          this.hierarchy.selectedNode = false;
          return this.hierarchy.$emit('unselect', item, idx, path );
        }
      },
     /* select(item, idx) {

        let path = [idx],
            cp = this;
        this.selected = idx;
        while (cp.nodeIdx !== undefined) {
          path.unshift(cp.nodeIdx);
          cp = cp.$parent;
        }

        bbn.fn.log('select', item, idx, this.selected)

        return this.hierarchy.$emit('select', item, idx, path, );
      },*/


      removeExpanded(i) {
        let idx = this.expanded.indexOf(i);
        if ((idx > -1) && this.items[i]) {
          this.expanded.splice(idx, 1)
          this.hierarchy.$emit('close', i, this.items[i]);
        }

      },

      addExpanded(i) {
        let idx = this.expanded.indexOf(i);
        // this.$emit('open', i);
        if ((idx === -1) && this.items[i] && this.items[i].items && this.items[i].items.length) {
          this.expanded.push(i);
          this.hierarchy.$emit('open', i, this.items[i]);
        }

      },

      toggleExpanded(i) {

        let idx = this.expanded.indexOf(i);
        if (idx > -1) {
          this.removeExpanded(i);
        } else {
          this.addExpanded(i);
          //this.hierarchy.$emit('open', i, this.items[i]);
        }
      },

      isExpanded(i) {
        return this.expanded.indexOf(i) > -1;
      },

      isMatch(item) {
        return true;
      },

      getNumMatches(item) {
        return 1;
      },
      /** emit the event mouseover and add the class k-state-selected'*/
      activate(i, item, target) {
        this.active = i;
        let path = [i],
          cp = this;
        while (cp.nodeIdx !== undefined) {
          path.unshift(cp.nodeIdx);
          cp = cp.$parent;
        }
        this.hierarchy.activeItem = path;
        this.hierarchy.$emit('mouseover', i, item, path);
      },

      getItems() {
        let items = [];
        if (bbn.fn.isArray(this.source)) {
          if (this.map) {
            $.each(this.source, (i, a) => {
              items.push(this.map(a));
            })
          } else {
            items = this.source.slice();
          }
        } else {
          items = [];
        }
        return items;
      },
      reset() {
        if (this.isAjax) {
          this.load();
        } else {
          this.items = this.getItems();
          this.$forceUpdate();
        }
      },

      // Resize the root scroller
      resize() {
        if (this.hierarchy.$refs.scroll) {
          this.hierarchy.$refs.scroll.onResize();
        }
      },


      /** @todo onOpen and onClose don't work*/
      // Make the root hierarchy resize and emit an open event
      onOpen() {
        this.resize();
        this.$emit('open');
        this.hierarchy.$emit('open', this);
      },

      // Make the root hierarchy resize and emit a close event
      onClose() {
        this.resize();
        this.$emit('close');
        this.hierarchy.$emit('close', this);
      },


      // Returns an object with the data to send for a given node
      // If UID has been given obj will only have this prop other the whole data object
      dataToSend() {
        // The final object to send
        let r = {},
          uid = this.uid || this.hierarchy.uid;
        // If the uid field is defined
        if (uid) {
          // If an item has been given we send the corresponding data, or otherwise an empty string
          if (this.node) {
            r[uid] = this.node.data && this.node.data[uid] ? this.node.data[uid] : '';
          } else if (this.isRoot) {
            r[uid] = this.root ? this.root : '';
          }
        } else if (this.node) {
          r = this.node.data;
        } else if (bbn.fn.isFunction(this.data)) {
          r = this.data();
        } else {
          r = this.data;
        }
        return r;
      },

      // Makes an object out of the given properties, adding to data all non existing props
      normalize(obj) {
        let r = {
          data: {}
        };
        if (obj.text || obj.icon) {
          for (let n in obj) {
            if (obj.hasOwnProperty(n) && (typeof n === 'string')) {
              if ($.inArray(n, NODE_PROPERTIES) > -1) {
                r[n] = obj[n];
              } else {
                r.data[n] = obj[n];
              }
            }
          }
          return r;
        }
        return false;
      },

      // Manages the key navigation inside the hierarchy
      keyNav(e) {
        e.preventDefault();
        e.stopImmediatePropagation();
        if (this.hierarchy.activeNode) {
          let idx = false,
            min = 1,
            max = this.hierarchy.activeNode.$parent.$children.length - 1,
            parent = this.hierarchy.activeNode.$parent;
          $.each(this.hierarchy.activeNode.$parent.$children, (i, a) => {
            if (a === this.hierarchy.activeNode) {
              idx = i;
              return false;
            }
          });
          bbn.fn.log("keyNav", idx, max, e.key);
          switch (e.key) {
            case 'Enter':
            case ' ':
              this.hierarchy.activeNode.isSelected = !this.hierarchy.activeNode.isSelected;
              break;
            case 'PageDown':
            case 'End':
              if (this.hierarchy.activeNode) {
                this.hierarchy.activeNode.isActive = false;
              }
              let node = this.$refs.root;
              while (node.$children.length && node.isExpanded) {
                node = node.$children[node.$children.length - 1];
              }
              node.isActive = true;
              break;

            case 'PageUp':
            case 'Home':
              if (this.hierarchy.activeNode) {
                this.hierarchy.activeNode.isActive = false;
              }
              if (this.$refs.root.$children[1]) {
                this.$refs.root.$children[1].isActive = true;
              }
              break;

            case 'ArrowLeft':
              if (this.hierarchy.activeNode.isExpanded) {
                this.hierarchy.activeNode.isExpanded = false;
              } else if (this.hierarchy.activeNode.$parent !== this.$refs.root) {
                this.hierarchy.activeNode.$parent.isActive = true;
              }
              break;
            case 'ArrowRight':
              if (!this.hierarchy.activeNode.isExpanded) {
                this.hierarchy.activeNode.isExpanded = true;
              }
              break;
            case 'ArrowDown':
              if (this.hierarchy.activeNode.isExpanded && (this.hierarchy.activeNode.items.length > 1)) {
                this.hierarchy.activeNode.$children[1].isActive = true;
              } else if (idx < max) {
                bbn.fn.log("ORKING");
                parent.$children[idx + 1].isActive = true;
              } else {
                let c = this.hierarchy.activeNode,
                  p = this.hierarchy.activeNode.$parent;
                while ((p.level > 0) && !p.$children[idx + 1]) {
                  c = p;
                  p = p.$parent;
                  $.each(p.$children, (i, a) => {
                    if (a === c) {
                      idx = i;
                      return false;
                    }
                  });
                }
                if (p.$children[idx + 1]) {
                  p.$children[idx + 1].isActive = true;
                }
              }
              break;
            case 'ArrowUp':
              if (idx > min) {
                if (parent.$children[idx - 1].isExpanded && parent.$children[idx - 1].items.length) {
                  let p = parent.$children[idx - 1],
                    c = p.$children[p.$children.length - 1];
                  while (c.isExpanded && c.items.length) {
                    p = c;
                    c = p.$children[p.$children.length - 1];
                  }
                  c.isActive = true;
                } else {
                  parent.$children[idx - 1].isActive = true;
                }
              } else {
                if (parent !== this.$refs.root) {
                  parent.isActive = true;
                }
                /*
                let c = this.hierarchy.activeNode.$parent,
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
        } else if (this.hierarchy.selectedNode) {
          this.hierarchy.activeNode = this.hierarchy.selectedNode;
        }
      },

      // Reloads a node already loaded
      reload(node) {
        if (this.isAjax) {
          if (!node) {
            if (this.isRoot) {
              this.items = [];
              this.isLoaded = false;
              this.$nextTick(() => {
                this.load();
              })
            } else {
              this.node.isExpanded = false;
              this.node.$refs.hierarchy[0].isLoaded = false;
              this.node.$forceUpdate();
              this.$nextTick(() => {
                this.node.isExpanded = true;
              })
            }
          } else if (node.$refs.hierarchy) {
            node.isExpanded = false;
            node.$refs.hierarchy[0].isLoaded = false;
            node.$forceUpdate();
            this.$nextTick(() => {
              node.isExpanded = true;
            })
          }
        }
      },

      mapper(fn, data) {
        let res = [];
        $.each(data, (i, a) => {
          let tmp = fn(a);
          if (tmp.items) {
            tmp.items = this.mapper(fn, tmp.items);
          }
          res.push(tmp);
        });
        return res;
      },

      // Loads a node
      load() {
        // It must be Ajax and not being already in loading state
        if (this.isAjax && !this.hierarchy.isLoading && !this.isLoaded) {
          this.hierarchy.isLoading = true;
          this.loading = true;
          this.hierarchy.$emit('beforeLoad', this.dataToSend());
          bbn.fn.post(this.hierarchy.url, this.dataToSend(), (res) => {
            this.hierarchy.isLoading = false;
            this.loading = false;
            if (res.data) {
              if (this.hierarchy.map) {
                this.items = this.mapper(this.hierarchy.map, res.data);
              } else {
                this.items = res.data;
              }
            }
            this.isLoaded = true;
          })
        }
      },


    },

    // Definition of the root hierarchy and parent node
    created() {
      let cp = bbn.vue.closest(this, 'bbn-list');
      if (!cp) {
        this.isRoot = true;
        this.node = false;
        this.hierarchy = this;
      } else {
        while (cp && cp.level) {
          cp = bbn.vue.closest(cp, 'bbn-list');
        }
        if (cp && !cp.level) {
          this.hierarchy = cp;
          this.isAjax = this.hierarchy.isAjax;
        }
        this.node = bbn.vue.closest(this, 'bbn-list-node');
      }
      if (!this.isAjax || this.items.length) {
        this.isLoaded = true;
      }
    },

    mounted() {
      if (this.isRoot && this.autoload) {
        this.load();
      } else if (this.isExpanded) {
        this.load();
      }
      this.ready = true;
      //if the property opened is given it expands all items at the first level

      this.$nextTick(()=>{
        if ( this.opened ){
          bbn.fn.each(this.source ,(v, i) => {
            this.addExpanded(i)
          });
        }
      })

    },

    watch: {
      over(val) {
        //to have bbn-state-hover on the li parent if the hover-item has no children
       // alert('hover')
        if ( !val.items || !val.items.length ){
          this.isLastParent = true;
        }
        //bbn.fn.log(JSON.stringify(val),  this)
        if (val !== false) {
          this.hierarchy.overNode = val;
          this.hierarchy.$emit('mouseover', val);
        }
        else if (val === false) {
          this.hierarchy.overNode = false;
          this.hierarchy.$emit('mouseout', val);
        }
      },
      source() {
        this.reset();
        this.load();
      }
    }
  });

})(jQuery, bbn);
