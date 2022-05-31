(bbn_resolve) => {
((bbn) => {

let script = document.createElement('script');
script.innerHTML = `<span :class="[componentClass, 'bbn-flex-width', 'bbn-vmiddle']"
	    :style="(currentSize !== '') ? 'width:' + currentSize : '' ">
	<span v-text="value"
        class="bbn-right-space bbn-nowrap"
				v-if="showLabel && !showNumeric"/>
	<bbn-numeric v-if="showNumeric"
                v-model="numericValue"
                class="bbn-right-space"
                :style="'width: calc(1rem + ' + (currentMax ? currentMax.toString().length : 8) + 'em)'"
                :min="currentMin"
                :max="currentMax"
                :step="currentStep"
                :decimals="currentDecimals"/>
  <input :value="Number(value.toString().replace(currentUnit, ''))"
         type="range"
         :name="name"
         ref="element"
         :readonly="readonly"
         :disabled="isDisabled"
         :required="required"
         :min="currentMin"
         :max="currentMax"
         :step="currentStep"
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
</span>`;
script.setAttribute('id', 'bbn-tpl-component-range');
script.setAttribute('type', 'text/x-template');document.body.insertAdjacentElement('beforeend', script);


let css = document.createElement('link');
css.setAttribute('rel', 'stylesheet');
css.setAttribute('href', bbn.vue.libURL + 'dist/js/components/range/range.css');
document.head.insertAdjacentElement('beforeend', css);

/**
 * @file bbn-range component
 * @description bbn-range is a 'range' input type
 * @copyright BBN Solutions
 * @author BBN Solutions
 */
 (function(bbn, Vue){
  "use strict";

  Vue.component("bbn-range", {
    name: 'bbn-range',
    /**
     * @mixin bbn.vue.basicComponent
     * @mixin bbn.vue.eventsComponent
     * @mixin bbn.vue.inputComponent
     */
    mixins:
    [
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
        type: Number
      },
      /**
       * The max value
       * @prop {Number} [100] max
       */
      max: {
        type: Number
      },
      /**
       * The step value
       * @prop {Number} [1] step
       */
      step: {
        type: Number
      },
      /**
       * The unit used for the value
       * @prop {String} [''] unit
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
            value: '%',
            min: 1,
            max: 100,
            step: 1,
            decimals: 0
          }, {
            text: 'px',
            value: 'px',
            min: 1,
            max: 2000,
            step: 1,
            decimals: 0
          }, {
            text: 'em',
            value: 'em',
            min: 0.1,
            max: 200,
            step: 0.1,
            decimals: 1
          }, {
            text: 'vh',
            value: 'vh',
            min: 1,
            max: 100,
            step: 1,
            decimals: 0
          }, {
            text: 'vw',
            value: 'vw',
            min: 1,
            max: 100,
            step: 1,
            decimals: 0
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
      },
      /**
       * @prop {Boolean} [false] showNumeric
       */
      showNumeric: {
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
        currentUnit: currentUnit,
        /**
         * The current value of the numeric input
         * @data {String} numericValue
         */
        numericValue: Number(this.value.toString().replace(currentUnit, ''))
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
      },
      currentMin(){
        if (this.min !== undefined) {
          return this.min;
        }
        if (this.currentUnit) {
          return bbn.fn.getField(this.units, 'min', 'value', this.currentUnit);
        }
        return 1;
      },
      currentMax(){
        if (this.max !== undefined) {
          return this.max;
        }
        if (this.currentUnit) {
          return bbn.fn.getField(this.units, 'max', 'value', this.currentUnit);
        }
        return 100;
      },
      currentStep(){
        if (this.step) {
          return this.step;
        }
        if (this.currentUnit) {
          let step = bbn.fn.getField(this.units, 'step', 'value', this.currentUnit);
          if (step) {
            return step;
          }
        }
        return 1;
      },
      currentDecimals(){
        if (this.currentUnit) {
          return bbn.fn.getField(this.units, 'decimals', 'value', this.currentUnit) || 0;
        }
        return 0;
      }
    },
    methods: {
      /**
       * Resets the value to the original one
       * @method reset
       * @fires emitInput
       */
      reset(){
        if (!this.isDisabled && !this.readonly) {
          this.emitInput(this.originalValue);
        }
      },
      /**
       * Emits the new value
       * @method _changeValue
       * @fires emitInput
       */
      _changeValue(){
        let val = Number(this.getRef('element').value);
        this.numericValue = val;
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
      },
      /**
       * @watch numericValue
       */
      numericValue(val){
        if (val !== this.value) {
          if (this.currentUnit) {
            val += this.currentUnit;
          }
          this.emitInput(val);
        }
      }
    }
  });
})(bbn, Vue);
if (bbn_resolve) {bbn_resolve("ok");}
})(bbn);
}