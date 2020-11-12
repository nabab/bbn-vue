<template>
<div :class="[componentClass, 'bbn-w-100']">
  <label v-text="label + ' ' + value" class="bbn-hspadded"></label>
  <input :focused="true"
          v-bind:value="value"
          placeholder="Type your text here!"
          v-on:input="$emit('input', $event.target.value)"
          type="range"
          :min="min" 
          :max="max" 
          class="slider"
  >
</div>
</template>
<script>
  module.exports = /**
 * @file bbn-block component
 * @description bbn-block 
 * @copyright BBN Solutions
 * @author Loredana Bruno
 * @created 09/11/2020.
 */
(function(bbn){
  "use strict";
  
  Vue.component('bbn-cursor', {
    /**
     * @mixin bbn.vue.basicComponent
     */
    mixins: [bbn.vue.basicComponent, bbn.vue.eventsComponent, bbn.vue.inputComponent],
    props: {
      label: {
        type: String,
        default: ''
      },
      /**
       * The aduio's URL
       */
      /*source: {
        type: Number,
        required: true
      },*/
      /**
       * The audio's title
       * @prop {String} [''] title
       */
      min: {
        type: Number,
        default: 0  
      },
      max: {
        type: Number,
        default: 500
      },
      title: {
        type: String,
        default: ''
      },
      value: {
        type: Number | String,
      }
    },
 
  });
})(bbn);

</script>
<style scoped>
.bbn-cursor {
  height: 15px;
  display: flex;
  flex-direction: row;
}
.bbn-cursor input {
  width: 90%;
  -webkit-appearance: none;
  appearance: none;
  background: #d3d3d3;
  outline: none;
  opacity: 0.7;
  -webkit-transition: .2s;
  transition: opacity .2s;
}
.bbn-cursor input:hover {
  opacity: 1;
}
.bbn-cursor input::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 15px;
  height: 15px;
  background-color: #8a8a8a;
  cursor: pointer;
}
.bbn-cursor input::-moz-range-thumb {
  width: 15px;
  height: 15px;
  background-color: #8a8a8a;
  cursor: pointer;
}

</style>
