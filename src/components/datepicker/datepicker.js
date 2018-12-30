/**
 * bbn-datepicker component
 * Created by BBN on 10/02/2017.
 */
(function($, bbn, kendo){
  "use strict";

  let ui = kendo.ui,
      MaskedDatePicker = ui.Widget.extend({
        init: function (element, options){
          let that = this;
          ui.Widget.fn.init.call(this, element, options);
          $(element)
            .kendoMaskedTextBox({
              mask: options.mask
            })
            .kendoDatePicker({
              format: options.format,
              parseFormats: options.parseFormats,
              max: options.max || undefined,
              min: options.min || undefined,
              depth: options.depth || undefined,
              start: options.depth || undefined,
              value: options.value || undefined,
              footer: options.footer !== undefined ? options.footer : undefined
            })
            .closest(".k-datepicker")
            .add(element)
            .removeClass("k-textbox");

          that.element.data("kendoDatePicker").bind("change", function(){
            that.trigger('change');
          });
        },
        options: {
          name: "MaskedDatePicker",
          dateOptions: {}
        },
        events: [
          'change'
        ],
        destroy: function(){
          const that = this;
          ui.Widget.fn.destroy.call(that);
          kendo.destroy(that.element);
        },
        value: function(value){
          const datepicker = this.element.data("kendoDatePicker");
          if ( value === undefined ){
            return datepicker.value();
          }
          datepicker.value(value);
        }
      });
  ui.plugin(MaskedDatePicker);


  Vue.component('bbn-datepicker', {
    /**
     * @mixin bbn.vue.basicComponent
     * @mixin bbn.vue.fullComponent
     */
    mixins: [bbn.vue.basicComponent, bbn.vue.fullComponent],
    props: {
      /**
       * Use this prop to give native widget's properties.
       *
       * @prop {Object} [{}] cfg
       */
      cfg: {
        type: Object
      },
      /**
       * The format of the date shown.
       *
       * @prop {String} [dd/MM/yyyy] format
       */
      format: {
        type: String,
        default: 'dd/MM/yyyy'
      },
      /**
       * The format of the value sent to the server.
       *
       * @prop {String} [yyyy-MM-dd] valueFormat
       */
      valueFormat: {
        type: [String, Function],
        default(){
          return 'yyyy-MM-dd';
        }
      },
      /**
       * Specifie a list of date formats to be used to parse the value.
       *
       * @prop {Array} [['yyyy-MM-dd', 'dd/MM/yyyy']] valueFormat
       */
      parseFormats: {
        type: Array,
        default(){
          return ['yyyy-MM-dd', 'dd/MM/yyyy'];
        }
      },
      /**
       * The mask for date input.
       *
       * @prop {String} [00/00/0000] mask
       */
      mask: {
        type: String,
        default: '00/00/0000'
      },
      /**
       * The max date allowed.
       *
       * @prop {Date|String} max
       */
      max: {
        type: [Date, String]
      },
      /**
       * The min date allowed.
       *
       * @prop {Date|String} min
       */
      min: {
        type: [Date, String]
      },
      /**
       * @todo description
       *
       * @prop {Array} dates
       */
      dates: {
        type: Array
      },
      /**
       * Define the rendered view of the calendar in the datepicker. Allowed values : month, year, decade, century.
       *
       * @prop {String} depth
       */
      depth: {
        type: String
      },
      /**
       * The dates disabled.
       *
       * @prop {Array|Function} disableDates
       */
      disableDates: {
        type: [Array, Function]
      },
      /**
       * Set to true to show the default footer in the component or set a costumized template for the footer.
       *
       * @prop {Boolean|Function|String} footer
       */
      footer: {
        type: [Boolean, Function, String]
      },
      /**
       * @todo description, it seems not to work.
       *
       * @prop {Boolean} [false] inputReadonly
       */
      inputReadonly: {
        type: Boolean,
        default: false
      },
      /**
       * The type of the datepicker.
       *
       * @prop {String} [''] type
       */
      type: {
        type: String,
        default: ''
      },
    },

    computed: {

      ivalue(){
        return kendo.toString(
          kendo.parseDate(this.value, $.isFunction(this.valueFormat) ? this.valueFormat(this.value) : this.valueFormat),
          this.format
        );
      },
      fixedValue(){
        if ( this.value ){
          return kendo.parseDate(this.value, $.isFunction(this.valueFormat) ? this.valueFormat(this.value) : this.valueFormat);
        }
        return false;
      }
    },
    data(){
      return $.extend({
        widgetName: "kendoMaskedDatePicker"
      }, bbn.vue.treatData(this));
    },
    /**
     * @event mounted
     * @fires getOptions
     *
     */
    mounted(){
      const vm = this;
      this.widget = $(this.$refs.element).kendoMaskedDatePicker($.extend({}, this.getOptions(), {
        format: this.format,
        parseFormats: this.parseFormats,
        mask: this.mask,
        min: this.min ? ( (typeof this.min === 'string') ? bbn.fn.date(this.min) : this.min) : undefined,
        max: this.max ? ( (typeof this.max === 'string') ? bbn.fn.date(this.max) : this.max) : undefined,
        depth: this.depth || undefined,
        start: this.depth || undefined,
        footer: this.footer === undefined ? this.footer : undefined,
        value: this.fixedValue || undefined,
        change: function(e){
          vm.emitInput(kendo.toString(
            vm.widget.value(),
            $.isFunction(vm.valueFormat) ? vm.valueFormat(vm.widget.value()) : vm.valueFormat
          ));
          return true;
        }
      })).data("kendoDatePicker");
      if ( !this.readonly && this.inputReadonly ){
        $(this.$refs.element).attr("readonly", true);
      }
      this.ready = true;
    },
    watch: {
      /**
       * @watch min
       * @fires widget.setOptions
       */
      min(newVal){
       if ( newVal ){
         if ( typeof newVal === 'string' ){
           newVal = bbn.fn.date(newVal);
         }
         this.widget.setOptions({
           min: newVal
         });
       }
      },
      /**
       * @watch max
       * @fires widget.setOptions
       */
      max(newVal){
        if ( newVal ){
          if ( typeof newVal === 'string' ){
            newVal = bbn.fn.date(newVal);
          }
          this.widget.setOptions({
            max: newVal
          });
        }
      },
      /**
       * @watch depth
       * @fires widget.setOptions
       */
      depth(newVal){
        this.widget.setOptions({
          depth: newVal,
          start: newVal
        });
      },
      /**
       * @watch format
       * @fires widget.setOptions
       */
      format(newVal){
        this.widget.setOptions({
          format: newVal
        });
      },
      /**
       * @watch parseFormats
       * @fires widget.setOptions
       */
      parseFormats(newVal){
        this.widget.setOptions({
          parseFormats: newVal
        });
      },
      /**
       * @watch readonly
       */
      readonly(newVal){
        this.widget.readonly(!!newVal);
        if ( !newVal && this.inputReadonly ){
          this.$nextTick(() => {
            $(this.$refs.element).attr("readonly", true);
          });
        }
      },
      /**
       * @watch inputReadonly
       */
      inputReadonly(newVal){
        if ( !this.readonly ){
          if ( newVal ){
            $(this.$refs.element).attr("readonly", true);
          }
          else {
            $(this.$refs.element).removeAttr("readonly");
          }
        }
      }
    }
  });

})(jQuery, bbn, kendo);
