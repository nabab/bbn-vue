/**
 * Created by BBN on 10/02/2017.
 */
(function($, bbn, kendo){
  "use strict";

  Vue.component('bbn-masked', {
    mixins: [bbn.vue.basicComponent, bbn.vue.fullComponent],
    props: {
      mask: {
        type: String
      },
      cfg: {
        type: Object,
        default(){
          return {
            promptChar: '_'
          };
        }
      }
    },
    data(){
      return $.extend({
        widgetName: "kendoMaskedTextBox"
      }, bbn.vue.treatData(this));
    },
    mounted(){
      this.widget = $(this.getRef('element')).kendoMaskedTextBox(this.getOptions()).data("kendoMaskedTextBox");
      this.ready = true;
    }
  });

})(jQuery, bbn, kendo);
