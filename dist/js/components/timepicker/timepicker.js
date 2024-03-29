(bbn_resolve) => {
((bbn) => {

let script = document.createElement('script');
script.innerHTML = `<span :class="[componentClass, 'bbn-textbox', {'bbn-input-nullable': isNullable}]">
  <bbn-masked v-model="inputValue"
              ref="element"
              :disabled="isDisabled"
              :readonly="readonly"
              :required="required"
              :mask="currentMask"
              @hook:mounted="maskedMounted = true"
              @blur="inputChanged"
              @keydown.enter="inputChanged"
              class="bbn-flex-fill"
              :autosize="autosize"
              :inputmode="inputmode"
              :placeholder="placeholder"/>
  <div v-if="isNullable && !readonly && !isDisabled"
       class="bbn-block bbn-h-100 bbn-input-nullable-container">
    <i v-if="hasValue" class="nf nf-fa-times_circle bbn-p"
       @mousedown.prevent.stop="clear"/>
  </div>
  <bbn-button icon="nf nf-fa-clock_o"
              @click="isOpened = !isOpened"
              :disabled="isDisabled || readonly"
              tabindex="-1"
              class="bbn-button-right bbn-no-vborder"/>
  <bbn-floater v-if="isOpened && !isDisabled && !readonly"
               :element="$el"
               ref="floater"
               @close="isOpened = false"
               :scrollable="false"
               :auto-hide="1000"
               :element-width="false"
               max-width="15rem"
               min-width="10rem">
    <bbn-timewheel @change="setValue"
                   :show-second="showSecond"
                   :value="value"
                   @cancel="isOpened = false"
                   :format="currentValueFormat"/>
  </bbn-floater>
</span>
`;
script.setAttribute('id', 'bbn-tpl-component-timepicker');
script.setAttribute('type', 'text/x-template');document.body.insertAdjacentElement('beforeend', script);


let css = document.createElement('link');
css.setAttribute('rel', 'stylesheet');
css.setAttribute('href', bbn.vue.libURL + 'dist/js/components/timepicker/timepicker.css');
document.head.insertAdjacentElement('beforeend', css);

/**
 * @file bbn-timepicker component
 *
 * @description bbn-timepicker is a component that allowes the user to choose a time value.
 * This component allows the association of data in a bidirectional way and allows the users to choose a validation interval period and the format of the value entered.

 * @author Mirko Argentino
 *
 * @copyright BBN Solutions
 */
(function(bbn){
  "use strict";

  Vue.component('bbn-timepicker', {
    /**
     * @mixin bbn.vue.basicComponent
     * @mixin bbn.vue.inputComponent
     * @mixin bbn.vue.eventsComponent
     */
    mixins: [
      bbn.vue.basicComponent,
      bbn.vue.inputComponent,
      bbn.vue.eventsComponent
    ],
    props: {
      /**
       * The view mode.
       * @prop {String} ['scroll'] mode
       */
      mode: {
        type: String,
        default: 'dropdown',
        validator: m => ['scroll', 'dropdown', 'block'].includes(m)
      },
      /**
       * The format of the time displayed.
       *
       * @prop {String} format
       */
      format: {
        type: String
      },
      /**
       * The format of the value.
       *
       * @prop {String|Function} valueFormat
       */
      valueFormat: {
        type: [String, Function]
      },
      /**
       * The mask for the time input.
       *
       * @prop {String} mask
       */
      mask: {
        type: String
      },
      /**
       * The maximum allowed value.
       *
       * @prop {String} max
       */
      max: {
        type: String
      },
      /**
       * The minimum allowed value.
       * @prop {String} min
       */
      min: {
        type: String
      },
      /**
       * Shows/hides the "seconds" selection.
       * @prop {Boolean} [false] showSecond
       */
      showSecond: {
        type: Boolean,
        default: false
      },
      /**
       * Set it to false if you dont' want to auto-resize the input's width based on its value (in characters).
       * @prop {Boolean} [true] autosize
       */
      autosize: {
        type: Boolean,
        default: true
      }
    },
    data(){
      return {
        /**
         * Shows/hides the floater.
         *
         * @data {Boolean} [false] isOpened
        */
        isOpened: false,
        /**
         * Indicates if the bbn-masked component is mounted.
         *
         * @data {Boolean} [false] maskedMounted
        */
        maskedMounted: false,
        /**
         * The current value displayed on the input.
         *
         * @data {String} [''] inputValue
        */
        inputValue: '',
        /**
         * The old value displayed in the input.
         *
         * @data {String} [''] oldInputvalue
         */
        oldInputValue: ''
      }
    },
    computed: {
      /**
       * The current mask for the time input.
       *
       * @computed currentMask
       * @return {String}
       */
      currentMask(){
        return this.mask || (this.showSecond ? '00:00:00' : '00:00');
      },
      /**
       * The current value format.
       *
       * @computed currentValueFormat
       * @return {String}
       */
      currentValueFormat(){
        return this.valueFormat || (this.showSecond ? 'HH:mm:ss' : 'HH:mm');
      },
      /**
       * The current format displayed on the input.
       *
       * @computed currentFormat
       * @return {String}
       */
      currentFormat(){
        return this.format || (this.showSecond ? 'HH:mm:ss' : 'HH:mm');
      },
      /**
       * True if the values of the inputValue and the oldInputValue properties are different.
       *
       * @computed intuValueChanged
       * @return {String}
       */
      inputValueChanged(){
        return this.inputValue !== this.oldInputValue;
      },
      scrollMode(){
        return this.mode === 'scroll';
      },
      dropdownMode(){
        return this.mode === 'dropdown';
      },
      blockMode(){
        return this.mode === 'block';
      }
    },
    methods: {
      /**
       * Gets the correct value format.
       *
       * @method getValueFormat
       * @param {String} val The value.
       * @return {String}
       */
      getValueFormat(val){
        return bbn.fn.isFunction(this.valueFormat) ? this.valueFormat(val) : this.currentValueFormat;
      },
      /**
       * Sets the value.
       *
       * @method setValue
       * @param {String} val The value.
       * @param {String} format 
       * @fires getValueFormat
       * @fires setInputValue
       * @fires emitInput
       * @emits input
      */
      setValue(val, format){
        if ( !format ){
          format = !!val ? this.getValueFormat(val.toString()) : false;
        }
        let value = !!format && !!val ? (dayjs(val.toString(), format).isValid() ? dayjs(val.toString(), format).format(format) : '') : '';
        if ( value ){
          if ( value && this.min && (value < this.min) ){
            value = this.min;
          }
          if ( value && this.max && (value > this.max) ){
            value = this.max;
          }
        }
        else if ( this.nullable ){
          value = null;
        }
        if ( value !== this.value ){
          this.emitInput(value);
          this.$emit('change', value);
        }
        else {
          this.setInputValue(value);
        }
        if ( !value ){
          this.inputValue = '';
          this.oldInputValue = '';
        }
        this.isOpened = false;
      },
      /**
       * Triggered when the value is changed by the input.
       *
       * @method change
       * @param {$event} event Original event.
       * @fires getValueFormat
       * @fires setValue
       * @emits change
      */
      inputChanged(){
        let mask = this.getRef('element'),
            newVal = mask.inputValue,
            value = !!newVal ? dayjs(newVal, this.currentFormat).format(this.getValueFormat(newVal)) : '';
        if ( mask.raw(newVal) !== this.oldInputValue ){
          if ( value && this.min && (value < this.min) ){
            value = this.min;
          }
          if ( value && this.max && (value > this.max) ){
            value = this.max;
          }
          this.setValue(value);
        }
      },
      /**
       * Sets the value of the input.
       * @method setInputValue
       * @param {String} newVal 
       * @fires getValueFormat
       * @fires setValue
       */
      setInputValue(newVal){
        if ( newVal ){
          let mask = this.getRef('element'),
              mom = dayjs(newVal.toString(), this.getValueFormat(newVal.toString()));
          this.inputValue = newVal && mask && mom.isValid() ?
            mask.raw(mom.format(this.currentFormat)) :
            '';
        }
        else {
          this.inputValue = '';
        }
        this.oldInputValue = this.inputValue;
      },
      /**
       * Clears the input.
       * @method clear
       */
      clear(){
        this.setValue('');
        this.$nextTick(() => {
          this.$set(this.getRef('element'), 'inputValue', '');
        })
      }
    },
    /**
     * Defines the locale set basing on the lang of the environment (bbn.env.lang).
     * @event beforeCreate
     */
    beforeCreate(){
      if ( bbn.env && bbn.env.lang && (bbn.env.lang !== dayjs.locale()) ){
        dayjs.locale(bbn.env.lang);
      }
    },
    /**
     * @event mounted
     * @fires setValue
     */
    mounted(){
      if ( this.value ){
        this.setValue(this.value);
      }
      this.ready = true;
    },
    watch: {
      /**
       * @watch min
       * @fires setValue
       */
      min(){
        this.setValue(this.value || '');
      },
      /**
       * @watch max
       * @fires setValue
       */
      max(){
        this.setValue(this.value || '');
      },
      /**
       * @watch valueFormat
       * @fires setValue
       */
      valueFormat(){
        this.setValue(this.value || '');
      },
      /**
       * @watch maskedMounted
       * @fires getValueFormat
       * @param {String} newVal
       */
      maskedMounted(newVal){
        if ( newVal ){
          this.setInputValue(this.value);
        }
      },
      /**
       * @watch value
       * @param {String} newVal
       * @fires getValueFormat
       * @fires updateCalendar
      */
      value(newVal){
        this.setInputValue(newVal);
      }
    }
  });

})(bbn);

if (bbn_resolve) {bbn_resolve("ok");}
})(bbn);
}