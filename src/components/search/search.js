/**
 * @file bbn-search component
 *
 * @description this component is used to allow a search, filtering the tree-structured data
 *
 * @copyright BBN Solutions
 *
 * @author BBN Solutions
 *
 * @created 10/02/2017
 */
(function(bbn){
  "use strict";

  Vue.component('bbn-search', {
    mixins: [bbn.vue.basicComponent, bbn.vue.fullComponent],
    props: {
      action: {},
      icon: {
        type: String
      },
      cfg:{
        type: Object,
        default: function(){
          return {
            placeholder: bbn._("Filter tree"),
            icon: "nf nf-fa-search"
          }
        }
      },
    },
    methods: {
      clear: function(){
        this.update('');
      }
    },
    data: function(){
      return bbn.vue.treatData(this);
    },
  });

})(bbn);
