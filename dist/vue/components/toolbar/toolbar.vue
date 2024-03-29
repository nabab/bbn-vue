<template>
<div :class="['bbn-header', 'bbn-unselectable', componentClass, {
        'bbn-w-100 bbn-vmiddle': (orientation === 'horizontal'),
        'bbn-h-100': (orientation === 'vertical')
      }]"
     :style="style">
  <fieldset :class="['bbn-toolbar-fieldset', 'bbn-no-border', 'bbn-no-radius', 'bbn-no-margin', 'bbn-no-padding', {
              'bbn-w-100': (orientation === 'horizontal'),
              'bbn-h-100': (orientation === 'vertical'),
              'bbn-flex-width': (orientation === 'horizontal'),
              'bbn-flex-height': (orientation === 'vertical'),
              'bbn-vmiddle': (orientation === 'horizontal')
            }]"
            :disabled="disabled">
    <slot v-if="slotBefore"></slot>
    <div class="bbn-flex-fill bbn-toolbar-flex">
      <template v-for="(s, i) in source">
        <component v-if="!s.end && s.component"
                  :is="s.component"
                  v-bind="s.options"
                  :key="'item' + i"/>
        <div v-else-if="!s.end && (s.content !== undefined)"
            class="bbn-block bbn-spadded"
            v-html="s.content"
            :key="'item' + i"
            :ref="'item' + i"/>
        <bbn-button v-else-if="!s.end && ((s.url || s.action || s.items) && (s.text || s.icon))"
                    v-bind="s"
                    :class="{
                      'bbn-hxsmargin': buttonSpace
                    }"
                    @click.prevent="clickButton(s)"
                    :key="'item' + i"
                    :ref="'item' + i"/>
        <div v-else-if="!s.end"
            class="bbn-toolbar-separator"
            :key="'item' + i"/>
        <bbn-floater v-if="s.items && $refs['item' + i]"
                    :source="items"
                    :element="'item' + i"/>
      </template>
    </div>
    <div class="bbn-block bbn-nowrap">
      <template v-for="(s, i) in source">
        <component v-if="s.end && s.component"
                  :is="s.component"
                  v-bind="s.options"
                  :key="'item' + i"/>
        <div v-else-if="s.end && (s.content !== undefined)"
            class="bbn-block bbn-spadded"
            v-html="s.content"
            :key="'item' + i"/>
        <bbn-button v-else-if="s.end && ((s.url || s.action) && (s.text || s.icon))"
                    :class="{
                      'bbn-hxsmargin': true
                    }"
                    v-bind="s"
                    :key="'item' + i"/>
        <div v-else-if="s.end"
            class="bbn-toolbar-separator"
            :key="'item' + i"
        >|</div>
        <bbn-floater v-if="s.items && $refs['item' + i]"
                    :source="items"
                    :element="'item' + i"/>
      </template>
    </div>
    <slot v-if="!slotBefore"></slot>
    <slot name="right"></slot>
  </fieldset>
</div>

</template>
<script>
  module.exports = /**
 * @file bbn-toolbar component
 * @description bbn-toolbar is an horizontal or vertical layout containing elements or components performing actions defined by the user.
 * Very useful for applications, simplifying navigation. Bbn-toolbar is responsive to its container.
 * A separator beetwen elements can be created by giving to empty div inside the toolbar the class 'toolbar-horizontal-separator' or 'toolbar-separator'
 * @copyright BBN Solutions
 * @author BBN Solutions
 */

(function(bbn){
  "use strict";

  Vue.component('bbn-toolbar', {
    /**
     * @mixin bbn.vue.basicComponent
     */
    mixins: [bbn.vue.basicComponent],
    props: {
      /**
       * The toolbat elements
       * @prop {Array} [[]] source
       */
      source: {
        type: Array,
        default(){
          return []
        }
      },
      /**
       * If true there will be a small margin between buttons
       * @prop {String} [true] slotBefore
       */
       buttonSpace: {
        type: Boolean,
        default: true
      },
      /**
       * If true the content of the slot is placed before the content generated by the configuration.
       * @prop {String} [true] slotBefore
       */
      slotBefore: {
        type: Boolean,
        default: true
      },
      /**
       * The orientation of the bar.
       * @prop {String} ['horizontal'] orientation
       */
      orientation: {
        type: String,
        default: 'horizontal'
      },
      /**
       * The size of the toolbar, height for horizontal toolbar and width for vertical toolbar.
       * @prop {String|Number} size
       */
      size: {
        type: [Number, String],
      },
      /**
       * @prop {Boolean} [false] disabled
       */
      disabled: {
        type: Boolean,
        default: false
      }
    },
    data: function(){
      return {
        /**
         * The real size of the toolbar basing on the props size and orientation.
         * @data {String} [''] currentSize
         */
        currentSize: '',
        /**
         * The style of the toolbar.
         * @data {String} [''] style
         */
        style: ''
      }
    },
    methods: {
      clickButton(button) {
        if (button.items) {

        }
        else if (button.action) {
          button.action();
        }
      },
      updateSlot(){
        if (this.$slots.default) {
          for (let node of this.$slots.default) {
            if ((node.tag === 'div') && !node.children) {
              node.elm.classList.add('bbn-toolbar-separator');
            }
          }
        }
      },
    },
    /**
     * Defines the current size of the bar basing on its style.
     * @event mounted
     */
    mounted() {
      this.updateSlot();
      if ( this.orientation ){
        if ( this.orientation === 'horizontal' ){
          if ( this.size ){
            if ( bbn.fn.isString(this.size) ){
              this.currentSize = this.size;
            }
            else if ( bbn.fn.isNumber(this.size) ){
              this.currentSize = this.size + 'px'
            }
            this.style += 'height:' + this. currentSize + ';';
          }
          else{
            this.style += ''
          }
        }
        else if ( this.orientation === 'vertical' ){
          if ( this.size ){
            if ( bbn.fn.isString(this.size) ){
              this.currentSize = this.size;
            }
            else if ( bbn.fn.isNumber(this.size) ){
              this.currentSize = this.size + 'px'
            }
            this.style += 'width:' + this. currentSize + ';';
          }
          else{
            this.style += 'width:inherit;'
          }
        }
      }
    }
  });

})(bbn);

</script>
<style scoped>
.bbn-toolbar {
  min-height: 2.5rem;
}
.bbn-toolbar.bbn-h-100 {
  text-align: center;
}
.bbn-toolbar.bbn-h-100 .bbn-toolbar-horizontal-separator {
  display: block;
}
.bbn-toolbar.bbn-h-100 .bbn-toolbar-separator {
  display: block;
}
.bbn-toolbar .bbn-toolbar-separator {
  display: inline-block;
  margin: 1rem;
}
.bbn-toolbar .bbn-toolbar-separator:before {
  content: '\0399';
}
.bbn-toolbar .bbn-toolbar-horizontal-separator {
  display: inline-block;
  margin: 1rem;
}
.bbn-toolbar .bbn-toolbar-horizontal-separator:before {
  content: '\2014';
}
.bbn-toolbar .bbn-toolbar-flex {
  flex-flow: wrap;
  display: flex;
}

</style>
