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

(function(bbn){
  "use strict";

  var limits = [5, 10, 15, 20, 25, 30, 40, 50];
  /**
   * Classic input with normalized appearance
   */
  Vue.component('bbn-dashboard', {
    /**
     * @mixin bbn.vue.basicComponent
     * @mixin bbn.vue.resizerComponent
     * @mixin bbn.vue.localStorageComponent
     */
    mixins: [bbn.vue.basicComponent, bbn.vue.resizerComponent, bbn.vue.localStorageComponent],
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
       * @prop {Array} source
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
         * @prop {Array} [[]] widgets
         */
        widgets: [],
        /**
         * @prop {Array} [[]] order
         */
        order: [],
        /**
         * @prop {Array} [[]] hidden
         */
        hidden: [],
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
        currentSlots: []
      };
    },
    computed: {
      /**
       * @computed currentWidgets
       * @return {Array}
       */
      currentWidgets(){
        return this.widgets && this.widgets.length ? bbn.fn.filter(this.widgets, (a) => {
          return !a.hidden;
        }) : [];
      }
    },
    methods: {
      /**
       * Sets the configuration of the dashboard.
       * @method setConfig
       * @param uid 
       * @param {Object} config 
       */
      setConfig(uid, config){
        this.setStorage({
          order: config.order,
          hidden: config.hidden
        }, uid);
      },
      /**
       * Gets the widget corresponding to the given key.
       * @method getWidget
       * @param {Number} key 
       */
      getWidget(key){
        let idx = bbn.fn.search(this.widgets, {key: key});
        if ( idx > -1 ){
          return this.closest("bbn-container");
        }
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
       * Toggles the property 'hidden' of the widget corresponding to the given key.
       * @method toggleWidget
       * @param {Number} key 
       * @param {Boolean} hidden 
       * @fires updateWidget
       * @fires updateMenu
       */
      toggleWidget(key, hidden){
        if ( this.widgets ){
          let idx = bbn.fn.search(this.widgets, {key: key});
          this.updateWidget(key, {
            hidden: hidden === undefined ? !this.widgets[idx].hidden : hidden
          }).then(() => {
            this.updateMenu();
          });
        }
      },
      /**
       * Handles the resize of the component.
       * @method onResize
       * 
       */
      onResize(){
        let ele = this.getRef('container');
        if (ele) {
          let actualWidth = parseInt(window.getComputedStyle(ele).width),
              num = 1,
              steps = [800, 1150, 1550, 2200, 3000, 3800];
              bbn.fn.log('Resize dashboard', actualWidth);
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
          bbn.fn.addStyle(ele, {
            "-moz-column-count": num,
            "-webkit-column-count": num,
            "column-count": num
          });
          if ( this.scrollable ){
            this.getRef('scroll').onResize();
          }
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
       */
      move(oldIdx, newIdx){
        // Correcting the index counting the hidden widgets
        this.$set(this.widgets[oldIdx], "index", newIdx);
        bbn.fn.move(this.widgets, oldIdx, newIdx);
        bbn.fn.each(this.widgets, (a, i) => {
          if ( i !== a.index ){
            this.$set(this.widgets[i], "index", i);
          }
        });
        if ( this.storageFullName ){
          let cps = bbn.vue.findAll(this.$root, 'bbn-dashboard');
          /*
          bbn.fn.each(cps, (cp, i) => {
            if ( (cp !== this) && (cp.storageFullName === this.storageFullName) ){
              cp.moveWidgets(oldIdx, newIdx);
            }
          })
          */
        }
      },
      /**
       * Updates the menu of the parent container.
       * @method updateMenu
       * @fires deleteMenu
       */
      updateMenu(){
        let tab = this.closest("bbn-container");
        if ( tab ){
          if ( this.selectable && this.menu && this.menu.length ){
            bbn.fn.each(this.menu, (a) => {
              tab.deleteMenu(a);
            });
          }
          this.menu = [];
          let items = [];
          let i = 0;
          if ( this.widgets ){
            bbn.fn.each(this.originalSource, (a) => {
              let idx = bbn.fn.search(this.widgets, {uid: a.uid});
              if ( idx > -1 ){
                items.push({
                  disabled: !this.closable || (this.widgets[idx].closable === false),
                  selected: !this.widgets[idx].hidden,
                  text: this.widgets[idx].text ?
                    this.widgets[idx].text :
                    (this.widgets[idx].title ? this.widgets[idx].title : bbn._('Untitled')),
                  command: () => {
                    if ( this.widgets[idx].closable !== false ){
                      this.toggleWidget(a.uid);
                      this.$forceUpdate();
                    }
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
          }
          /*
          this.menu.push(tab.addMenu({
            text: bbn._("Widgets"),
            mode: 'options',
            icon: 'nf nf-mdi-widgets',
            command: () => {
              tab.getPopup().confirm(bbn._("Etes-vous sur de vouloir réínitialiser la vue et perdre vos réglages?"))
            }
          }));
          */
        }
      },
      /**
       * Updates the given widget based on the given configuration object.
       * @method updateWidget
       * @param {Number} key 
       * @param {Object} cfg 
       * @fires setWidgetStorage
       */
      updateWidget(key, cfg){
        let idx = bbn.fn.search(this.widgets || [], 'key', key),
            params = {id: key, cfg: cfg},
            no_save = ['items', 'num', 'start', 'index'];
        if (idx > -1) {
          bbn.fn.each(no_save, function(a, i){
            if ( cfg[a] !== undefined ){
              delete params.cfg[a];
            }
          });
          if ( bbn.fn.countProperties(params.cfg) ){
            if ( this.url !== undefined ){
              return bbn.fn.post(this.url + 'save', params, (d) => {
                if ( d.data && d.data.success ){
                  for ( let n in params.cfg ){
                    this.$set(this.widgets[idx], n, params.cfg[n]);
                  }
                  this.setWidgetStorage(idx);
                  if ( params.cfg.hidden !== undefined ){
                    this.updateMenu();
                  }
                  this.$forceUpdate();
                }
              });
            }
            else{              
              for ( let n in cfg ){
                this.$set(this.widgets[idx], n, cfg[n]);
              }
              this.setWidgetStorage(idx);
              if ( cfg.hidden !== undefined ){
                this.updateMenu();
              }
              this.$forceUpdate();             
            }
            
          }
        }
        new Error("No corresponding widget found for key " + key);
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
          limit: this.widgets[idx].limit,
          index: this.widgets[idx].index
        }, this.widgets[idx].storageFullName, true);
      },
      /**
       * Normalizes the properties of the given object.
       * @method normalize
       * @param {Object} obj_orig 
       * @returns {Object}
       */
      normalize(obj_orig){
        let obj = obj_orig || {};
        obj.hidden = !!obj.hidden;
        if ( !obj.key ){
          obj.key = obj.uid ? obj.uid : bbn.vue.makeUID();
        }
        if ( !obj.uid ){
          obj.uid = obj.key;
        }
        obj.storageFullName = (this.storageFullName || this._getStorageRealName()) + '-' + obj.key;
        return obj;
      },
      /**
       * Adds the given widget.
       * @method add
       * @param {Object} obj 
       * @param {Number} idx 
       * @returns {Object}
       */
      add(obj, idx){
        if ( (idx === undefined) || (idx < 0) || (idx >= this.widgets.length) ){
          obj.index = this.widgets.length;
          this.order.push(obj.key);
          this.widgets.push(obj);
        }
        else{
          this.widgets.each((a) => {
            if ( a.index >= idx ){
              a.index++;
            }
          });
          obj.index = idx;
          this.order.splice(idx, 0, obj.key);
          this.widgets.splice(idx, 0, obj);
        }
        if ( obj.storageFullName ){
          let tmp = this.getStorage(obj.storageFullName, true);
          if ( tmp ){
            bbn.fn.extend(obj, tmp);
          }
        }
        return obj;
      },
      /**
       * Handles the resize of the scroll.
       * @method resizeScroll
       */  
      resizeScroll(){
        if ( this.$refs.scroll ){
          this.$refs.scroll.onResize()
        }
      },
      /**
       * Adds bbns-widget from the slot.
       * @method init
       * @fires normalize
       * @fires add
       */
      init(){
        this.originalSource = [];
        this.widgets = [];
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
        bbn.fn.each(this.source, (obj, i) => {
          this.originalSource.push(this.normalize(obj));
        });
        bbn.fn.each(bbn.fn.order(this.originalSource.slice(), "index"), (obj, i) => {
          this.add(obj);
        });
      },
      /**
       * Sets the currentSlots property based to the widgets' visibility into the slots.
       * @method setCurrentSlots
       */
      setCurrentSlots(){
        this.currentSlots = this.$slots.default ? this.$slots.default.filter(node => {
          return !!node.tag;
        }) : [];
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
     * @fires updateMenu
     */
    mounted(){
      this.ready  = true;
      this.onResize();
      this.updateMenu();
      /**
       * @watch currentSlotrs
       * @fires init
       * @fires updateMenu
       */
      this.$watch('currentSlots', (newVal, oldVal) => {
        if ( !bbn.fn.isSame(newVal, oldVal) ){
          this.init();
          this.updateMenu();
        }
      });
    },
    /**
     * @event updated
     * @fires selfEmit
     * @fires setCurrentSlots
     */
    updated(){
      this.selfEmit(true); 
      this.setCurrentSlots();
    },
    watch: {
      /**
       * @watch sortTargetIndex
       * @fires move
       */
      sortTargetIndex(newVal){
        if (
          this.sortable &&
          this.isSorting &&
          (this.sortOriginIndex !== newVal) &&
          this.widgets[this.sortOriginIndex] &&
          this.widgets[this.sortTargetIndex]
        ){
          let o = this.sortOriginIndex;
          this.sortOriginIndex = newVal;
          this.move(o, newVal);
        }
      },
      /**
       * @watch isSorting
       */
      isSorting(newVal){
        if ( !newVal ){
          this.sortTargetIndex = null;
        }
      }
    }
  });

})(bbn);
