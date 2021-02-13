(bbn_resolve) => { ((bbn) => {
let script = document.createElement('script');
script.innerHTML = `<div :class="[componentClass]">
</div>
`;
script.setAttribute('id', 'bbn-tpl-component-map');
script.setAttribute('type', 'text/x-template');
document.body.insertAdjacentElement('beforeend', script);
/**
 * @file bbn-code component
 *
 * @description bbn-code is a text editor.
 * It specializes in editing the code of a supported language. 
 * Various tools are provided to the users, which can be configured to their liking.
 *
 * @author BBN Solutions
 *
 * @copyright BBN Solutions
 */


((bbn) => {
  "use strict";

  Vue.component('bbn-map', {
    /**
     * @mixin bbn.vue.basicComponent
     */
    mixins: [bbn.vue.basicComponent],
    props: {
    },

    data(){
      return {
        /**
         * @todo not used
         */
        widget: null,
        /**
         * True if the editor is fullscreen.
         * @data {Boolan} [false] isFullScreen
         */
        isVisible: false
      };
    },

    computed: {
    },

    methods: {
    },
    /**
     * @event mounted
     * @fires initTern
     * @fires getRef
     * @emit  input
     */
    mounted(){
    },

    watch: {
    }
  });

})(bbn);
if (bbn_resolve) {bbn_resolve("ok");}
})(bbn); }