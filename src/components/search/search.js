/**
 * Created by BBN on 10/02/2017.
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
