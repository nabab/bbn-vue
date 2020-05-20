<template>
<bbn-context :tag="tag"
            :class="componentClass"
            tabindex="-1"
            :source="items"
            @click.prevent.stop="clickItem"
            @contextmenu.prevent.stop="clickItem"
            @keydown.space.enter.prevent="clickItem"
            @mousedown.prevent.stop="() => {return false}"
>
  <slot></slot>
</bbn-context>
</template>
<script>
  module.exports = /**
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
  Vue.component('bbn-tooltip', {
    /**
     * @mixin bbn.vue.basicComponent
     */
    mixins: [bbn.vue.basicComponent],
    props: {
      /**
       * The source of the component tooltip.
       * @prop {Function|Array} source
       */
      source: {
        type: [Function, Array],
        default(){
          return []
        }
      },
      /**
       * The source's option
       * @prop {} [null] sourceOption
       */
      sourceOption: {
        default: null
      },
      /**
       * The html tag.
       * @prop {String} ['span'] tag
       */
      tag: {
        type: String,
        default: 'span'
      },
      /**
       * True if the tooltip component has a context menu.
       * @prop {Boolean} [false] context
       */
      context: {
        type: Boolean,
        default: false
      },
      /**
       * The mode of the component.
       * @prop {String} ['free'] mode
       */
      mode: {
        type: String,
        default: 'free'
      }
    },
    data(){
      return {
        /**
         * The items.
         * @data {Array} items
         */
        items: this.getItems()
      };
    },
    methods: {
      /**
       * Returns the items of the component from the source.
       * @method getItems
       * @returns {Array}
       */
      getItems(){
        return (bbn.fn.isFunction(this.source) ? this.source(this.sourceOption) : this.source) || [];
      },
      /**
       * The behavior of the component at the click.
       * @param {Event} e 
       * @fires getItems
       */
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
      /**
       * @watch source
       */
      source: {
        deep: true,
        handler(){
          this.items = this.getItems()
        }
      },
      /**
       * @watch sourceOption
       */
      sourceOption(){
        this.items = this.getItems()
      }
    }
  });

})(bbn);

</script>
<style scoped>
.bbn-tooltip {
  cursor: pointer;
}

</style>
