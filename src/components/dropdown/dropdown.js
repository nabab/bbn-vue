/**
 * Created by BBN on 10/02/2017.
 */
(function($, bbn, kendo){
  "use strict";

  kendo.ui.DropDownList.prototype.options.autoWidth = true;

  Vue.component('bbn-dropdown', {
    mixins: [bbn.vue.basicComponent, bbn.vue.inputComponent, bbn.vue.dataSourceComponent],
    props: {
      filterValue: {},
      template: {},
      valueTemplate: {},
      group: {
        type: String
      },
      placeholder: {
        type: String
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
      return {
        widgetName: "kendoDropDownList",
        isOpened: false
      };
    },
    methods: {
      _pressEnter(){
        if ( this.isOpened ){
          this.widget.select();
        }
        else{
          this.widget.open();
        }
      },
      getOptions(){
        var vm = this,
            cfg = bbn.vue.getOptions(vm);
        cfg.change = function(e){
          vm.$emit("input", e.sender.value());
					if ( $.isFunction(vm.change) ){
						vm.change(e.sender.value());
					}
        };
        cfg.select = function(e){
          if ( e.item ){
            vm.$emit("select", vm.widget.dataItem(e.item));
          }
          vm.$emit("select");
        };
        if ( this.template ){
          cfg.template = e => {
            return this.template(e);
          };
        }
        if ( this.valueTemplate ){
          cfg.valueTemplate = e => {
            return this.valueTemplate(e)
          }
        }
        cfg.dataTextField = this.sourceText || this.widgetOptions.dataTextField || 'text';
        cfg.dataValueField = this.sourceValue || this.widgetOptions.dataValueField || 'value';
        cfg.valuePrimitive = true;
        cfg.open = () => {
          bbn.fn.log("IS OPEN CHANGED TO TRUE");
          this.isOpened = true;
        };
        cfg.close = () => {
          bbn.fn.log("IS OPEN CHANGED TO FALSE");
          this.isOpened = false;
        };
        return cfg;
      }
    },
    mounted(){
      const vm = this;
      let cfg = this.getOptions();
      if ( this.disabled ){
        cfg.enable = false;
      }
      if ( this.placeholder ){
        cfg.optionLabel = this.placeholder;
      }
      cfg.dataBound = (e) => {
        if ( !e.sender.options.optionLabel && e.sender.dataSource.data().length && !vm.value ){
          e.sender.select(0);
          e.sender.trigger("change");
        }
      };
      this.widget = $(this.$refs.element).kendoDropDownList(cfg).data("kendoDropDownList");
      if ( !cfg.optionLabel && cfg.dataSource.length && !this.value ){
        this.widget.select(0);
        this.widget.trigger("change");
      }
      this.ready = true;
    },
    computed: {
      dataSource(){
        if ( this.source ){
          if ( this.group ){
            return {
              data: bbn.vue.toKendoDataSource(this),
              group: {
                field: this.group
              }
            }
          }
          return bbn.vue.toKendoDataSource(this);
        }
        return [];
      }
    },
    watch:{
      source(){
        this.widget.setDataSource(this.dataSource);
      }
    }
  });

})(jQuery, bbn, kendo);
