/**
 * Created by BBN on 10/02/2017.
 */
(function($, bbn, kendo){
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
      $(this.$children).each(function(){

      })
      if ( this.$options.propsData.script ){
        $(this.$el).data("script", this.$options.propsData.script);
      }
      this.$emit("ready", this.value);
    }
  });

})(jQuery, bbn, kendo);