/**
 * @file bbn-tree-oinput component
 *
 * @copyright BBN Solutions
 *
 * @author BBN Solutions
 * 
 * @created 15/02/2017
 */
((bbn, Vue) => {

  "use strict";

  const cpDef = {
    /**
     * @mixin bbn.vue.basicComponent
     * @mixin bbn.vue.inputComponent
     * @mixin bbn.vue.eventsComponent
     */
    mixins: 
    [
      bbn.vue.basicComponent, 
      bbn.vue.inputComponent, 
      bbn.vue.eventsComponent
    ],
    props: {
      /**
       * @prop {Array} extensions
       */
      extensions:{
        type: Array,
        // default: ["dnd"]
      },
      /**
       * @prop {Number} autoExpandMS
       */
      autoExpandMS:{
        type: Number
      },
      /**
       * @prop {(String|Array|Object)} source
       */
      source: {
        type: [String, Array, Object]
      },
      /**
       * @prop {Object} [extensions: ['dnd'], autoExpandedMS: 400, source: [], disabled: false] cfg
       */
      cfg: {
        type: Object,
        default(){
          return {
            extensions: ["dnd"],
            auoExpandedMS: 400,
            source: [],
            disabled: false
          };
        }
      }
    },
    data(){
      return {
        widgetName: "fancytree",
        ivalue: this.currentSelection ? this.currentSelection : ''
      };
    },
    methods: {
    },
    mounted(){
      this.ready = true;
    }
  };

  if (Vue.component) {
    Vue.component('bbn-tree-input', cpDef);
  }

  return cpDef;

})(window.bbn, window.Vue);
