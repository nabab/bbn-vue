/**
 * bbn-autocomplete is an input field that provides suggestions on the typed text
 *
 * Created by BBN on 10/02/2017.
 */
(function($, bbn, kendo){
  "use strict";

  kendo.ui.AutoComplete.prototype.options.autoWidth = true;

  Vue.component('bbn-autocomplete', {
    mixins: [bbn.vue.basicComponent, bbn.vue.inputComponent, bbn.vue.eventsComponent, bbn.vue.dataSourceComponent],
    props: {
      /**
       * The id of the autocomplete.
       *
       * @prop {String} id
       */
      id: {
        type: String
      },
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
        default: "startswith"
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
        default: false
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
       * The template to costumize the autocomplete box.
       *
       * @prop {Function} template
       */
      template: {
        type: [Function]
      },
      /**
       * Enables the virtualization feature of the autocomplete.
       *
       * @prop {Boolean|Function} template
       */
      virtual: {
        type: [Boolean, Object],
        default: false
      }
      ,
      height: {
        type: Number
      }
    },
    data(){
      return {
        widgetName: 'kendoAutoComplete',
        filterValue: '',
      };
    },
    methods: {
      /**
       * Emits the filter value.
       *
       * @method autocompleteSearch
       * @param e
       * @fires emitInput
       */
      autocompleteSearch(e){
        this.filterValue = e.target.value;
        if ( !this.force ){
          this.emitInput(this.filterValue);
        }
      },
      /**
       * Sets the height of the suggestions list.
       *
       * @method listHeight
       * @returns {number}
       */
      listHeight(){
        let $ele = $(this.$refs.element),
            pos = $ele.offset(),
            h = $ele.height();
        return pos ? $(window).height() - pos.top - h - 30 : 0;
      },
      /**
       * Creates the object cfg.
       *
       * @method getOptions
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
          virtual: this.virtual,
          height: this.height || undefined,
          select: e => {
            bbn.fn.log("SELECT", e);
            let d = e.dataItem.toJSON();
            if ( [e.sender.options.dataValueField] ){
              if ( d[[e.sender.options.dataValueField]] === undefined ){
                throw new Error("The value field \"" + e.sender.options.dataValueField + "\" doesn't exist in the dataItem");
              }
              d = d[[e.sender.options.dataValueField]];
            }
            this.emitInput(d);
            this.$emit('change', d);
          }
        };
        if ( this.template ){
          cfg.template = e => {
            return this.template(e);
          };
        }
        if ( cfg.dataSource && !Array.isArray(cfg.dataSource) ){
          cfg.dataSource.options.serverFiltering = true;
          cfg.dataSource.options.serverGrouping = true;
        }
        return bbn.vue.getOptions2(this, cfg);
      }
    },
    /**
     * @event mounted
     * @fires getOptions
     * @fires listHeight
     */
    mounted(){
      let $ele = $(this.$refs.element);
      this.widget = $ele.kendoAutoComplete(this.getOptions()).data("kendoAutoComplete");
      this.ready = true;
      /** @todo You have to remove this event onDestroy */
      $(window).resize(() => {
        this.widget.setOptions({
          height: this.listHeight()
        });
      });
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
          return bbn.vue.toKendoDataSource(this);
        }
        return [];
      }
    },
    watch: {
      /**
       * @watch source
       * @fires setDataSource
       */
      dataSource(newDataSource){
        this.widget.setDataSource(newDataSource);
      }
    }
  });

})(jQuery, bbn, kendo);
