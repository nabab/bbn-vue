/**
 * @file bbn-floater component
 *
 * @description bbn-floater is a component that represents a container that can be bound to another element.
 *
 * @author BBN Solutions
 *
 * @copyright BBN Solutions
 */
(function(Vue, bbn){
  "use strict";
  /**
   * Classic input with normalized appearance
   */
  let isClicked = false;
  Vue.component('bbn-pager', {
    mixins: [bbn.vue.basicComponent],
    props: {
      element: {
        type: Vue,
        default: false
      }
    },
    /**
     * @event mounted
     */
    mounted(){
    },
  });

})(window.Vue, window.bbn);
