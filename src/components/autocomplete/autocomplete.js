/**
 * Created by BBN on 10/02/2017.
 */
(function($, bbn, kendo){
  "use strict";

  kendo.ui.AutoComplete.prototype.options.autoWidth = true;

  Vue.component('bbn-autocomplete', {
    template: '#bbn-tpl-component-autocomplete',
    mixins: [bbn.vue.fullComponent, bbn.vue.dataSourceComponent],
    props: {
      id: {
        type: String
      },
      delay: {
        type: Number,
        default: 200
      },
      clearButton: {
        type: Boolean,
        default: true
      },
      filter: {
        type: String,
        default: "startswith"
      },
      minLength: {
        type: Number
      },
      force: {
        type: Boolean,
        default: false
      },
      enforceMinLength: {
        type: Boolean,
        default: false
      },
      suggest: {
        type: Boolean,
        default: false
      },
      highlightFirst: {
        type: Boolean,
        default: true
      },
      ignoreCase: {
        type: Boolean,
        default: true
      },
      template: {
        type: [Function]
      },
      virtual: {
        type: [Boolean, Object],
        default: false
      }
    },
    data(){
      return {
        widgetName: 'kendoAutoComplete',
        filterValue: '',
      };
    },
    methods: {
      autocompleteSearch(e){
        bbn.fn.log("VAL", e.target.value);
        this.filterValue = e.target.value;
        if ( !this.force ){
          this.emitInput(this.filterValue);
        }
      },
      autocompleteBlur(e) {
        bbn.fn.log("BLUR", e.target.value, this.widget);
      },
      listHeight(){
        let $ele = $(this.$refs.element),
            pos = $ele.offset(),
            h = $ele.height();
        return pos ? $(window).height() - pos.top - h - 30 : 0;
      },
      getOptions(){
        let cfg = {
          valuePrimitive: true,
          dataSource: this.dataSource,
          dataTextField: this.sourceText,
          dataValueField: this.sourceValue,
          delay: this.delay,
          filter: this.filter,
          suggest: this.suggest,
          clearButton: this.clearButton,
          ignoreCase: this.ignoreCase,
          highlightFirst: this.highlightFirst,
          virtual: this.virtual,
          select: e => {
            this.emitInput(e.dataItem.toJSON()[e.sender.options.dataValueField]);
          }
        };
        if ( this.template ){
          cfg.template = e => {
            return this.template(e);
          };
        }
        if ( cfg.dataSource && !$.isArray(cfg.dataSource) ){
          cfg.dataSource.options.serverFiltering = true;
          cfg.dataSource.options.serverGrouping = true;
        }
        return bbn.vue.getOptions2(this, cfg);
      }
    },
    mounted(){
      let $ele = $(this.$refs.element);
      this.widget = $ele.kendoAutoComplete(this.getOptions()).data("kendoAutoComplete");
      this.$emit("ready", this.value);
      /** @todo You have to remove this event onDestroy */
      $(window).resize(() => {
        this.widget.setOptions({
          height: this.listHeight()
        });
      });
    },
    computed: {
      dataSource(){
        if ( this.source ){
          return bbn.vue.toKendoDataSource(this);
        }
        return [];
      }
    },
    watch: {
      dataSource(newDataSource){
        this.widget.setDataSource(newDataSource);
      }
    }
  });

})(jQuery, bbn, kendo);
