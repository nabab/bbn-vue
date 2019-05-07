 /**
  * @file bbn-datetimepicker component
  *
  * @description bbn-datetimepicker is a component that combines input, calendar and drop-down list, to choose the time.
  * Allows the user to enter or select a date and time value.
  * The calendar display is smooth, ensuring that all users can quickly search for the date they are looking for with the interface.
  * Allows the association of data in a bidirectional way.
  * Choose a validation interval period and the format of the value to be entered.
  *
  * @copyright BBN Solutions
  *
  * @author BBN Solutions
  */
(function($, bbn, kendo){
  "use strict";

  let ui = kendo.ui,
      MaskedDateTimePicker = ui.Widget.extend({
        init: function (element, options) {
          let that = this;
          ui.Widget.fn.init.call(this, element, options);
          $(element)
            .kendoMaskedTextBox({
              mask: options.mask
            })
            .kendoDateTimePicker({
              format: options.format,
              parseFormats: options.parseFormats,
              max: options.max || undefined,
              min: options.min || undefined,
              depth: options.depth || undefined,
              start: options.depth || undefined,
              value: options.value || undefined,
              footer: options.footer !== undefined ? options.footer : undefined
            })
            .closest(".k-datetimepicker")
            .add(element)
            .removeClass("k-textbox");

          that.element.data("kendoDateTimePicker").bind("change", function(){
            that.trigger('change');
          });
        },
        options: {
          name: "MaskedDateTimePicker",
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
        value: function(value) {
          const datetimepicker = this.element.data("kendoDateTimePicker");
          if ( value === undefined ){
            return datetimepicker.value();
          }
          datetimepicker.value(value);
        }
      });
  ui.plugin(MaskedDateTimePicker);

  Vue.component('bbn-datetimepicker', {
    mixins: [bbn.vue.basicComponent, bbn.vue.fullComponent],
    props: {
      cfg: {
        type: Object
      },
      format: {
        type: String,
        default: 'dd/MM/yyyy HH:mm'
      },
      valueFormat: {
        type: [String, Function],
        default(){
          return 'yyyy-MM-dd HH:mm:ss';
        }
      },
      parseFormats: {
        type: Array,
        default(){
          return ['yyyy-MM-dd HH:mm:ss', 'dd/MM/yyyy HH:mm'];
        }
      },
      mask: {
        type: String,
        default: '00/00/0000 00:00'
      },
      max: {
        type: [Date, String]
      },
      min: {
        type: [Date, String]
      },
      culture: {
        type: String
      },
      dates: {
        type: Array
      },
      depth: {
        type: String
      },
      disableDates: {
        type: [Array, Function]
      },
      footer:{
        type: [Boolean, Function, String]
      },
      type: {
        type: String,
        default: ''
      },
      inputReadonly: {
        type: Boolean,
        default: false
      }
    },
    computed: {
      ivalue(){
        return kendo.toString(
          kendo.parseDate(this.value,bbn.fn.isFunction(this.valueFormat) ? this.valueFormat(this.value) : this.valueFormat),
          this.format
        );
      },
      fixedValue(){
        if ( this.value ){
          return kendo.parseDate(this.value,bbn.fn.isFunction(this.valueFormat) ? this.valueFormat(this.value) : this.valueFormat);
        }
        return false;
      }
    },
    data(){
      return bbn.fn.extend({
        widgetName: "kendoMaskedDateTimePicker"
      }, bbn.vue.treatData(this));
    },
    mounted(){
      const vm = this;
      this.widget = $(this.$refs.element).kendoMaskedDateTimePicker(bbn.fn.extend({}, this.getOptions(), {
        format: this.format,
        parseFormats: this.parseFormats,
        mask: this.mask,
        min: this.min ? ( (typeof this.min === 'string') ? bbn.fn.date(this.min) : this.min) : undefined,
        max: this.max ? ( (typeof this.max === 'string') ? bbn.fn.date(this.max) : this.max) : undefined,
        depth: this.depth || undefined,
        start: this.depth || undefined,
        value: this.fixedValue || undefined,
        footer: this.footer !== undefined ? this.footer : undefined,
          change: () => {
            vm.emitInput(kendo.toString(
              vm.widget.value(),
             bbn.fn.isFunction(vm.valueFormat) ? vm.valueFormat(vm.widget.value()) : vm.valueFormat
            ));
            return true;
          }
        }))
        .data("kendoDateTimePicker");
      if ( !this.readonly && this.inputReadonly ){
        $(this.$refs.element).attr("readonly", true);
      }
      this.ready = true;
    },
    watch: {
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
      depth(newVal){
        this.widget.setOptions({
          depth: newVal,
          start: newVal
        });
      },
      format(newVal){
        this.widget.setOptions({
          format: newVal
        });
      },
      parseFormats(newVal){
        this.widget.setOptions({
          parseFormats: newVal
        });
      },
      readonly(newVal){
        this.widget.readonly(!!newVal);
        if ( !newVal && this.inputReadonly ){
          this.$nextTick(() => {
            $(this.$refs.element).attr("readonly", true);
          });
        }
      },
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
