/**
 * @file bbn-combo component
 * @description The easy-to-implement bbn-combo component allows you to choose a single value from a user-supplied list or to write new.
 * @copyright BBN Solutions
 * @author BBN Solutions
 * @created 10/02/2017.
 */
(function(bbn){
  "use strict";

  Vue.component('bbn-block-list', {
    /**
     * @mixin bbn.vue.basicComponent
     * @mixin bbn.vue.listComponent
     * @mixin bbn.vue.componentInsideComponent
     */
    mixins: [
      bbn.vue.basicComponent,
      bbn.vue.listComponent,
      bbn.vue.componentInsideComponent
    ],
    mounted(){
      this.ready = true;
    }
  });

})(bbn);
