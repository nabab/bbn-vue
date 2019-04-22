/**
 * Created by BBN on 10/02/2017.
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
    mounted: function(){
      if ( this.$options.propsData.script ){
        //$(this.$el).data("script", this.$options.propsData.script);
      }
      this.ready = true;
    }
  });

})(bbn);