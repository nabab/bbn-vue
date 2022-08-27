/**
 * @file bbn-router component
 * @description bbn-router is a component that allows and manages the navigation (url) between the various containers of an application
 * @copyright BBN Solutions
 * @author BBN Solutions
 */
((bbn, Vue) => {

  "use strict";

  const cpDef = {
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
  };

  if (Vue.component) {
    Vue.component("bbn-router-group", cpDef);
  }

  return cpDef;

})(window.bbn, window.Vue);
