/**
 * @file bbn-loadicon component
 *
 * @description bbn-loadicon is a simple implementation component, which represents an icon displaying a waiting state.
 *
 * @copyright BBN Solutions
 *
 * @author  BBN Solutions
 * 
 * @created 07/01/2017
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
