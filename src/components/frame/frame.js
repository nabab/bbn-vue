/**
 * @file bbn-browser component
 *
 * @description 
 *
 * @copyright BBN Solutions
 *
 * @author BBN Solutions
 */
(function(bbn){
  "use strict";

  Vue.component('bbn-frame', {
    /**
     * @mixin bbn.vue.basicComponent
     */
    mixins: [bbn.vue.basicComponent],
    props: {
      sandbox: {
        type: String,
        default: ''
      },
      url: {
        type: String
      }
    },
    data(){
      return {
        window: null
      }
    },
    computed: {
    },
    methods: {
      load(e){
        this.$emit('load', e)
      }
    },
  });

})(bbn);
