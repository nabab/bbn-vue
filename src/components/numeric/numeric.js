/**
 * Created by BBN on 10/02/2017.
 */
(function($, bbn, kendo){
  "use strict";

  Vue.component('bbn-numeric', {
    mixins: [bbn.vue.basicComponent, bbn.vue.eventsComponent, bbn.vue.inputComponent],
    props: {
      decimals: {
        type: [Number, String]
      },
      format: {
        type: String
      },
      max: {
        type: [Number, String]
      },
      min: {
        type: [Number, String]
      },
      round: {
        type: Boolean,
        default: true
      },
      step: {
        type: Number,
        default: 1
      },
      spinners: {
        type: Boolean,
        default: true
      },
      cfg: {
        type: Object
      }
    },
    data(){
      return {
        widgetName: "kendoNumericTextBox",
        realDecimals: this.decimals || (this.step.toString().split('.')[1] || []).length,
        realFormat: this.format || 'n' + (this.decimals || (this.step.toString().split('.')[1] || []).length),
        widget: null
      };
    },
    methods: {
      focus(e){
        let el = this.getRef('element');
        this.$nextTick(() => {
          el.setSelectionRange(0, el.value.length);
        });
        //this.$emit('focus', e);
      }
    },
    mounted(){
      let el = this.getRef('element');
      this.widget = $(el).kendoNumericTextBox($.extend(this.getOptions(), {
        value: this.value,
        format: this.realFormat,
        decimals: this.realDecimals,
        round: this.round,
        step: this.step,
        spinners: this.spinners,
        spin: (e) => {
          this.emitInput(e.sender.value());
        },
        change: (e) => {
          this.emitInput(e.sender.value());
          this.$emit('change', e.sender.value());
        }
      })).data("kendoNumericTextBox");
    },
    watch: {
      min(newVal){
        this.widget.setOptions({min: newVal});
      },
      max(newVal){
        this.widget.setOptions({min: newVal});
      }
    }
  });

})(jQuery, bbn, kendo);
