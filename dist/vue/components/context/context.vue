<template>
<component :is="tag"
           :class="componentClass"
           tabindex="-1"
           @click="clickItem"
           @contextmenu="clickItem"
           @keydown.space.enter="clickItem"
           @mousedown.prevent.stop="() => {return false}"
           @touchstart="touchstart"
           @touchmove="touchmove"
           @touchend="touchend"
>
  <slot></slot>
  <bbn-floater :element="attach || $el"
               :source="filteredData"
               :class="'bbn-floater-context-' + bbnUid"
               ref="floater"
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
               v-if="showFloater && !disabled"
               @close="$emit('close'); showFloater = false;"
               @open="$emit('open')"
               :item-component="itemComponent"
               :position="position"/>
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
     * @mixin bbn.vue.eventsComponent
     */
    mixins: [
      bbn.vue.basicComponent,
      bbn.vue.listComponent,
      bbn.vue.dimensionsComponent,
      bbn.vue.eventsComponent
    ],
    props: {
      disabled: {
        type: Boolean,
        default: false
      },
      /**
       * Will force the position.
       * @prop {String} position
       */
      position: {
        type: String,
        default: ''
      },
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
      },
      /**
       * The HTMLElement to bind to.
       * @props {HTMLElement} attach
       */
      attach: {
        type: HTMLElement
      }
    },
    data(){
      return {
        /**
         * True if the floating element of the menu is opened.
         * @data {Boolean} [false] showFloater
         */
        showFloater: false,
        docEvent: false,

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
          !this.disabled
          && (
            (e.type === 'keydown') ||
            ((e.type === 'contextmenu') && this.context) ||
            ((e.type === 'click') && !this.context)
          )
        ){
          if (e.preventDefault) {
            e.preventDefault();
            e.stopPropagation();
          }
          // Don't execute if in the floater
          if (!e.target.closest('.bbn-floater-context-' + this.bbnUid)) {
            this.toggle();
          }
        }
      },
      clickOut(e){
        if (!e.target.closest('.bbn-floater-context-' + this.bbnUid)) {
          this.showFloater = false;
        }
      },
      toggle(){
        if (!this.showFloater) {
          this.updateData().then(() => {
            this.showFloater = !this.showFloater;
          })
        }
        else {
          this.showFloater = !this.showFloater;
        }
      }
    },
    beforeDestroy() {
      if (this.docEvent) {
        document.removeEventListener('click', this.clickout)
      }
    },
    watch: {
      showFloater(v){
        if (v) {
          document.addEventListener('click', this.clickOut)
          this.docEvent = true;
        }
        else {
          document.removeEventListener('click', this.clickout)
          this.docEvent = false;
        }
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
