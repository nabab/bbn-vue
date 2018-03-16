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

          $(element).kendoMaskedTextBox({ mask: that.options.mask || "00/00/0000 00:00" })
            .kendoDateTimePicker({
              format: that.options.format || "dd/MM/yyyy HH:mm",
              parseFormats: that.options.parseFormats || ["yyyy-MM-dd HH:mm:ss", "dd/MM/yyyy HH:mm"],
              max: that.options.max || undefined,
              min: that.options.min || undefined
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
        type: Object,
        default: function(){
          return {
            format: 'dd/MM/yyyy HH:mm',
            parseFormats: ['yyyy-MM-dd HH:mm:ss', 'dd/MM/yyyy HH:mm'],
            mask: '00/00/0000 00:00'
          }
        }
      },
      mask: {
        type: String
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
        return kendo.toString(kendo.parseDate(this.value, "yyyy-MM-dd HH:mm:ss"), "dd/MM/yyyy HH:mm");
      }
    },
    data(){
      return $.extend({
        widgetName: "kendoMaskedDateTimePicker"
      }, bbn.vue.treatData(this));
    },
    mounted(){
      const vm = this;
      vm.widget = $(this.$refs.element).kendoMaskedDateTimePicker($.extend(this.getOptions(), {
        min: this.min ? ( (typeof this.min === 'string') ? bbn.fn.date(this.min) : this.min) : undefined,
        max: this.max ? ( (typeof this.max === 'string') ? bbn.fn.date(this.max) : this.max) : undefined,
          change: () => {
            vm.emitInput(kendo.toString(vm.widget.value(), "yyyy-MM-dd HH:mm:ss"));
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
      }
    }
  });

})(jQuery, bbn, kendo);
