<template>
<span :class="componentClass"
	   :style="(currentSize !== '') ? 'width:' + currentSize : '' "
>
  <input :value="value"
         type="range"
         :name="name"
         ref="element"
         :readonly="readonly"
         :disabled="disabled"
         :required="required"
         :min="min"
         :max="max"
         @input="emitInput(parseInt($refs.element.value))"
         @click="click"
         @focus="focus"
         @blur="blur"
         @change="change"
         @keydown="keydown"
         @keyup="keyup"
         @mouseenter="over"
         @mouseleave="out"
         :tabindex="tabindex"
         :size="currentInputSize"
         class="bbn-range-input bbn-radius">
</span>
</template>
<script>
  module.exports = /**
 * @file bbn-range component
 * @description bbn-range is a 'range' input type
 * @copyright BBN Solutions
 * @author BBN Solutions
 */
(function(bbn, Vue){
  "use strict";

  Vue.component("bbn-range", {
    name: 'bbn-range',
    mixins: [
      /**
       * @mixin bbn.vue.basicComponent
       * @mixin bbn.vue.eventsComponent
       * @mixin bbn.vue.inputComponent
       */
      bbn.vue.basicComponent,
      bbn.vue.eventsComponent,
      bbn.vue.inputComponent
    ],
    props: {
      min: {
        type: Number,
        default: 1
      },
      max: {
        type: Number,
        default: 100
      }
    },
    data(){
      return {
        /**
         * The property 'size' normalized.
         * @data {String} [''] currentSize
         */
        currentSize: this.size || ''
      }
    },
    computed: {
      /**
       * The current input width in characters if the 'autosize' is enabled
       * @computed currentInputSize
       * @returns {Number}
       */
      currentInputSize(){
        return this.autosize ? (this.value ? this.value.toString().length : 1) : 0
      }
    },
    /**
     * @event mounted
     */
    mounted(){
      this.ready = true;
    }
  });
})(bbn, Vue);
</script>
<style scoped>
.bbn-range {
  display: inline-block;
  font-size: inherit;
}
.bbn-range .bbn-range-input {
  -webkit-appearance: none;
  width: 100%;
  height: 0.5em;
  outline: none;
  opacity: 0.7;
  -webkit-transition: .2s;
  transition: opacity .2s;
}
.bbn-range .bbn-range-input:hover {
  opacity: 1;
}
.bbn-range .bbn-range-input::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 1.2em;
  height: 1.2em;
  border-radius: 50%;
  cursor: pointer;
}
.bbn-range .bbn-range-input::-moz-range-thumb {
  width: 1.2em;
  height: 1.2em;
  border-radius: 50%;
  cursor: pointer;
}

</style>
