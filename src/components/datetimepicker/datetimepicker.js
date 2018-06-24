/**
 * Created by BBN on 10/02/2017.
 */
(function($, bbn, kendo){
  "use strict";

  let ui = kendo.ui,
      MaskedDateTimePicker = ui.Widget.extend({
        init: function (element, options) {
          const that = this;
          ui.Widget.fn.init.call(this, element, options);
          $(element)
            .kendoMaskedTextBox({
              mask: that.options.mask
            })
            .kendoDateTimePicker({
              format: options.format,
              parseFormats: options.parseFormats,
              max: options.max || undefined,
              min: options.min || undefined,
              depth: options.depth || undefined,
              start: options.depth || undefined,
              value: this.value,
            })
            .closest(".k-datetimepicker")
            .add(element)
            .removeClass("k-textbox");
          that.element.data("kendoDateTimePicker").bind("change", function() {
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
        destroy: function () {
          const that = this;
          ui.Widget.fn.destroy.call(that);
          kendo.destroy(that.element);
        },
        value: function(value) {
          const datetimepicker = this.element.data("kendoDateTimePicker");
          if (value === undefined) {
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
          return 'yyyy-MM-dd';
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
    },
    computed: {
      ivalue(){
        return kendo.toString(
          kendo.parseDate(this.value, $.isFunction(this.valueFormat) ? this.valueFormat(this.value) : this.valueFormat),
          this.format
        );
      }
    },
    data(){
      return $.extend({
        widgetName: "kendoMaskedDateTimePicker"
      }, bbn.vue.treatData(this));
    },
    mounted(){
      const vm = this;
      this.widget = $(this.$refs.element).kendoMaskedDateTimePicker($.extend({}, this.getOptions(), {
        format: this.format,
        parseFormats: this.parseFormats,
        mask: this.mask,
        min: this.min ? ( (typeof this.min === 'string') ? bbn.fn.date(this.min) : this.min) : undefined,
        max: this.max ? ( (typeof this.max === 'string') ? bbn.fn.date(this.max) : this.max) : undefined,
        depth: this.depth || undefined,
        start: this.depth || undefined,
        value: this.value,
          change: () => {
            vm.emitInput(kendo.toString(
              vm.widget.value(),
              $.isFunction(vm.valueFormat) ? vm.valueFormat(vm.widget.value()) : vm.valueFormat
            ));
            return true;
          }
        }))
        .data("kendoDateTimePicker");
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
    }
  });

})(jQuery, bbn, kendo);
