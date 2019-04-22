/**
 * Created by BBN on 07/01/2017.
 */
;(function($, bbn){
  "use strict";

  /**
   * Classic input with normalized appearance
   */
  Vue.component('bbn-loadicon', {
    mixins: [bbn.vue.basicComponent],
    props: {
      size: {
        type: Number,
        default: 16
      }
    },
  });

})(jQuery, bbn);
