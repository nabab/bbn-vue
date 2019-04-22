/**
 * Created by BBN on 15/02/2017.
 */
(function($, bbn){
  "use strict";

  var limits = [5, 10, 15, 20, 25, 30, 40, 50];
  /**
   * Classic input with normalized appearance
   */
  Vue.component('bbn-dashboard', {
    mixins: [bbn.vue.basicComponent, bbn.vue.resizerComponent, bbn.vue.localStorageComponent],
    props: {
      components: {
        type: Object,
        default(){
          return {};
        }
      },
      max: {
        type: Number
      },
      selectable: {
        type: Boolean,
        default: true
      },
      closable: {
        type: Boolean,
        default: true
      },
      sortable: {
        type: Boolean,
        default: true
      },
      scrollable: {
        type: Boolean,
        default: true
      },
      source: {},
      url: {},
      loadedConfig: {
        type: Object
      },

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
        originalSource: [],
        menu: [],
        isRefreshing: false,
        widgets: [],
        order: [],
        hidden: []
      };
    },
    methods: {
      setConfig(uid, config){
        this.setStorage({
          order: config.order,
          hidden: config.hidden
        }, uid);
      },
      getWidget(key){
        let idx = bbn.fn.search(this.widgets, {key: key});
        if ( idx > -1 ){
          return bbn.vue.closest(this, ".bbn-container");
        }
      },
      hideWidget(key){
        return this.toggleWidget(key, true);
      },
      showWidget(key){
        return this.toggleWidget(key, false);
      },
      toggleWidget(key, hidden){
        let idx = bbn.fn.search(this.widgets, {key: key});
        this.updateWidget(key, {
          hidden: hidden === undefined ? !this.widgets[idx].hidden : hidden
        }).then(() => {
          this.updateMenu();
        });
      },

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
        if ( this.sortable && !$ele.hasClass("ui-sortable") ){
          let oldIdx = false;
          $ele.sortable({
            placeholder: "bbn-widget bbn-bg-grey bbn-widget-placeholder",
            opacity: 0.5,
            forcePlaceholderSize: true,
            handle: ".bbn-header .ui-sortable-handle",
            start: (e, ui) => {
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
          })
        }
        $ele.css({
          "-moz-column-count": num,
          "-webkit-column-count": num,
          "column-count": num
        });
      },

      moveWidgets(oldIdx, newIdx){
        bbn.fn.move(this.widgets, oldIdx, newIdx);
        $.each(this.widgets, (i, a) => {
          if ( i !== a.index ){
            this.widgets[i].index = i;
          }
        });
      },

      move(oldIdx, newIdx){
        // Correcting the index counting the hidden widgets
        $.each(this.widgets, (i, a) => {
          if ( a.hidden ){
            if ( i <= oldIdx ){
              oldIdx++;
            }
            if ( i <= newIdx ){
              newIdx++;
            }
            if ( (i > oldIdx) && (i > newIdx) ){
              return false;
            }
          }
        });
        bbn.fn.move(this.widgets, oldIdx, newIdx);
        $.each(this.widgets, (i, a) => {
          if ( i !== a.index ){
            this.updateWidget(this.widgets[i].uid, {index: i});
          }
        });
        if ( this.storageFullName ){
          let cps = bbn.vue.findAll(this.$root, 'bbn-dashboard');
          $.each(cps, (i, cp) => {
            if ( (cp !== this) && (cp.storageFullName === this.storageFullName) ){
              cp.moveWidgets(oldIdx, newIdx);
            }
          })
        }
      },

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
                  }
                }
              })
            }
          });
          this.menu.push(tab.addMenu({
            text: bbn._("Widgets"),
            mode: 'options',
            icon: 'nf nf-mdi-widgets',
            // We keep the original source order
            items: items
          }));
        }
      },

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

      setWidgetStorage(idx){
        this.setStorage({
          uid: this.widgets[idx].uid,
          hidden: this.widgets[idx].hidden,
          limit: this.widgets[idx].limit,
          index: this.widgets[idx].index
        }, this.widgets[idx].storageFullName, true);
      },

      normalize(obj_orig){
        let obj = bbn.fn.clone( obj_orig);
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

      add(obj, idx){
        if ( (idx === undefined) || (idx < 0) || (obj.key >= this.widgets.length) ){
          this.order.push(obj.key);
          this.widgets.push(obj);
        }
        else{
          this.order.splice(idx, 0, obj.key);
          this.widgets.splice(idx, 0, obj);
        }
        return obj;
      },

      resizeScroll(){
        if ( this.$refs.scroll ){
          this.$refs.scroll.onResize()
        }
      }
    },

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

      $.each(this.originalSource, (i, obj) => {
        let tmp = this.getStorage(obj.storageFullName, true);
        if ( tmp ){
          bbn.fn.extend(this.originalSource[i], tmp);
        }
        else if ( (obj.index === undefined) || !bbn.fn.isNumber(obj.index) ){
          this.originalSource[i].index = 10000+i;
        }
        cfg.push(tmp);
      });
      let widgets = bbn.fn.order(this.originalSource.slice(), "index");
      $.each(widgets, (i, obj) => {
        this.add(obj);
      });
    },

    mounted(){
      this.onResize();
      this.updateMenu();
    },

    updated(){
      this.selfEmit(true);
    },
  });

})(jQuery, bbn);
