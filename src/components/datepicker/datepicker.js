/**
 * Created by BBN on 10/02/2017.
 */
(function($, bbn, kendo){
  "use strict";

  let ui = kendo.ui,
      MaskedDatePicker = ui.Widget.extend({
        init: function (element, options) {
          let that = this;
          ui.Widget.fn.init.call(this, element, options);

          $(element).kendoMaskedTextBox({ mask: that.options.mask || "00/00/0000" })
            .kendoDatePicker({
              format: that.options.format || "dd/MM/yyyy HH:mm",
              parseFormats: that.options.parseFormats || ["yyyy-MM-dd HH:mm:ss", "dd/MM/yyyy HH:mm"],
              max: that.options.max || undefined,
              min: that.options.min || undefined
            })
            .closest(".k-datepicker")
            .add(element)
            .removeClass("k-textbox");

          that.element.data("kendoDatePicker").bind("change", function() {
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
        destroy: function () {
          const that = this;
          ui.Widget.fn.destroy.call(that);
          kendo.destroy(that.element);
        },
        value: function(value) {
          const datepicker = this.element.data("kendoDatePicker");
          if (value === undefined) {
            return datepicker.value();
          }
          datepicker.value(value);
        }
      });
  ui.plugin(MaskedDatePicker);

  Vue.component('bbn-datepicker', {
    mixins: [bbn.vue.basicComponent, bbn.vue.fullComponent],
    props: {
      cfg: {
        type: Object,
        default: function(){
          return {
            format: 'dd/MM/yyyy',
            parseFormats: ['yyyy-MM-dd', 'dd/MM/yyyy'],
            mask: '00/00/0000'
          }
        }
      },
      format: {
        type: String
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
      dates: {
        type: Array
      },
      depth: {
        type: String
      },
      disableDates: {
        type: [Array, Function]
      }
    },
    computed: {
      ivalue: function(){
        return kendo.toString(kendo.parseDate(this.value, "yyyy-MM-dd"), "dd/MM/yyyy");
      }
    },
    data: function(){
      return $.extend({
        widgetName: "kendoMaskedDatePicker"
      }, bbn.vue.treatData(this));
    },
    mounted: function(){
      const vm = this;
      this.widget = $(this.$refs.element).kendoMaskedDatePicker($.extend(vm.getOptions(), {
        min: this.min ? ( (typeof this.min === 'string') ? bbn.fn.date(this.min) : this.min) : undefined,
        max: this.max ? ( (typeof this.max === 'string') ? bbn.fn.date(this.max) : this.max) : undefined,
        change: function(e){
          vm.emitInput(kendo.toString(vm.widget.value(), "yyyy-MM-dd"));
          return true;
        }
      })).data("kendoDatePicker");
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
