/**
 * Created by BBN on 15/02/2017.
 */
(function($, bbn){
  "use strict";

  var limits = [5, 10, 15, 20, 25, 30, 40, 50];
  /**
   * Classic input with normalized appearance
   */
  Vue.component('bbn-widget', {
    name: 'bbn-widget',
    mixins: [bbn.vue.basicComponent, bbn.vue.localStorageComponent, bbn.vue.observerComponent, bbn.vue.resizerComponent],
    props: {
      uid: {},
      content: {
        type: String
      },
      url: {
        type: [String, Boolean],
        default: false
      },
      limit: {
        type: Number,
        default: 0
      },
      index: {
        type: Number
      },
      hidden: {
        type: Boolean,
        default: false
      },
      start: {
        type: Number,
        default: 0
      },
      total: {
        type: Number,
        default: 0
      },
      template: {

      },
      hideEmpty: {
        type: Boolean,
        default: false
      },
      component: {
        type: [String, Object]
      },
      itemComponent: {
        type: [String, Object]
      },
      itemStyle: {
        type: [String, Object],
        default: ''
      },
      itemClass: {
        type: [String, Object],
        default: ''
      },
      title: {
        type: String
      },
      buttonsLeft: {
        type: [Array, Function],
        default(){
          return [];
        }
      },
      buttonsRight: {
        type: [Array, Function],
        default(){
          return [];
        }
      },
      zoomable: {
        type: Boolean,
        default: false
      },
      closable: {
        type: Boolean,
        default: true
      },
      sortable: {
        type: Boolean,
        default: true
      },
      pageable: {
        type: Boolean,
        default: true
      },
      source: {
        type: Object,
        default: function(){
          return {};
        }
      },
      items: {
        type: Array,
        default: function(){
          return [];
        }
      },
      noData: {
        type: String,
        default: bbn._("There is no available data")
      },
      menu: {
        type: Array,
        default: function(){
          return [];
        }
      },
      position: {
        type: String
      },
      top: {},
      bottom: {},
      full: {
        type: Boolean,
        default: false
      },
      opened: {},
      options: {
        default(){
          return {}
        }
      },
      separator: {
        type: String,
        default: ''
      }
    },
    data(){
      return {
        _1stRun: false,
        isLoading: false,
        dashboard: false,
        currentItems: this.items,
        currentStart: this.start,
        currentTotal: this.total,
        currentContent: this.content || false,
        currentSource: this.source,
        lang: {
          close: bbn._("Close")
        },
        realButtonsRight: [],
        realButtonsLeft: []
      };
    },
    computed: {
      currentPage(){
        if ( this.currentTotal > this.limit ){
          return (this.currentStart + this.limit) / this.limit;
        }
        return 0;
      },
      totalPages(){
        if ( this.currentTotal > this.limit ){
          return Math.ceil(this.currentTotal / this.limit);
        }
        return 1;
      },
      hasMenu(){
        return !!this.finalMenu.length;
      },
      finalMenu(){
        let tmp = this.menu.slice();
        if ( this.url ){
          tmp.unshift({
            text: bbn._("Reload"),
            icon: "nf nf-fa-refresh",
            command: () => {
              this.reload();
            }
          });
        }
        if ( this.limit ){
          let items = [];
          $.each(limits, (i, a) => {
            items.push({
              text: a.toString() + " " + bbn._("Items"),
              selected: a === this.limit,
              command: () => {
                this.dashboard.updateWidget(this.uid, {limit: a});
              }
            })
          });
          tmp.push({
            text: bbn._("Limit"),
            items: items,
            mode: "selection"
          });
        }
        return tmp;
      }
    },
    methods: {
      _: bbn._,
      updateButtons(){
        this.realButtonsLeft = bbn.fn.isFunction(this.buttonsLeft) ? this.buttonsLeft() : this.buttonsLeft;
        this.realButtonsRight = bbn.fn.isFunction(this.buttonsRight) ? this.buttonsRight() : this.buttonsRight;
      },
      close(){
        this.dashboard.updateWidget(this.uid, {hidden: !this.hidden});
        this.$emit("close", this.uid, this);
      },
      zoom(){
      },
      reload(){
        this.currentItems = [];
        this.$nextTick(() => {
          this.load();
        })
      },
      load(){
        if ( this.url ){
          let params = {
            key: this.uid
          };
          this.isLoading = true;
          this.$forceUpdate();
          if ( this.limit && this.pageable ){
            params.limit = this.limit;
            params.start = this.currentStart;
          }
          return bbn.fn.post(this.url, params, (d) => {
            if ( d.data !== undefined ){
              this.currentItems = d.data;
              if ( d.limit && (this.limit !== d.limit) ){
                this.dashboard.updateWidget(this.uid, {limit: d.limit});
              }
              if ( d.start !== undefined ){
                this.currentStart = d.start;
              }
              if ( d.total !== undefined && (this.currentTotal !== d.total) ){
                this.currentTotal = d.total;
              }
              if ( d.observer && this.observerCheck() ){
                this.observerID = d.observer.id;
                this.observerValue = d.observer.value;
                if ( !this._1stRun ){
                  this.observerWatch();
                  this._1stRun = true;
                }
              }
              if ( d.optional !== undefined ){
                this.optionalData = d.optional;
              }
            }
            else if ( typeof d === 'object' ){
              this.currentSource = d
            }
            this.$nextTick(() => {
              this.isLoading = false;
              this.$emit("loaded");
              this.onResize();
              this.selfEmit(true);
            })
          })
        }
      },
      nav(arg){
        let newStart = false;
        switch ( arg ){
          case 'first':
            newStart = 0;
            break;
          case 'prev':
            newStart = this.currentStart >= this.limit ? this.currentStart - this.limit : 0;
            break;
          case 'next':
            newStart = this.currentStart + this.limit;
            break;
          case 'last':
            newStart = (this.totalPages - 1) * this.limit;
            break;
        }
        if ( (newStart !== false) && (newStart !== this.currentStart) ){
          this.currentStart = newStart;
          this.load();
        }
      },
      actionButton(name, uid){
        let tmp = this,
            comp;
        if ( this.component ){
          comp = bbn.vue.find(this, this.component);
        }
        else if ( this.itemComponent ){
          comp = bbn.vue.find(this, this.itemComponent);
        }
        if ( comp &&bbn.fn.isFunction(comp[name]) ){
          return comp[name]();
        }
        if (bbn.fn.isFunction(name) ){
          return name(this, this.items);
        }
        while ( tmp ){
          if (bbn.fn.isFunction(tmp[name]) ){
            return tmp[name]();
          }
          tmp = tmp.$parent;
        }
      },
      setConfig(){
        if ( this.dashboard ){
          this.dashboard.setConfig(this.uid, {
            uid: this.uid,
            limit: this.limit,
            hidden: this.hidden,
            index: this.index
          });
        }
      }
    },
    created(){
      this.updateButtons();
    },
    mounted(){
      this.dashboard = bbn.vue.closest(this, "bbn-dashboard");
      if ( this.dashboard && this.dashboard.sortable ){
        if ( $(this.$el).closest(".bbn-masonry").hasClass("ui-sortable") ){
          $(this.$el).closest(".bbn-masonry").sortable('refresh')
        }
      }
      this.load();

      this.$nextTick(() => {
        this.onResize();
      })
    },
    updated(){
      if ( this.dashboard ){
        this.dashboard.selfEmit(true);
      }
    },
    watch: {
      limit(newVal){
        this.load();
      },
      hidden(newVal){
        if ( !newVal ){
          this.load();
        }
      },
      observerValue(newVal){
        if ( (newVal !== this._observerReceived) && !this.editedRow ){
          this.load();
        }
      },
      source: {
        deep: true,
        handler(newVal){
          this.currentSource = newVal
        }
      }
    }
  });

})(jQuery, bbn);
