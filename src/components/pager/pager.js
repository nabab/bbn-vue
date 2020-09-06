/**
 * @file bbn-pager component
 * @description bbn-pager is a component to manage the pagination of a pageable component.
 * @author BBN Solutions
 * @copyright BBN Solutions
 */
((bbn) =>{
  "use strict";

  Vue.component('bbn-pager', {
    /**
     * @mixin bbn.vue.basicComponent
     */
    mixins: [bbn.vue.basicComponent],
    props: {
      /**
       * The element to bond with
       * @props {Vue} element
       */
      element: {
        type: Vue,
        required: true
      }
    }
  });

})(bbn);
