/**
 * Created by BBN on 15/02/2017.
 */
(($, bbn) => {
  "use strict";

  /**
   * Classic input with normalized appearance
   */
  Vue.component('bbns-column', {
    mixins: [bbn.vue.basicComponent],
    props: {
      width: {
        type: [String, Number],
      },
      render: {
        type: [String, Function]
      },
      title: {
        type: [String, Number],
        default: bbn._("Untitled")
      },
      ftitle: {
        type: String
      },
      icon: {
        type: String
      },
      cls: {
        type: [Function, String]
      },
      type: {
        type: String
      },
      field: {
        type: String
      },
      fixed: {
        type: [Boolean, String],
        default: false
      },
      hidden: {
        type: Boolean
      },
      encoded: {
        type: Boolean,
        default: false
      },
      sortable: {
        type: Boolean,
        default: true
      },
      filterable: {
        type: Boolean,
        default: true
      },
      resizable: {
        type: Boolean,
        default: true
      },
      showable: {
        type: Boolean,
        default: true
      },
      buttons: {
        type: [Array, Function]
      },
      source: {
        type: [Array, Object, String]
      },
      required: {
        type: Boolean,
      },
      options: {
        type: [Object, Function],
        default(){
          return {};
        }
      }
    },
    data(){
      var vm = this,
          r = bbn.vue.treatData(vm).widgetCfg || {};
      if ( vm.$options && vm.$options.props ){
        for ( var n in r ){
          if ( vm.$options.props[n] !== undefined ){
            delete r[n];
          }
        }
      }
      r.table = null;
      r.isComponent = null;
      r.name = bbn.fn.randomString(20, 15).toLowerCase();
      r.isMounted = false;
      return r;
    },
    watch: {
      selected(newVal, oldVal){
        if ( newVal && !oldVal ){
          var vm = this;
          if ( vm.load ){
            vm.$parent.load(vm.url);
          }
          else{
            bbn.fn.log("TabNav selected has changed - old: " + oldVal + " new: " + newVal + " for URL " + vm.url);
            bbn.fn.analyzeContent(vm.$el, true);
          }
        }
      },
      content(){
        var ele = this.$el;
        bbn.fn.analyzeContent(ele, true);
      },
      source: {
        deep: true,
        handler(){
          this.$forceUpdate();
        }
      }
    }
  });

})(jQuery, bbn, kendo);
