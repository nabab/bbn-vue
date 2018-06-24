/**
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
              value: options.value || undefined
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
    mixins: [bbn.vue.basicComponent, bbn.vue.fullComponent],
    props: {
      cfg: {
        type: Object
      },
      format: {
        type: String,
        default: 'dd/MM/yyyy'
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
          return ['yyyy-MM-dd', 'dd/MM/yyyy'];
        }
      },
      mask: {
        type: String,
        default: '00/00/0000'
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
      ivalue(){
        return kendo.toString(
          kendo.parseDate(this.value, $.isFunction(this.valueFormat) ? this.valueFormat(this.value) : this.valueFormat),
          this.format
        );
      }
    },
    data(){
      return $.extend({
        widgetName: "kendoMaskedDatePicker"
      }, bbn.vue.treatData(this));
    },
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
        value: this.value || undefined,
        change: function(e){
          vm.emitInput(kendo.toString(
            vm.widget.value(),
            $.isFunction(vm.valueFormat) ? vm.valueFormat(vm.widget.value()) : vm.valueFormat
          ));
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
    }
  });

})(jQuery, bbn, kendo);
