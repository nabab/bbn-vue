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
script.setAttribute('type', 'text/x-template');document.body.insertAdjacentElement('beforeend', script);

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
    /**
     * @mixin bbn.vue.basicComponent
     * @mixin bbn.vue.localStorageComponent
     */
    mixins: 
    [
      bbn.vue.basicComponent,
      bbn.vue.localStorageComponent,
    ],
    props: {
      /**
       * The URL on which the router will be initialized.
       * @prop {String} ['!'] url
       */
      separator: {
        type: String,
        default: '!'
      },
      /**
       * The URL on which the router will be initialized.
       * @prop {String} [''] url
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

})(bbn);