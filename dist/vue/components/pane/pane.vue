<template>
<div :class="[componentClass, 'bbn-background']">
  <div :class="{
    'bbn-overlay': $parent.fullSize && !isCollapsed,
    'bbn-w-100': ((isCollapsed && title) || !$parent.fullSize) && (($parent.panes.length === 1) || !isHorizontal),
    'bbn-h-100': ((isCollapsed && title) || !$parent.fullSize) && ($parent.panes.length > 1) && isHorizontal,
    'bbn-flex-height': $parent.fullSize && title && !isHorizontal && !isCollapsed,
    'bbn-flex-width': $parent.fullSize && title && isHorizontal && !isCollapsed
  }">
    <div v-if="title"
         :class="['bbn-light bbn-c bbn-header bbn-block bbn-pane-title bbn-m bbn-spadding', {
           'bbn-w-100': !isHorizontal,
           'bbn-h-100': isHorizontal
         }]"
         :style="{
           writingMode: isHorizontal ? 'vertical-rl' : null,
           textOrientation: isHorizontal ? 'upright' : null,
         }"
         v-html="title"/>
    <div :class="{
      'bbn-hidden': isCollapsed,
      'bbn-overlay': $parent.fullSize && !title && !isCollapsed,
      'bbn-flex-fill': $parent.fullSize && title && !isCollapsed,
      'bbn-w-100': !$parent.fullSize && (($parent.panes.length === 1) || !isHorizontal),
      'bbn-h-100': !$parent.fullSize && ($parent.panes.length > 1) && isHorizontal,
    }"
         v-show="!isCollapsed">
      <component :is="scrollable ? 'bbn-scroll' : 'div'"
                 :class="{'bbn-overlay': $parent.fullSize, 'bbn-w-100': !scrollable && $parent.fullSize}"
                 ref="scroll">
        <slot></slot>
      </component>
    </div>
  </div>
</div>
</template>
<script>
  module.exports = /**
 * @file the bbn-pane component
 *
 * @description the bbn-pane is a component created to be operated by "bbn-splitter".
 * It represents the portion of the single area of ​​the splitter that will contain what the user desires.
 *
 * @author BBN Solutions
 *
 * @copyright BBN Solutions
 *
 * @created 15/02/2017
 */

(function(bbn){
  "use strict";

  /**
   * Classic input with normalized appearance
   */
  Vue.component('bbn-pane', {
    /**
     * @mixin bbn.vue.basicComponent
     * @mixin bbn.vue.resizerComponent
     */
    mixins: 
    [
      bbn.vue.basicComponent, 
      bbn.vue.resizerComponent
    ],
    props: {
      /**
       * @prop {String} ['hidden'] overflow
       */
      overflow: {
        type: String,
        default: 'hidden'
      },
      /**
       * @prop {String} title
       */
      title: {
        type: String
      },
      /**
       * @prop {(String|Number)} [''] size
       */
      size: {
        type: [String, Number],
        default: ''
      },
      /**
       * @prop {Boolean} resizable
       */
      resizable: {
        type: Boolean
      },
      /**
       * @prop {Boolean} collapsible
       */
      collapsible: {
        type: Boolean
      },
      /**
       * @prop {Boolean} [false] collapsed
       */
      collapsed: {
        type: Boolean,
        default: false
      },
      /**
       * @prop {Boolean} [false] scrollable
       */
      scrollable: {
        type: Boolean,
        default: false
      },
      /**
       * @prop {Number} [20] min
       */
      min: {
        type: Number,
        default: 20
      },
      /**
       * @prop {Number} [10000] min
       */
      max: {
        type: Number,
        default: 10000
      }
    },
    data() {
      return {
        /**
         * The current collapsed state.
         * @data {Boolean} isCollapsed
         */
        isCollapsed: this.collapsed,
        /**
         * The current resizable state.
         * @data {Boolean} isResizable
         */
        isResizable: this.resizable,
        /**
         * The splitter to which the pane belongs.
         * @data {Vue} splitter
         */
        splitter: null
      };
    },
    computed: {
      isHorizontal() {
        return this.splitter && this.splitter.isHorizontal;
      }
    },
    watch:{
      collapsed(val){
        this.currentHidden = val;
        this.isCollapsed = val;
      }
    },
    created(){
      this.componentClass.push('bbn-resize-emitter');
    },
    mounted(){
      if (bbn.fn.isFunction(this.$parent.init) ){
        if (this.resizable === undefined) {
          this.isResizable = this.$parent.resizable;
        }

        this.selfEmit(true);
        this.splitter = this.closest('bbn-splitter');
        this.splitter.init();
        setTimeout(() => {
          this.ready = true;
        }, 40)
      }
    },
  });

})(bbn);

</script>
<style scoped>
.bbn-pane {
  box-sizing: border-box !important;
  position: relative;
}

</style>
