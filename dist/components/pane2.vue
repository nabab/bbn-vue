<template>
<div :class="[componentClass, 'bbn-background', 'bbn-border-box']">
  <div :class="['bbn-overlay', $parent.currentOrientation === 'vertical' ? 'bbn-flex-height' : 'bbn-flex-width']">
    <div v-if="title"
         class="bbn-b bbn-c bbn-header"
         v-html="title"
    ></div>
    <div class="bbn-flex-fill">
      <div class="bbn-overlay">
        <bbn-scroll v-if="scrollable" v-show="!isCollapsed">
          <slot></slot>
        </bbn-scroll>
        <div v-else
             v-show="!isCollapsed"
             class="bbn-overlay"
             :style="{overflow: overflow}"
        >
          <slot></slot>
        </div>
      </div>
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
  Vue.component('bbn-pane2', {
    mixins: [bbn.vue.basicComponent, bbn.vue.resizerComponent],
    props: {
      overflow: {
        type: String,
        default: 'hidden'
      },
      title: {
        type: String
      },
      size: {
        type: [String, Number],
        default: ''
      },
      resizable: {
        type: Boolean,
        default: undefined
      },
      collapsible: {
        type: Boolean,
        default: undefined
      },
      collapsed: {
        type: Boolean,
        default: false
      },
      scrollable: {
        type: Boolean,
        default: false
      },
      min: {
        type: Number,
        default: 20
      },
      max: {
        type: Number,
        default: 10000
      }
    },
    data(){
      return {
        checker: false,
        isCollapsed: this.collapsed,
        isResizable: this.resizable,
        realSize: 0,
        originalSize: this.size || 'auto'
      };
    },
    computed: {
      splitter(){
        return this.$parent.$vnode.componentOptions.tag === 'bbn-splitter2' ? this.$parent : false;
      }
    },
    methods: {
      getRealSize(){
        let rect = this.$el.getBoundingClientRect();
        return this.splitter ? (this.splitter.isVertical ? rect.height : rect.width) : (rect.height > rect.width ? rect.height : rect.width);
      },
      getSize(){
        return parseInt(this.realSize) + 'px';
      },
      setSize(size){
        if ( this.splitter ){
          this.splitter.setSize(size, this);
        }
      },
      hide(){
        this.isCollapsed = true;
      },
      show(){
        this.isCollapsed = false;
      },
      toggleCollapsed(){
        this.isCollapsed = !this.isCollapsed;
      }
    },
    mounted(){
      if ( bbn.fn.isFunction(this.$parent.init) ){
        if ( this.resizable === undefined ){
          this.isResizable = this.$parent.resizable;
        }
        this.selfEmit(true);
        this.$parent.init();
        setTimeout(() => {
          this.ready = true;
        }, 40)
      }
      this.$nextTick(() => {
        this.realSize = this.getRealSize();
        if ( this.splitter ){
          this.$watch('splitter.formattedCfg', () => {
            this.realSize = this.getRealSize();
          })
        }
      })
    },
    watch:{
      collapsed(val){
        this.currentHidden = val;
        this.isCollapsed = val;
      }
    }
  });

})(bbn);

</script>
