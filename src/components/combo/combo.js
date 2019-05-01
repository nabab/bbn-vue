/**
 * @file bbn-combo is a component that allows to insert data but also proposes a list of possible choices to be inserted as input.
 *
 *
 */

/**
 * bbn-combo combines autocomplete and dropdown widgets.
 * Created by BBN on 10/02/2017.
 */
(function($, bbn, kendo){
  "use strict";

  kendo.ui.ComboBox.prototype.options.autoWidth = true;

  Vue.component('bbn-combo', {
    /**
     * @mixin bbn.vue.basicComponent
     * @mixin bbn.vue.inputComponent
     * @mixin bbn.vue.eventsComponent
     * @mixin bbn.vue.dataSourceComponent
     */
    mixins: [bbn.vue.basicComponent, bbn.vue.inputComponent, bbn.vue.eventsComponent, bbn.vue.dataSourceComponent],
    props: {
      /**
       * The delay before the suggestion.
       *
       * @prop {Number} [200] delay
       */
      delay: {
        type: Number,
        default: 200
      },
      /**
       * Set it to true for the clear button to be shown.
       *
       * @prop {Boolean} [false] clearButton
       */
      clearButton: {
        type: Boolean,
        default: true
      },
      /**
       * State the type of filter, the allowed values are 'contains', 'startswith' and 'endswith'.
       *
       * @prop {String} [startswith] filter
       */
      filter: {
        type: String,
        default: "contains"
      },
      /**
       * Define the groups for the dropdown menu.
       * @prop {String} group
       */
      group: {
        type: String
      },
      /**
       * The number of letters required before the suggestion appears.
       *
       * @prop {Number} minLength
       */
      minLength: {
        type: Number
      },
      /**
       * @prop {Boolean} [false] force
       */
      force: {
        type: Boolean,
        default: false
      },
      /**
       * Set to false to show all the items after the input is cleared.
       *
       * @prop {Boolean} [false] enforceMinLength
       *
       */
      enforceMinLength: {
        type: Boolean,
        default: false
      },
      /**
       * Set to true for the first suggestion to be the value of the input.
       *
       * @prop {Boolean} [false] suggest
       */
      suggest: {
        type: Boolean,
        default: true
      },
      /**
       * Set to true for the first item of the suggestions to be highlighted.
       *
       * @prop {Boolean} [true] highlightFirst
       */
      highlightFirst: {
        type: Boolean,
        default: true
      },
      /**
       * Set to true to ignore the typed text case.
       *
       * @prop {Boolean} [true] ignoreCase
       */
      ignoreCase: {
        type: Boolean,
        default: true
      },
      /**
       * @todo description
       * @prop {Boolean} [true] syncTyped
       */
      syncTyped: {
        type: Boolean,
        default: true
      },
      cascade: {
        /**
         * Set to true to enable the cascade combo.
         *
         * @prop {Boolean|Object} [false] cascade
         */
        type: [Boolean, Object],
        default: false
      },
      /**
       * The template to costumize the combo menu.
       *
       * @prop {Function} template
       */
      template: {
        type: [Function]
      },
      /**
       * Use this prop to give native widget's properties.
       *
       * @prop {Object} [{}] cfg
       */
      cfg: {
        type: Object,
        default: function(){
          return {};
        }
      }
    },
    data: function(){
      return bbn.fn.extend({
        widgetName: "kendoComboBox"
      }, bbn.vue.treatData(this));
    },
    methods: {
      /**
       * Creates the object cfg.
       *
       * @method getOptions
       * @fires template
       * @returns {*}
       */
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
          cascade: this.cascade,
          autoWidth: true,
          change: () => {
            this.emitInput(this.$refs.element.value)
          }
        };
        if ( this.placeholder ){
          cfg.placeholder = this.placeholder;
        }
        if ( this.template ){
          cfg.template = e => {
            return this.template(e);
          };
        }
        else{
          cfg.template = '<span>#= text #</span>'
        }
        if ( cfg.dataSource && !Array.isArray(cfg.dataSource) ){
          cfg.dataSource.options.serverFiltering = true;
          cfg.dataSource.options.serverGrouping = true;
        }
        else if ( this.group ){
          cfg.dataSource = {
            data: cfg.dataSource,
            group: this.group
          };
        }
        return cfg;
      }
    },
    mounted: function(){
      /**
       * @event mounted
       * @fires getOptions
       * @return {Boolean}
       */
      this.widget = $(this.$refs.element).kendoComboBox(this.getOptions()).data("kendoComboBox");
      this.ready = true;
    }
  });
})(jQuery, bbn, kendo);
