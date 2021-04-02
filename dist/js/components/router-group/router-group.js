(bbn_resolve) => {
((bbn) => {
let script = document.createElement('script');
script.innerHTML = `<div :class="[componentClass, {
       'bbn-invisible': !ready,
       'bbn-overlay': true
     }]">
  <bbn-splitter :orientation="orientation" :resizable="true">
    <bbn-pane v-for="router in routers">
      <bbn-router v-bind="router"></bbn-router>
    </bbn-pane>
  </bbn-splitter>
</div>`;
script.setAttribute('id', 'bbn-tpl-component-router-group');
script.setAttribute('type', 'text/x-template');
document.body.insertAdjacentElement('beforeend', script);
let css = document.createElement('link');
css.setAttribute('rel', "stylesheet");
css.setAttribute('href', bbn.vue.libURL + "dist/js/components/router-group/router-group.css");
document.head.insertAdjacentElement('beforeend', css);
/**
 * @file bbn-router component
 * @description bbn-router is a component that allows and manages the navigation (url) between the various containers of an application
 * @copyright BBN Solutions
 * @author BBN Solutions
 */
(function(bbn, Vue){
  "use strict";

  Vue.component("bbn-router-group", {
    name: 'bbn-router-group',
    mixins: [
      /**
       * @mixin bbn.vue.basicComponent
       * @mixin bbn.vue.localStorageComponent
       */
      bbn.vue.basicComponent,
      bbn.vue.localStorageComponent,
    ],
    props: {
      /**
       * The URL on which the router will be initialized.
       * @prop {String} ['] url
       */
      separator: {
        type: String,
        default: '!'
      },
      /**
       * The URL on which the router will be initialized.
       * @prop {String} ['] url
       */
      url: {
        type: String,
        default: ''
      },
    },
    data(){
      return {
      };
    },
    computed: {
    },

    methods: {
    },

    /**
     * @event created
     */
    created(){
    },
    /**
     * @event mounted
     * @fires getStorage
     * @fires getDefaultURL
     * @fires add
     */
    mounted(){
    },
    /**
     * @event beforeDestroy
     */
    beforeDestroy(){
    },
    watch: {
    }
  });

})(bbn, Vue);
if (bbn_resolve) {bbn_resolve("ok");}
})(bbn);
}