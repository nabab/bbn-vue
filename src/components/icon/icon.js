/**
 * @file bbn-icon component
 *
 * @description 
 *
 * @copyright BBN Solutions
 *
 * @author Mirko Argentino
 */
(function() {
  "use strict";
  Vue.component('bbn-icon', {
    name: 'bbn-icon',
    /**
     * @mixin bbn.vue.basicComponent
     */
    mixins: [bbn.vue.basicComponent],
    data(){
      return {
        content: '',
        isLoading: true,
        isNotFound: false
      }
    }
  })
})();
