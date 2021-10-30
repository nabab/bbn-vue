<template>
<span :class="[componentClass, 'bbn-flex-width', 'bbn-vmiddle']"
	    :style="(currentSize !== '') ? 'width:' + currentSize : '' ">
	<span v-text="value"
        class="bbn-right-space bbn-nowrap"
				v-if="showLabel"/>
  <input :value="parseInt(value)"
         type="range"
         :name="name"
         ref="element"
         :readonly="readonly"
         :disabled="disabled"
         :required="required"
         :min="min"
         :max="max"
         @input="_changeValue"
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
         class="bbn-range-input bbn-radius bbn-flex-fill">
  <i class="nf nf-mdi-backup_restore bbn-p bbn-m bbn-left-xsspace"
     @click="reset"
     :title="_('Reset')"
		 v-if="showReset"/>
	<bbn-dropdown v-if="showUnits"
								:source="units"
								v-model="currentUnit"
								class="bbn-left-sspace bbn-narrow"/>
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
      /**
       * The min value
       * @prop {Number} [1] min
       */
      min: {
        type: Number,
        default: 1
      },
      /**
       * The max value
       * @prop {Number} [100] max
       */
      max: {
        type: Number,
        default: 100
      },
      /**
       * The step value
       * @prop {Number} [1] step
       */
      step: {
        type: Number, 
        default: 1
      },
      /**
       * The unit used for the value
       * @prop {String} [''] unit
       */
      unit: {
        type: String,
        default: ''
      },
      /**
       * @prop {Array} [[{text: '%', value: '%'}, {text: 'px', value: 'px'}, {text: 'em', value: 'em'}]] units
       */
      units: {
        type: Array,
        default(){
          return [{
            text: '%',
            value: '%'
          }, {
            text: 'px',
            value: 'px'
          }, {
            text: 'em',
            value: 'em'
          }]
        }
      },
      /**
       * @prop {Boolean} [false] showLabel
       */
      showLabel: {
        type: Boolean,
        default: false
      },
      /**
       * @prop {Boolean} [true] showReset
       */
      showReset: {
        type: Boolean,
        default: true
      },
      /**
       * @prop {Boolean} [false] showUnits
       */
      showUnits: {
        type: Boolean,
        default: false
      }
    },
    data(){
      let currentUnit = this.unit;
      if (!!this.value) {
        let match = this.value.toString().match(/\D+/);
        if (!!match) {
          currentUnit = match[0];
        }
      }
      if (!!this.showUnits && !currentUnit) {
        currentUnit = 'px';
      }
      return {
        /**
         * The property 'size' normalized.
         * @data {String} [''] currentSize
         */
        currentSize: this.size || '',
        /**
         * The original value
         * @data {Number} originalValue
         */
        originalValue: this.value,
        /**
         * The current unit
         * @data {String} [''] currentUnit
         */
        currentUnit: currentUnit
      }
    },
    computed: {
      /**
       * The current input width in characters if the 'autosize' is enabled
       * @computed currentInputSize
       * @returns {Number}
       */
      currentInputSize(){
        return this.autosize ? (this.value ? this.value.toString().length : 1) : 0;
      }
    },
    methods: {
      /**
       * Resets the value to the original one
       * @method reset
       * @fires emitInput
       */
      reset(){
        if (!this.disabled && !this.readonly) {
          this.emitInput(this.originalValue);
        }
      },
      /**
       * Emits the new value
       * @method _changeValue
       * @fires emitInput
       */
      _changeValue(){
        let val = parseInt(this.getRef('element').value);
        if (this.currentUnit) {
          val += this.currentUnit;
        }
        this.emitInput(val);
      }
    },
    /**
     * @event mounted
     */
    mounted(){
      this.ready = true;
    },
    watch: {
      /**
       * @watch currentUnit
       * @fires _changeValue
       */
      currentUnit(){
        this._changeValue();
      },
      /**
       * @watch unit
       */
      unit(val){
        this.currentUnit = val;
      }
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
