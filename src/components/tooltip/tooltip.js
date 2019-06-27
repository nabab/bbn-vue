/**
 * @file bbn-tooltip component
 *
 * @description the bbn-tooltip represents a display of information that is related to an element and which is displayed when is focused or clicked.
 *
 * @copyright BBN Solutions
 *
 * @author BBN Solutions
 */

(function(bbn){
  "use strict";

  /**
   * Classic input with normalized appearance
   */
  Vue.component('bbn-tooltip', {
    mixins: [bbn.vue.basicComponent],
    props: {
      source: {
        type: [Function, Array],
        default(){
          return []
        }
      },
      sourceOption: {
        default: null
      },
      tag: {
        type: String,
        default: 'span'
      },
      context: {
        type: Boolean,
        default: false
      },
      mode: {
        type: String,
        default: 'free'
      }
    },
    data(){
      return {
        items: this.getItems()
      };
    },
    methods: {
      getItems(){
        return (bbn.fn.isFunction(this.source) ? this.source(this.sourceOption) : this.source) || [];
      },
      clickItem(e){
        if (
          (e.type === 'keydown') ||
          ((e.type === 'contextmenu') && this.context) ||
          ((e.type === 'click') && !this.context)
        ){
          this.items = this.getItems();
        }
      },
    },
    watch: {
      source: {
        deep: true,
        handler(){
          this.items = this.getItems()
        }
      },
      sourceOption(){
        this.items = this.getItems()
      }
    }
  });

})(bbn);
