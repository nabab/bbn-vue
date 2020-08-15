(bbn_resolve) => { ((bbn) => {
let script = document.createElement('script');
script.innerHTML = `<div :class="[componentClass]">
</div>`;
script.setAttribute('id', 'bbn-tpl-component-prose');
script.setAttribute('type', 'text/x-template');
document.body.insertAdjacentElement('beforeend', script);
/**
 * @file bbn-panelbar component
 *
 * @description bbn-panelbar it's a component that configures itself easily, it allows to visualize the data in a hierarchical way expandable to levels.
 * It can contain texts, html elements and even Vue components, the latter can be inserted both on its content but also as a header.
 * Those who use this component have the possibility to see schematically their data with the maximum simplicity of interpretation.
 *
 * @copyright BBN Solutions
 *
 * @author Loredana Bruno
 */

(function(bbn){
  "use strict";

  Vue.component('bbn-prose', {
    /**
     * @mixin bbn.vue.basicComponent
     * @mixin bbn.vue.localStorageComponent
     */
    mixins: [bbn.vue.basicComponent],

    props: {
    },
    data(){
      return {
        /**
         * The index of the selected item
         * @data {Number} [null] selected
         */
      };
    },
     /**
      * Select the index of item defined by the prop opened
      * @event mounted
      */
    mounted(){
    },
    methods: {

    },
  });

})(bbn);

if (bbn_resolve) {bbn_resolve("ok");}
})(bbn); }