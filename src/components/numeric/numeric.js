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
        type: String,
        default: "n0"
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
        type: [Number, String]
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
        widgetName: "kendoNumericTextBox"
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
        format: this.format,
        decimals: this.decimals,
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
