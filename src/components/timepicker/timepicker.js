/**
 * @file bbn-timepicker component
 *
 * @description bbn-timepicker is a component that allowes the user to choose a time value.
 * This component allows the association of data in a bidirectional way and allows the users to choose a validation interval period and the format of the value entered.

 * @author Mirko Argentino
 *
 * @copyright BBN Solutions
 */
return {
    /**
     * @mixin bbn.wc.mixins.basic
     * @mixin bbn.wc.mixins.input
     * @mixin bbn.wc.mixins.events
     */
    mixins: [
      bbn.wc.mixins.basic,
      bbn.wc.mixins.input,
      bbn.wc.mixins.events
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
  };
