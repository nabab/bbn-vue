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

(function(bbn){
  "use strict";

  /**
   * Classic input with normalized appearance
   */
  Vue.component('bbn-loadicon', {
    /**
     * @mixin bbn.vue.basicComponent 
     */
    mixins: [bbn.vue.basicComponent],
    props: {
      /**
       * The size of the icon container
       * @prop {Number} [16] size
       */
      size: {
        type: Number,
        default: 16
      },
    },
  });

})(bbn);
