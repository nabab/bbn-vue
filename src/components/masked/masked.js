/**
 * @file bbn-masked component
 *
 * @description bbn-masked is a useful component for those who want full control of data that needs to be processed.
 * It represents an input that allows the user to insert the desired values  in a defined format.For example: the insertion of telephone number.
 *
 * @copyright BBN Solutions
 *
 * @author BBN Solutions
 *
 * @created 10/02/2017
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
      return bbn.fn.extend({
        widgetName: "kendoMaskedTextBox"
      }, bbn.vue.treatData(this));
    },
    mounted(){
      this.widget = $(this.getRef('element')).kendoMaskedTextBox(this.getOptions()).data("kendoMaskedTextBox");
      this.ready = true;
    }
  });

})(jQuery, bbn, kendo);
