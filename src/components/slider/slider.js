/**
 * @file bbn-slider component
 *
 * @description 
 *
 * @copyright BBN Solutions
 *
 * @author Vito Fava
 */
(function(bbn){
  "use strict";

  Vue.component('bbn-slider', {
    mixins: [bbn.vue.basicComponent],
    props: {
      orientation: {},
      disabled: {},
      script: {},
      action: {
        type: String,
        default: '.'
      },
      method: {
        type: String,
        default: 'post'
      },
      cfg: {
        type: Object,
        default: function(){
          return {
            orientation: 'horizontal',
          };
        }
      }
    },
    mounted(){
      this.ready = true;
    }
  });

})(bbn);
