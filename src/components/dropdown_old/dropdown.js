/**
 * @file bbn-dropdown component
 *
 * @description the easy-to-implement bbn-dropdown component lets you choose a single default value from a user-supplied list.
 *
 * @copyright BBN Solutions
 *
 * @author BBN Solutions
 *
 * @created 10/02/2017.
 */

(function($, bbn, kendo){
  "use strict";

  kendo.ui.DropDownList.prototype.options.autoWidth = true;

  Vue.component('bbn-dropdown', {
    /**
     * @mixin bbn.vue.basicComponent
     * @mixin bbn.vue.inputComponent
     * @mixin bbn.vue.dataSourceComponent
     */
    mixins: [bbn.vue.basicComponent, bbn.vue.inputComponent, bbn.vue.dataSourceComponent, bbn.vue.urlComponent],
    props: {
    /**
     * State the type of filter, the allowed values are 'contains', 'startswith' and 'endswith'.
     *
     * @prop {String} [startswith] filterValue
     */
      filterValue: {},
      /**
       * The template to costumize the dropdown menu.
       *
       * @prop {} template
       */
      template: {},
      /**
       * @todo description
       *
       * @prop {} valueTemplate
       */
      valueTemplate: {},
      /**
       * Define the groups for the dropdown menu.
       * @prop {String} group
       */
      group: {
        type: String
      },
      /**
       * The placeholder of the dropdown.
       *
       * @prop {String} placeholder
       */
      placeholder: {
        type: String
      },
      /**
       * Use this prop to give native widget's properties.
       *
       * @prop {Object} [{}] cfg
       */
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
      /**
       * States the role of the enter button on the dropdown menu.
       *
       * @method _pressEnter
       * @fires widget.select
       * @fires widget.open
       *
       */
      _pressEnter(){
        if ( this.isOpened ){
          this.widget.select();
        }
        else{
          this.widget.open();
        }
      },
      /**
       * Creates the object cfg.
       *
       * @method getOptions
       * @returns {*}
       */
      getOptions(){
        let cfg = bbn.fn.extend(bbn.vue.getOptions(this), {
          change: (e) => {
            this.$emit("input", e.sender.value());
            if (bbn.fn.isFunction(this.change) ){
              this.change(e.sender.value());
            }
          },
          select: (e) =>{
            if ( e.item && this.widget ){
              this.$emit("select", this.widget.dataItem(e.item));
            }
            this.$emit("select");
          },
          dataTextField: this.sourceText || this.widgetOptions.dataTextField || 'text',
          dataValueField: this.sourceValue || this.widgetOptions.dataValueField || 'value',
          valuePrimitive: true,
          open: () => {
            this.isOpened = true;
          },
          close: () => {
            this.isOpened = false;
          },
          dataBound: () => {
            this.$emit("dataloaded", this);
          }
        });
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
        return cfg;
      },
    },
    mounted(){
      /**
       * @todo description
       *
       * @event mounted
       * @fires getOptions
       * @return {Boolean}
       */
      const vm = this;
      let cfg = this.getOptions();
      if ( this.disabled ){
        cfg.enable = false;
      }
      if ( this.placeholder ){
        cfg.optionLabel = this.placeholder;
      }
      this.widget = $(this.$refs.element).kendoDropDownList(cfg).data("kendoDropDownList");
      if ( this.baseUrl && (bbn.env.path.indexOf(this.baseUrl) === 0) && (bbn.env.path.length > this.baseUrl.length) ){
        let val = bbn.env.path.substr(this.baseUrl.length+1);
        let idx = bbn.fn.search(cfg.dataSource, this.sourceValue, val);
        if ( idx > -1 ){
          this.widget.select(idx);
          this.widget.trigger("change");
        }
      }
      else if ( !cfg.optionLabel && cfg.dataSource.length && !vm.value ){
        this.widget.select(0);
        this.widget.trigger("change");
      }
      /*
      if ( !cfg.optionLabel && cfg.dataSource.length && !this.value ){
        this.widget.select(0);
        this.widget.trigger("change");
      }
      */
      this.ready = true;

    },
    computed: {
      /**
       * The kendo datasource of the widget.
       *
       * @computed dataSource
       * @return {Array}
       */
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
      /**
       * @watch source
       * @fires setDataSource
       */
      source: {
        deep: true,
        handler(){
          this.widget.setDataSource(this.dataSource);
        }
      },
      value(){
        this.updateUrl();
      },
      readonly(v){
        this.widget.readonly(!!v);
      }
    }
  });

})(jQuery, bbn, kendo);
