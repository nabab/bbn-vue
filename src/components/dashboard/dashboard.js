 /**
  * @file bbn-dashboard component
  *
  * @description bbn-dashboard represents a user's interface containing bbn-widgets.
  * Details of widgets, such as data and positions, can be easily managed.
  *
  * @author BBN Solutions
  *
  * @copyright BBN Solutions
  *
  * @created 15/02/2017.
  */

return {
    /**
     * @mixin bbn.wc.mixins.basic
     * @mixin bbn.wc.mixins.resizer
     * @mixin bbn.wc.mixins.localStorage
     */
    mixins: 
    [
      bbn.wc.mixins.basic, 
      bbn.wc.mixins.resizer, 
      bbn.wc.mixins.localStorage
    ],
    static() {
      return {
        limits: [5, 10, 15, 20, 25, 30, 40, 50]
      };
    },
    props: {
      /**
       * @prop {Object} [{}] components
       */
      components: {
        type: Object,
        default(){
          return {};
        }
      },
      /**
       * @prop {Number} max
       */
      max: {
        type: Number
      },
      /**
       * @prop {Boolean} [true] selectable
       */
      selectable: {
        type: Boolean,
        default: true
      },
      /**
       * Set to true makes the widgets inside the dashboard closeable.
       * @prop {Boolean} [true] closable
       */
      closable: {
        type: Boolean,
        default: true
      },
      /**
       * Set to true makes the widgets in the dashboard sortable.
       * @prop {Boolean} [true] sortable
       */
      sortable: {
        type: Boolean,
        default: true
      },
      /**
       * Set to true makes the dashboard scrollable.
       * @prop {Boolean} [true] scrollable
       */
      scrollable: {
        type: Boolean,
        default: true
      },
      /**
       * The source of the dashboard.
       * @prop {Array} [[]] source
       */
      source: {
        default(){
          return [];
        }
      },
      /**
       * The url for the post, in case of actions on the dashboard's widgets.
       * @prop {String} url
       */
      url: {},
      /**
       * @prop {Object} loadedConfig
       */
      loadedConfig: {
        type: Object
      },
      /**
       * @prop {Array} order
       */
      order: {
        type: Array,
        default(){
          return [];
        }
      },
      /**
       * The object of configuration of the dashboard.
       * @prop {Object} cfg
       */
      cfg: {
        type: Object,
        default(){
          return {
            sortable: true,
            url: false,
            source: [],
            components: {}
          };
        }
      }
    },
    data(){
      return {
        /**
         * @data {Array} [[]] originalSource
         */
        originalSource: [],
        /**
         * @data {Array} [[]] menu
         */
        menu: [],
        /**
         * @data {Boolean} [false] isRefreshing
         */
        isRefreshing: false,
        /**
         * @data {Array} [[]] widgets
         */
        widgets: [],
        /**
         * @data {Array} [[]] currentOrder
         */
        currentOrder: this.order.slice(),
        /**
         * @data sortTargetIndex
         */
        sortTargetIndex: null,
        /**
         * @data sortOriginIndex
         */
        sortOriginIndex: null,
        /**
         * @data {Boolean} [false] isSorting
         */
        isSorting: false,
        /**
         * @data {Boolean} [false] isDragging
         */
        isDragging: false,
        /**
         * @data {Boolean} [false] sortTimeout
         */
        sortTimeout: false,
        /**
         * @data {Boolean} [false] sortingElement
         */
        sortingElement: false,
        /**
         * @data {Number} [0] sortHelperWidth
         */
        sortHelperWidth: 0,
        /**
         * @data {Number} [0] sortHelperHeight
         */
        sortHelperHeight: 0,
        /**
         * @data {Number} [0] sortHelperX
         */
        sortHelperX: 0,
        /**
         * @data {Number} [0] sortHelperY
         */
        sortHelperY: 0,
        /**
         * @data {Boolean} [[]] currentSlots
         */
        currentSlots: [],
        /**
         * @data {Boolean} [false] resizeTimeout
         */
        resizeTimeout: false,
        /**
         * @data {Number} [1] numCols
         */
        numCols: 1
      };
    },
    computed: {
      /**
       * Widget order list.
       * @return {Array} originalOrder
       */
      originalOrder(){
        return bbn.fn.map(this.originalSource, d => d.key);
      },
      /**
       * Widget order listInforms whether the widget origin has been changed.
       * @return {Boolean} isOrderChanged
       */
      isOrderChanged(){
        if ( !this.originalOrder ){
          return false;
        }
        return JSON.stringify(this.originalOrder) !== JSON.stringify(this.currentOrder);
      }
    },
    methods: {
      /**
       * Sets the configuration of the dashboard.
       * @method setConfig
       * @param {String} uid
       * @param {Object} config
       * @fires setStorage
       */
      setConfig(uid, config){
        this.setStorage({
          order: config.order
        }, uid);
      },
      /**
       * Close widget in dashboard.
       * @method closeWidget
       * @param {String} uid
       * @param {Object} widget
       * @fires updateWidget
       * @emits close
       */
      closeWidget(uid, widget){
        let ev = new Event('close', {cancelable: true});
        this.$emit('close', uid, widget);
        if ( !ev.defaultPrevented ){
          this.updateWidget(uid, {hidden: true});
        }
      },
      /**
       * Gets the widget corresponding to the given key.
       * @method getWidget
       * @param {Number} key
       * @fires closest
       * @return {Object | undefined}
       */
      getWidget(key){
        let idx = bbn.fn.search(this.widgets, {key: key});
        if ( idx > -1 ){
          return this.widgets[idx];
        }
        return null;
      },
      /**
       * Hides the widget corresponding to the given key.
       * @method hideWidget
       * @param {Number} key
       * @fires toggleWidget
       */
      hideWidget(key){
        return this.toggleWidget(key, true);
      },
      /**
       * Shows the widget corresponding to the given key.
       * @method hideWidget
       * @param {Number} key
       * @fires toggleWidget
       */
      showWidget(key){
        return this.toggleWidget(key, false);
      },
      /**
       * Hides or not the widget corresponding to the given key.
       * @method toggleWidget
       * @param {Number} key
       * @param {Boolean} hidden
       * @fires updateWidget
       */
      toggleWidget(key, hidden){
        if ( this.widgets ){
          let w = bbn.fn.getRow(this.widgets, {key: key});
          if ( w && (w.closable !== false) ){
            this.updateWidget(key, {
              hidden: hidden === undefined ? !w.hidden : hidden
            });
          }
        }
      },
      /**
       * Handles the resize of the component.
       * @method onResize
       * @fires getRef
       * @fires resizeScroll
       */
      onResize(){
        let ele = this.getRef('container');
        if (ele) {
          let actualWidth = parseInt(window.getComputedStyle(ele).width),
              num = 1,
              steps = [800, 1150, 1550, 2200, 3000, 3800];
          bbn.fn.each(steps, (step, i) => {
            if ( this.max && (this.max <= num) ){
              return false;
            }
            if ( actualWidth >= step ){
              num++;
            }
            else{
              return false;
            }
          });
          if ( this.numCols !== num ){
            this.numCols = num;
          }
          this.resizeScroll();
        }
      },
      /**
       * Move the widget from the old index to the new index
       * @method moveWidgets
       * @param {Number} oldIdx
       * @param {Number} newIdx
       */
      moveWidgets(oldIdx, newIdx){
        bbn.fn.move(this.widgets, oldIdx, newIdx);
        bbn.fn.each(this.widgets, (a, i) => {
          if ( i !== a.index ){
            this.widgets[i].index = i;
          }
        });
      },
      /**
       * Move the widget from the old index to the new index considering the hidden widgets.
       * @method move
       * @param {Number} oldIdx
       * @param {Number} newIdx
       * @emits sort
       * @return {Boolean}
       */
      move(oldIdx, newIdx){
        if ( this.widgets[oldIdx] && this.widgets[newIdx] ){
          bbn.fn.move(this.widgets, oldIdx, newIdx);
          let order = [];
          bbn.fn.each(this.widgets, (a, i) => {
            if ( i !== a.index ){
              a.index = i;
            }
            order.push(a.key);
          });
          this.currentOrder = order;
          if ( this.url ){
            return this.post(this.url + 'order', {
              id_dashboard: this.code,
              order: order
            }, d => {
              if ( d && d.data && d.data.success ){
                appui.success();
              }
              else{
                appui.error();
              }
            });
          }
          this.$emit('sort', this.currentOrder);
          return true;
        }
        return false;
      },
      /**
       * Updates the menu of the parent container.
       * @method updateMenu
       * @fires closest
       * @fires toggleWidget
       * @fires showWidget
       * @fires hideWidget
       * @fires initWidgets
       * @emits sort
       */
      updateMenu(){
        let tab = this.closest("bbn-container");
        if ( tab ){
          if ( this.selectable && this.menu && this.menu.length ){
            bbn.fn.each(this.menu, a => {
              tab.deleteMenu(a);
            });
          }
          this.menu = [];
          let items = [];
          let i = 0;
          if ( this.widgets ){
            bbn.fn.log("THERE IS A MENU AND WIDGETS IN DASHBOARD");
            bbn.fn.each(this.originalSource, a => {
              let w = bbn.fn.getRow(this.widgets, {uid: a.uid});
              if ( w && w.showable ){
                items.push({
                  disabled: !this.closable || (w.closable === false),
                  selected: !w.hidden,
                  text: w.text ?
                    w.text :
                    (w.title ? w.title : bbn._('Untitled')),
                  action: () => {
                    this.toggleWidget(w.uid);
                  }
                });
                i++;
              }
            });
            this.menu.push(tab.addMenu({
              text: bbn._("Widgets"),
              mode: 'options',
              icon: 'nf nf-mdi-widgets',
              items: items
            }));
            this.menu.push(tab.addMenu({
              text: bbn._("Show every widget"),
              icon: 'nf nf-mdi-check_circle',
              action: () => {
                bbn.fn.each(this.widgets, w => {
                  if ( w.hidden ){
                    this.showWidget(w.uid);
                  }
                });
              }
            }));
            this.menu.push(tab.addMenu({
              text: bbn._("Hide every widget"),
              icon: 'nf nf-mdi-checkbox_blank_circle',
              action: () => {
                bbn.fn.each(this.widgets, w => {
                  if ( !w.hidden ){
                    this.hideWidget(w.uid);
                  }
                });
              }
            }));
            if ( this.isOrderChanged ){
              this.menu.push(tab.addMenu({
                text: bbn._("Reset widgets order"),
                icon: 'nf nf-fa-sort_numeric_asc',
                action:() => {
                  this.currentOrder.splice(0, this.currentOrder.length);
                  this.initWidgets();
                  this.$emit('sort', this.currentOrder);
                }
              }));
            }
          }
        }
      },
     /**
      *
      * @method mouseEnterWidget
      * @param {Number} idx
      */
      mouseEnterWidget(idx){
        if ( this.isSorting && (idx !== this.sortOriginIndex) ){
          this.sortTargetIndex = idx > this.sortOriginIndex ? idx - 1 : idx;
        }
        else if (this.sortTargetIndex !== null) {
          this.sortTargetIndex = null;
        }
      },
      /**
      * Update configuration of the given widget.
      * @method updateWidget
      * @param {Number} key
      * @param {Object} cfg
      * @fires setWidgetStorage
      * @fires updateMenu
      * @fires post
      */
      updateWidget(key, cfg){
        let idx = bbn.fn.search(this.widgets || [], 'key', key),
            params = {
              id: key,
              cfg: bbn.fn.extend({}, cfg),
              id_dashboard: this.code
            },
            no_save = ['items', 'num', 'start', 'index'];
        if (idx > -1) {
          bbn.fn.each(no_save, function(a, i){
            if ( cfg[a] !== undefined ){
              delete params.cfg[a];
            }
          });
          let numProps = bbn.fn.numProperties(params.cfg);
          if (numProps) {
            // If it's only the default limit we don't save
            if ((numProps === 1) && params.cfg.limit && (this.widgets[idx].limit === undefined)) {
              this.widgets[idx].limit = params.cfg.limit;
              return;
            }

            bbn.fn.iterate(params.cfg, (a, k) => {
              if ( this.widgets[idx][k] === undefined ){
                this.$set(this.widgets[idx], k, a);
              }
              else{
                this.widgets[idx][k] = a;
              }
            });
            this.$nextTick(()=>{
              this.setWidgetStorage(idx);
              if ( params.cfg.hidden !== undefined ){
                this.updateMenu();
              }
              if ( this.hasStorage ){
                let cps = this.$root.findAll('bbn-dashboard');
                bbn.fn.each(cps, (cp, i) => {
                  if ( (cp !== this) && (cp.storageFullName === this.storageFullName) ){
                    bbn.fn.iterate(params.cfg, (a, k) => {
                      if ( cp.widgets[idx][k] === undefined ){
                        cp.$set(cp.widgets[idx], k, a);
                      }
                      else if ( cp.widgets[idx][k] !== a ){
                        cp.widgets[idx][k] = a;
                      }
                    });
                    if ( params.cfg.hidden !== undefined ){
                      cp.updateMenu();
                    }
                  }
                })
              }
            });
            if ( this.url !== undefined ){
              return this.post(this.url + 'save', params, d => {
                if ( d && d.data && d.data.success ){
                  appui.success();
                }
                else{
                  appui.error();
                }
              });
            }
            else{
              appui.success();
            }
          }
        }
        new Error("No corresponding widget found for key " + key);
      },
      /**
       * Sets the storage of the given widget.
       * @method setWidgetStorage
       * @param {Number} idx
       * @fires getStorage
       */
      getWidgetStorage(idx){
        if ( this.widgets[idx] ){
          this.getStorage(this.widgets[idx].storageFullName, true);
        }
      },
      /**
       * Sets the storage of the given widget.
       * @method setWidgetStorage
       * @param {Number} idx
       * @fires setStorage
       */
      setWidgetStorage(idx){
        this.setStorage({
          uid: this.widgets[idx].uid,
          hidden: this.widgets[idx].hidden,
          limit: this.widgets[idx].limit
        }, this.widgets[idx].storageFullName, true);
      },
      /**
       * Normalizes the properties of the given object.
       * @method normalize
       * @param {Object} obj_orig
       * @fires _getStorageRealName
       * @returns {Object}
       */
      normalize(obj_orig){
        let obj = obj_orig || {};
        obj.hidden = !!obj.hidden;
        if ( !obj.key ){
          obj.key = obj.uid ? obj.uid : bbn.wc.makeUID();
        }
        if ( !obj.uid ){
          obj.uid = obj.key;
        }
        if ( obj.showable === undefined ){
          obj.showable = true;
        }
        if (!this.sortable) {
          obj.sortable = false;
        }
        obj.storageFullName = (this.storageFullName || this._getStorageRealName()) + '-' + obj.key;
        return obj;
      },
      /**
       * Adds the given widget.
       * @method add
       * @param {Object} obj
       * @param {Number} idx
       * @fires getWidgetStorage
       * @returns {Object}
       */
      add(obj, idx){
        let checkIdx = bbn.fn.search(this.widgets, {key: obj.key});
        if ( checkIdx > -1 ){
          return this.widgets[checkIdx];
        }
        if ( (idx === undefined) || (idx < 0) || (idx >= this.widgets.length) ){
          if ( obj.hidden === undefined ){
            obj.hidden = false;
          }
          obj.index = this.widgets.length;
          this.widgets.push(obj);
        }
        else if ( idx < this.widgets.length ){
          this.widgets.each(a => {
            if ( a.index >= idx ){
              a.index++;
            }
          });
          obj.index = idx;
          this.widgets.splice(idx, 0, obj);
        }
        if ( obj.storageFullName ){
          let tmp = this.getWidgetStorage(idx);
          if ( tmp ){
            //bbn.fn.extend(obj, tmp);
          }
        }
        return obj;
      },
      /**
       * Handles the resize of the scroll.
       * @method resizeScroll
       * @fires getRef
       */
      resizeScroll(){
        if ( this.scrollable && this.$refs.scroll ){
          this.getRef('scroll').onResize();
        }
      },
      /**
       * Adds bbns-widget from the slot.
       * @method init
       * @fires normalize
       * @fires initWidgets
       * @fires updateMenu
       */
      init(){
        this.originalSource = [];
        // Adding bbns-widget from the slot.
        if ( this.$slots.default ){
          for ( let node of this.$slots.default ){
            if (
              node &&
              (node.tag === 'bbns-widget')
            ){
              this.originalSource.push(this.normalize(node.data.attrs));
            }
          }
        }
        bbn.fn.each(this.source, (w, i) => {
          this.originalSource.push(this.normalize(w));
        });
        this.initWidgets();
        this.updateMenu();
      },

      /**
       * Adds bbns-widget.
       * @method initWidgets
       * @fires add
       */
      initWidgets(){
        this.widgets = [];
        bbn.fn.each(this.currentOrder, id => {
          let w = bbn.fn.getRow(this.originalSource, {key: id});
          if ( w ){
            this.add(w);
          }
        })
        bbn.fn.each(this.originalSource, (w, i) => {
          if ( this.currentOrder.indexOf(w.key) === -1 ){
            this.add(w);
          }
        });
      },
      /**
       * Sets the currentSlots property based to the widgets' visibility into the slots.
       * @method setCurrentSlots
       * @return {Boolean | Array}
       */
      setCurrentSlots(){
        this.currentSlots = this.$slots.default ? this.$slots.default.filter(node => {
          return !!node.tag;
        }) : [];
      },
      /**
       * On widget drop.
       * @method drop
       * @param {Event} e
       */
      drop(e){
        if (
          this.sortable &&
          (this.sortOriginIndex !== this.sortTargetIndex) &&
          this.widgets[this.sortOriginIndex] &&
          this.widgets[this.sortTargetIndex]
        ){
          let ev = new Event('move', {cancelable: true});
          this.$emit('move', ev, this.sortOriginIndex, this.sortTargetIndex);
          if ( !ev.defaultPrevented ){
            if (
              this.move(this.sortOriginIndex, this.sortTargetIndex) &&
              this.storageFullName
            ){
              let cps = this.$root.findAll('bbn-dashboard');
              bbn.fn.each(cps, (cp, i) => {
                if ( (cp !== this) && (cp.storageFullName === this.storageFullName) ){
                  cp.move(this.sortOriginIndex, this.sortTargetIndex);
                }
              })
            }
          }
        }
        this.sortTargetIndex = null;
      }
    },
    /**
     * @event created
     * @fires init
     * @fires setCurrentSlots
     */
    created(){
      this.init();
      this.setCurrentSlots();
    },
    /**
     * @event mounted
     * @fires onResize
     * @fires init
     */
    mounted(){
      this.ready  = true;
      this.onResize();
      /**
       * @watch currentSlots
       * @fires init
       */
      this.$watch('currentSlots', (newVal, oldVal) => {
        if ( !bbn.fn.isSame(newVal, oldVal) ){
          this.init();
        }
      });
    },
    /**
     * @event updated
     * @fires selfEmit
     * @fires setCurrentSlots
     */
    updated(){
      /*
      this.selfEmit(true);
      this.setCurrentSlots();
      */
    },
    watch: {
      /**
       * @watch sortTargetIndex
       */
      sortTargetIndex(newVal){
      },
      /**
       * @watch isSorting
       * @emits move
       * @fires move
       * @fires getRef
       */
      isSorting(newVal){
        if ( !newVal ){
          
        }
        
      },
      /**
       * @watch source
       * @fires init
       */
      source: {
        deep: true,
        handler(){
          this.init();
        }
      }
    }
  };
