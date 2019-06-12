 /**
  * @file bbn-dashboard component
  *
  * @description bbn-dashboard, represents a user's interface as a panel control, containing information blocks (bbn-widget component).
  * This component gives users the possibility to easily choose the preferred position for the components inside the grid, by dragging and releasing the panels in the desired position.
  *
  * @author BBN Solutions
  *
  * @copyright BBN Solutions
  *
  * @created 15/02/2017.
  */

(function($, bbn){
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
       * Set to true allows to close the closable widgets in the dashboard
       * @prop {Boolean} [true] closable
       */
      closable: {
        type: Boolean,
        default: true
      },
      /**
       * Set to true allows to sort the widgets in the dashboard
       * @prop {Boolean} [true] sortable
       */
      sortable: {
        type: Boolean,
        default: true
      }, 
      /**
       * Set to true allows the dashboard to be scrollable
       * @prop {Boolean} [true] scrollable
       */
      scrollable: {
        type: Boolean,
        default: true
      },
      /**
       * The source of the dashboard
       * @prop {Array} source
       */
      source: {},
      /**
       * The url for the post in case of actions on the dashboard's widget
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
       * The object of configuration of the dashboard
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
        sortTargetIndex: null,
        sortOriginIndex: null,
        isSorting: false
      };
    },
    computed: {
      currentWidgets(){
        return bbn.fn.filter(this.widgets, (a) => {
          return !a.hidden;
        });
      }
    },
    methods: {
      /**
       * Sets the configuration of the dashboard
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
       * Gets the widget corresponding to the given key
       * @method getWidget
       * @param {Number} key 
       */
      getWidget(key){
        let idx = bbn.fn.search(this.widgets, {key: key});
        if ( idx > -1 ){
          return bbn.vue.closest(this, ".bbn-container");
        }
      },
      /**
       * Hides the widget corresponding to the given key
       * @method hideWidget
       * @param {Number} key 
       * @fires toggleWidget
       */
      hideWidget(key){
        return this.toggleWidget(key, true);
      },
      /**
       * Shows the widget corresponding to the given key
       * @method hideWidget
       * @param {Number} key 
       * @fires toggleWidget
       */
      showWidget(key){
        return this.toggleWidget(key, false);
      },
      /**
       * Toggle the property hidden of the widget corrensponding to the given key
       * @method toggleWidget
       * @param {Number} key 
       * @param {Boolean} hidden 
       * @fires updateWidget
       * @fires updateMenu
       */
      toggleWidget(key, hidden){
        let idx = bbn.fn.search(this.widgets, {key: key});
        this.updateWidget(key, {
          hidden: hidden === undefined ? !this.widgets[idx].hidden : hidden
        }).then(() => {
          this.updateMenu();
        });
      },
      /**
       * Handles the resize of the component
       * @method onResize
       * 
       */
      onResize(){
        let $ele = $(".bbn-masonry:first", this.$el),
            actualWidth = $ele.innerWidth(),
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
        if ( this.sortable ){
          /*
          if ( !$ele.hasClass("ui-sortable") ){
            let oldIdx = false;
            $ele.sortable({
              placeholder: "bbn-widget bbn-bg-grey bbn-widget-placeholder",
              opacity: 0.5,
              forcePlaceholderSize: true,
              handle: ".bbn-header .bbn-sortable-handle",
              start: (e, ui) => {
                bbn.fn.log("SORTIONG");
                oldIdx = ui.item.index();
              },
              stop: (e, ui) => {
                if ( oldIdx > -1 ){
                  let newIdx = ui.item.index();
                  if ( this.widgets[oldIdx] && this.widgets[oldIdx].key && (newIdx !== oldIdx) ){
                    if ( this.url ){
                      try {
                        bbn.fn.post(this.url + 'move', {
                          id: this.widgets[oldIdx].key,
                          index: newIdx
                        }, (d) => {
                          if ( d.success ){
                            this.move(oldIdx, newIdx);
                          }
                          else{
                            $ele.sortable("cancel");
                          }
                        });
                      }
                      catch (e){
                        throw new Error(bbn._("Impossible to find the index"));
                      }
                    }
                    else{
                      this.move(oldIdx, newIdx);
                    }
                  }
                }
              }
            });
          }
          else{
            $ele.sortable('refresh');
          }
          */
        }
        $ele.css({
          "-moz-column-count": num,
          "-webkit-column-count": num,
          "column-count": num
        });
      },
      /**
       * Move the widget from the old idx to the new idx
       * @method moveWidgets
       * @param {Number} oldIdx 
       * @param {Number} newIdx 
       */  
      moveWidgets(oldIdx, newIdx){
        bbn.fn.move(this.widgets, oldIdx, newIdx);
        $.each(this.widgets, (i, a) => {
          if ( i !== a.index ){
            this.widgets[i].index = i;
          }
        });
      },
      /**
       * Move the widget from the old idx to the new idx considering the hidden widgets
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
          $.each(cps, (i, cp) => {
            if ( (cp !== this) && (cp.storageFullName === this.storageFullName) ){
              cp.moveWidgets(oldIdx, newIdx);
            }
          })
          */
        }
      },
      /**
       * Updates the menu of the container parent basing on the props menu and selectable of the component dashboard
       * @method updateMenu
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
            // We keep the original source order
            items: items
          }));
          this.menu.push(tab.addMenu({
            text: bbn._("Widgets"),
            mode: 'options',
            icon: 'nf nf-mdi-widgets',
            command: () => {
              tab.getPopup().confirm(bbn._("Etes-vous sur de vouloir réínitialiser la vue et perdre vos réglages?"))
            }
          }));
        }
      },
      /**
       * Updates the given widget basing on the given cfg object
       * @method updateWidget
       * @param {Number} key 
       * @param {Object} cfg 
       * @fires setWidgetStorage
       */  
      updateWidget(key, cfg){
        let idx = bbn.fn.search(this.widgets, 'key', key),
            params = {id: key, cfg: cfg},
            no_save = ['items', 'num', 'start', 'index'];
        if ( idx > -1 ){
          $.each(no_save, function(i, a){
            if ( cfg[a] !== undefined ){
              delete params.cfg[a];
            }
          });
          if ( bbn.fn.countProperties(params.cfg) ){
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
        }
        new Error("No corresponding widget found for key " + key);
      },
      /**
       * Sets the storage of the given widget
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
       * Normalizes the properties of the given object
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
       * Adds the given widget 
       * @method add
       * @param {Object} obj 
       * @param {Number} idx 
       */
      add(obj, idx){
        if ( (idx === undefined) || (idx < 0) || (obj.key >= this.widgets.length) ){
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
       * Handles the resize of the scroll
       * @method resizeScroll
       */  
      resizeScroll(){
        if ( this.$refs.scroll ){
          this.$refs.scroll.onResize()
        }
      }
    },
    /**
     * @event created
     * @fires normalize
     * @fires getStorage
     * @fires add
     */
    created(){
      // Adding bbns-tab from the slot
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
      $.each(this.source, (i, obj) => {
        this.originalSource.push(this.normalize(obj));
      });
      let cfg = [];
      $.each(bbn.fn.order(this.originalSource.slice(), "index"), (i, obj) => {
        this.add(obj);
      });
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
    },
    /**
     * @event updated
     * @fires selfEmit
     */
    updated(){
      this.selfEmit(true);
    },
    watch: {
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
      isSorting(newVal){
        if ( !newVal ){
          this.sortTargetIndex = null;
        }

      }
    }
  });

})(jQuery, bbn);
