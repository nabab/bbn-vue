(bbn_resolve) => {
((bbn) => {

let script = document.createElement('script');
script.innerHTML = `<div :class="[componentClass, 'bbn-background']">
  <div :class="['bbn-overlay', $parent.currentOrientation === 'vertical' ? 'bbn-flex-height' : 'bbn-flex-width']">
    <div v-if="title" class="bbn-b bbn-c bbn-header" v-html="title"></div>
    <div class="bbn-flex-fill">
      <div class="bbn-overlay">
        <bbn-scroll v-if="scrollable"
                    v-show="!isCollapsed"
                    ref="scroll">
          <slot></slot>
        </bbn-scroll>
        <div v-else v-show="!isCollapsed"
            class="bbn-overlay"
            :style="{overflow: overflow}">
          <slot></slot>
        </div>
      </div>
    </div>
  </div>
</div>`;
script.setAttribute('id', 'bbn-tpl-component-pane');
script.setAttribute('type', 'text/x-template');document.body.insertAdjacentElement('beforeend', script);


let css = document.createElement('link');
css.setAttribute('rel', 'stylesheet');
css.setAttribute('href', bbn.vue.libURL + 'dist/js/components/pane/pane.css');
document.head.insertAdjacentElement('beforeend', css);

/**
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
    data(){
      return {
        checker: false,
        isCollapsed: this.collapsed,
        isResizable: this.resizable
      };
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
        this.$parent.init();
        setTimeout(() => {
          this.ready = true;
        }, 40)
      }
    },
  });

})(bbn);

if (bbn_resolve) {bbn_resolve("ok");}
})(bbn);
}