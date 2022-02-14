<template>
<div
  :class="componentClass"
>
<slot>
</slot>
  <span class="bbn-abs" @click="visible=true" @mouseenter="visible=true" ref="helper">
    <i class="bbn-m nf nf-fa-info_circle"></i>
  </span>
  <bbn-floater
              v-if="visible" 
              :class="position"
              :tag="tag"
              ref="floater"
              tabindex="-1"
              :position="position"
              :content="content"
              @click="action('click', $event)"
              @contextmenu="action('context', $event)"
              @keydown="action('keydown', $event)"
              @mousedown="action('mousedown', $event)"
              @mouseover="action('mouseover', $event)"
              @close="visible=false"
              :component="component"
              :element="$refs.helper"
              :arrow="true"
              :distance="distance"
              :auto-hide="true"
  >
  </bbn-floater>
</div>
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
  const tpl = `
  <div style="display: flex;" class="bbn-padded bbn-vmargin">
    <div>
      <i class="bbn-xl ---BBN-ICON---"></i>
    </div>
    <div style="display: flex; align-items: center; margin-left: 5px;">
    ---BBN-CONTENT---
    </div>
  </div>`;
  Vue.component('bbn-tooltip', {
    /**
     * @mixin bbn.vue.basicComponent
     */
    mixins: [bbn.vue.basicComponent],
    props: {
      /**
       * @prop {(String|Object)} component
       */
      component: {
        type: [String, Object]
      },
      /**
       * The source of the component tooltip.
       * @prop {Function|Array} source
       */
      source: {
        type: [Function, String],
        default: ""
      },
      /**
       * @prop {String} template
       */
      template: {
        type: String
      },
      /**
       * @prop {String} ['bbn-m nf nf-mdi-information_outline'] icon
       */
      icon: {
        type: String,
        default: "bbn-m nf nf-mdi-information_outline"
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
      },
      /**
       * If an element is given this will force the position.
       * @prop {String} position
       */
      position: {
        type: String,
        validator: p => ['', 'topLeft', 'topRight', 'bottomLeft', 'bottomRight', 'top', 'bottom', 'left', 'right'].includes(p),
        default: 'bottom'
      },
      /**
        * Tooltip offset from the icon
        * @prop {Number} ['0'] pixel
      */
      distance: {
        type: Number,
        default: 0
      },
    },
    data(){
      return {
        /**
         * The items.
         * @data {Array} items
         */
        content: this.getContent(),
        visible: false,
      };
    },
    methods: {
      /**
       * Returns the items of the component from the source.
       * @method getItems
       * @returns {Array}
       */
      getContent() {
        let st = bbn.fn.isFunction(this.source) ? this.source() : this.source;
        let st2 = this.template || tpl;
        return st2.replace('---BBN-ICON---', this.icon).replace('---BBN-CONTENT---', st);
      },
      action(type, ev) {

      }
    },

  });

})(bbn);

</script>
<style scoped>
.bbn-tooltip {
  cursor: pointer;
}
.bbn-tooltip .bbn-abs i {
  margin-left: 3px;
  margin-top: -1px;
}

</style>
