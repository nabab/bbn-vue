/**
 * Created by BBN on 10/02/2017.
 */
(function(bbn){
  "use strict";

  Vue.component('bbn-tree-input', {
    mixins: [bbn.vue.basicComponent, bbn.vue.inputComponent, bbn.vue.eventsComponent],
    props: {
      extensions:{
        type: Array,
        // default: ["dnd"]
      },
      autoExpandMS:{
        type: Number
      },
      source: {
        type: [String, Array, Object]
      },
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
  });

})(bbn);
