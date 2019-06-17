/**
 * @file bbn-multiselect component
 *
 * @description bbn-multiselect represents a text box with a drop-down menu to select or  deselect multiple values ​​from the proposed and provided list.
 * Based on what the user writes, the proposal menu becomes dynamic by returning the result filtered based on what it has been written up to that point.
 * The data can be given either by supplying an array or a url, expecting a response.
 * 
 * @author BBN Solutions
 *
 * @copyright BBN Solutions
 *
 * @created 10/02/2017
 */

(function(bbn, kendo){
  "use strict";

  Vue.component('bbn-multiselect', {
    mixins: [bbn.vue.basicComponent, bbn.vue.fullComponent, bbn.vue.dataSourceComponent],
    props: {
      source: {
        type: [String, Array, Object]
      },
      sortable: {
        type: Boolean
      },
      maxSelectedItems: {
        type: Number
      },
      cfg: {
        type: Object,
        default(){
          return {
            dataTextField: 'text',
            dataValueField: 'value',
            dataSource: []
          };
        }
      }
    },
    data(){
      return bbn.fn.extend({
        widgetName: "kendoMultiSelect"
      }, bbn.vue.treatData(this));
    },
    methods: {
      getOptions(){
        let cfg = bbn.vue.getOptions(this),
            vm = this;
        cfg.change = (e) => {
          vm.$emit("input", e.sender.value());
          if (bbn.fn.isFunction(vm.change) ){
            vm.change(e.sender.value());
          }
        };
        if ( this.template ){
          cfg.itemTemplate = e => {
            return vm.template(e);
          };
        }
        cfg.dataTextField = this.sourceText || this.widgetOptions.dataTextField || 'text';
        cfg.dataValueField = this.sourceValue || this.widgetOptions.dataValueField || 'value';
        cfg.valuePrimitive = true;
        cfg.autoWidth= true;
        return cfg;
      }
    },
    mounted(){
      let cfg = this.getOptions();
      if ( this.disabled ){
        cfg.enable = false;
      }
      this.widget = $(this.$refs.element).kendoMultiSelect(cfg).data("kendoMultiSelect");
      if ( cfg.sortable ){
        this.widget.tagList.kendoSortable({
          hint(element) {
            return element.clone().addClass("hint");
          },
          placeholder(element) {
            return element.clone().addClass("placeholder").html('<div style="width:50px; text-align: center; padding: 0"> ... </div>');
          }
        });
      }
      this.ready = true;
    },
    computed: {
      dataSource(){
        if ( this.source ){
          return bbn.vue.toKendoDataSource(this);
        }
        return [];
      }
    },
    watch:{
      source(newDataSource){
        bbn.fn.log("Changed DS", this.dataSource);
        this.widget.setDataSource(this.dataSource);
      }
    }
  });

})(bbn, kendo);
