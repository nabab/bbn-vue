<template>
<component :is="tag"
           :class="componentClass"
           tabindex="-1"
           @click.prevent="clickItem"
           @contextmenu.prevent.stop="clickItem"
           @keydown.space.enter.prevent.stop="clickItem"
           @mousedown.prevent.stop="() => {return false}"
>
  <slot></slot>
  <bbn-floater :element="$el"
               :source="filteredData"
               :width="width"
               :height="height"
               :minWidth="minWidth"
               :minHeight="minHeight"
               :maxWidth="maxWidth"
               :maxHeight="maxHeight"
               children="items"
               :content="content"
               :auto-hide="true"
               :mode="mode"
               v-if="showFloater"
               @close="showFloater = false"
               :item-component="itemComponent"
  ></bbn-floater>
</component>
</template>
<script>
  module.exports = /**
 * @file bbn-context component
 *
 * @description bbn-context is a menu that can be activated with a right click.
 * The source of the menu can have a tree structure.
 *
 * @copyright BBN Solutions
 *
 * @created 15/02/2017.
 */

((bbn) => {
  "use strict";

  /**
   * Classic input with normalized appearance.
   */
  Vue.component('bbn-context', {
    /**
     * @mixin bbn.vue.basicComponent
     * @mixin bbn.vue.listComponent
     * @mixin bbn.vue.dimensionsComponent
     */
    mixins: [
      bbn.vue.basicComponent,
      bbn.vue.listComponent,
      bbn.vue.dimensionsComponent
    ],
    props: {
      /**
       * The html tag used to render the property content.
       * @prop {String} ['span'] tag
       */
      tag: {
        type: String,
        default: 'span'
      },
      /**
       * Set to true to show the floating element containing the menu.
       * @prop {Boolean} [false] context
       * ì
       */
      context: {
        type: Boolean,
        default: false
      },
      /**
       * The content of the context menu.
       * @prop {String} content
       */
      content: {
        type: String
      },
      /**
       * Selection mode.
       * @prop {String} ['free'] mode
       */
      mode: {
        type: String,
        default: 'free'
      },
      /**
       *
       * @prop {String} ['items'] children
       */
      children: {
        type: String,
        default: 'items'
      },
      /**
       * The component used by list's items.
       * @prop {Object|String} itemComponent
       */
      itemComponent: {
        type: [Object, String]
      }
    },
    data(){
      return {
        /**
         * True if the floating element of the menu is opened.
         * @data {Boolean} [false] showFloater
         */
        showFloater: false
      };
    },
    methods: {
      /**
       * Based on the type of event and on the property context, shows or hides the floating element of the menu.
       * @method clickItem
       * @param {Event} e ì
       * @fires updateData
       */
      clickItem(e){
        if (
          (e.type === 'keydown') ||
          ((e.type === 'contextmenu') && this.context) ||
          ((e.type === 'click') && !this.context)
        ){
          if ( this.showFloater ){
            this.showFloater = !this.showFloater;
          }
          else{
            this.$once('dataloaded', () => {
              this.showFloater = !this.showFloater;
            });
            this.updateData();
          }
        }
      },
    },
    watch: {
     /**
      * @watch showFloater
      * @fires init
      * @emits open
      * @emits close
      */
      showFloater(newVal){
        this.$emit(newVal ? 'open' : 'close');
      }
    }
  });

})(bbn);

</script>
<style scoped>
.bbn-context {
  cursor: pointer;
}

</style>
