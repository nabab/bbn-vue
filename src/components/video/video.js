/**
 * Created by BBN Solutions.
 * User: Mirko Argentino
 * Date: 24/05/2017
 * Time: 15:45
 */

((videojs) => {
  "use strict";

  /**
   * Classic input with normalized appearance
   */
  Vue.component('bbn-video', {
    mixins: [bbn.vue.basicComponent],
    props: {
      source: {},
      type: {
        type: String,
        default: 'line'
      },
      /**
       * String => the same title to axixs X and Y.
       * Object => {x: 'titlex', y: 'titley'}
       */
			title: {
        type: String,
        default: ''
      },
      titleX: {
			  type: String,
        default: undefined
      },
      titleY: {
			  type: String,
        default: undefined
      },
      width: {
        type: String,
        default: '100%'
      },
      height: {
        type: String,
        default: '100%'
      },
      cfg: {
        type: Object,
        default(){
          return {};
        }
      }
    },
    computed: {
    },
    methods: {
    },
    watch: {
      source(val){
        this.init();
      },
    },
    mounted(){
      videojs(this.$el);
    }
  });
})(videojs);