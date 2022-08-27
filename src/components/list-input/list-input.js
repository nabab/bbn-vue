/**
 * @file bbn-list component
 *
 * @description A fully customizable selectable list.
 *
 * @author BBN Solutions
 *
 * @copyright BBN Solutions
 */
(function(bbn, Vue){
  "use strict";
  /**
   * Classic input with normalized appearance
   */
  const cpDef = {
    /**
     * @mixin bbn.vue.basicComponent
     * @mixin bbn.vue.listComponent
     * @mixin bbn.vue.keynavComponent
     * @mixin bbn.vue.inputComponent
     */
    mixins: 
    [
      bbn.vue.basicComponent, 
      bbn.vue.listComponent, 
      bbn.vue.keynavComponent, 
      bbn.vue.inputComponent
    ],
    props: {
      //@todo not used.
      unique: {
        type: Boolean,
        default: true
      },
      /**
       * The mode of the component.
       * @prop {String} ['free'] mode
       */
      mode: {
        type: String,
        default: "free"
      },
      /**
       * @prop {Boolean} [false] suggest
       */
      suggest: {
        type: Boolean,
        default: false
      }
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
     * @event mounted
     */
    mounted(){
    }
  };

  if (Vue.component) {
    Vue.component('bbn-list-input', cpDef);
  }

  return cpDef;

})(window.bbn, window.Vue);
