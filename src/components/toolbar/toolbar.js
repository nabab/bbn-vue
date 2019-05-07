/**
 * @file bbn-toolbar component
 *
 * @description bbn-toolbar is a component that represents a bar containing buttons. Each of them performs a user-defined action.
 * Very useful for applications, simplifying navigation. Bbn-toolbar is responsive to its container.
 *
 * @copyright BBN Solutions
 *
 * @author BBN Solutions
 */

(function($, bbn, kendo){
  "use strict";

  Vue.component('bbn-toolbar', {
    mixins: [bbn.vue.basicComponent, bbn.vue.optionComponent, bbn.vue.widgetComponent],
    props: {
      items: {
        type: Array
      },
      cfg: {
        type: Object,
        default: function(){
          return {
            items: []
          };
        }
      }
    },
    data: function(){
      return bbn.fn.extend({
        widgetName: "kendoToolBar"
      }, bbn.vue.treatData(this));
    },
    methods: {
    },
    mounted: function(){
      var vm = this,
          cfg = vm.getOptions(),
          $ele = $(this.$el),
          items = [],
          $elm,
          tmp,
          html;
      if ( $ele.find(".slot").length ){
        if ( !cfg.items.length && vm.$slots.default && vm.$slots.default.length ){
          $.each(vm.$slots.default, function(i, a){
            if ( a.tag === 'div' ){
              $elm = $(a.elm);
              html = $elm.html();
              if ( !html ){
                cfg.items.push({type: 'separator'});
              }
              else{
                tmp = {
                  alias: bbn.fn.randomString(48),
                  ele: $elm
                };
                cfg.items.push({template: '<span class="' + tmp.alias + '"></span>'});
                items.push(tmp);
              }
            }
          });
        }
      }
      vm.widget = $ele.kendoToolBar(cfg).data("ui-toolbar");
      $.each(items, function(i, a){
        var target = $("." + a.alias).parent().empty();
        a.ele.appendTo(target);
      });
      $ele.find(".slot").remove();
    },
    computed: {
      dataSource: function(){
        if ( this.source ){
          return bbn.vue.toKendoDataSource(this);
        }
        return [];
      }
    },
    watch:{
      source: function(newDataSource){
        bbn.fn.log("Changed DS", this.dataSource);
        this.widget.setDataSource(this.dataSource);
      }
    }
  });

})(jQuery, bbn, kendo);
