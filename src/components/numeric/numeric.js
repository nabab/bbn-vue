/**
 * @file bbn-numeric component
 *
 * @description bbn-numeric is a component that allows you to enter and modify specific numeric values ​​by typing or using the appropriate  buttons.
 * Only accept numerical values; correctly configuring it is possible to define a range of numbers that can be accepted.
 * You can change the value using the buttons and a defined step.
 *
 * @copyright BBN Solutions
 *
 * @author BBN Solutions
 *
 * @created 10/02/2017
 */

(function(bbn){
  "use strict";

  Vue.component('bbn-numeric', {
    /**
     * @mixin bbn.vue.basicComponent
     * @mixin bbn.vue.eventsComponent
     * @mixin bbn.vue.inputComponent
     */
    mixins: [bbn.vue.basicComponent, bbn.vue.eventsComponent, bbn.vue.inputComponent],
    props: {
      /**
       * Specify the number of decimals to be shown in the input, it doesn't affect the value of 
       * the component.
       * @prop {String|Number} [0] decimals
       */
      decimals: {
        type: [Number, String],
        default: 0
      },
      /**
       * The unit of measure of the value.
       * @prop {String} [''] unit
       */
      unit: {
        type: String,
        default: ''
      },
      /**
       * The max value of the component.
       * @prop {Number|String} max
       */
      max: {
        type: [Number, String]
      },
      /**
       * The min value of the component.
       * @prop {Number|String} min
       */
      min: {
        type: [Number, String]
      },
      /**
       * The step at which the value of the component change.
       * @prop {Number} [1] step
       */
      step: {
        type: Number,
        default: 1
      },
      /**
       * Set to true shows the arrow buttons of the component.
       * @prop {Boolean} [true] spinners
       */
      spinners: {
        type: Boolean,
        default: true
      },
    },
    data(){
      let isPercentage = this.unit === '%',
          decimals = isPercentage ? parseInt(this.decimals) + 2 : this.decimals,
          value = this.value;
      if ( !this.decimals && this.step && (this.step < 1) ){
        let step = this.step;
        while ( step < 1 ){
          step *= 10;
          decimals++;
        }
      }
      if ( (value === null) || (value === '') ){
        value = '';
      }
      else if ( value == 0 ){
        value = this.getFormatted(parseFloat(0).toFixed(decimals) * (isPercentage ? 100 : 1), decimals);
      }
      else {
        value = this.getFormatted(this.value * (isPercentage ? 100 : 1), isPercentage ? this.decimals : decimals);
      }
      return {
        /**
         * True if the inpunt is the edit mode
         * @data {Boolean} [false] editMode
         */
        editMode: false,
        /**
         * The value of the input (view mode)
         * @data {String|Number} inputValue
         */
        inputValue: value,
        /**
         * The value of the input (edit mode)
         * @data {String|Number} currentValue
         */
        currentValue: this.value === null ? '' : this.value,
        /**
         * The current decimals.
         * @data currentDecimals
         */
        currentDecimals: decimals
      }
    },
    computed: {
      /**
       * True if the decrease functionality must to disabled.
       * @computed disableDecrease
       * @returns {Boolean}
       */
      disableDecrease(){
        return (this.min !== undefined) && ((parseFloat(this.currentValue) - this.step ) <= this.min)
      },
      /**
       * True if the increase functionality must to disabled.
       * @computed disableIncrease
       * @returns {Boolean}
       */
      disableIncrease(){
        return (this.max !== undefined) && ((parseFloat(this.currentValue) + this.step ) >= this.max)
      },
      /**
       * The pattern of the input.
       * @computed pattern
       * @returns {RegExp}
       */
      pattern(){
        let p = '^';
        if ( (this.min === undefined) || (this.min < 0) ){
          p += '[\\-]{0,1}';
        }
        if ( this.currentDecimals ){
          p += '[0-9]+([\\.]{1}[0-9]+){0,1}';
        }
        else {
          p += '[0-9]+';
        }
        p += '$';
        return new RegExp(p);
      },
      /**
       * True if the unit is "%".
       * @computed isPercentage
       * @returns {Boolean}
       */
      isPercentage(){
        return this.unit === '%'
      }
    },
    methods: {
      /**
       * Called at keydown, defines some shortcuts for the component.
       * @method _keydown
       * @param {Event} e
       * @fires increment
       * @fires decrement
       * @fires changeValue
       * @fires keydown
       * @emit input
       */
      _keydown(e){
        const keys = ([]).concat(bbn.var.keys.numbers, bbn.var.keys.upDown, bbn.var.keys.leftRight, bbn.var.keys.dels, bbn.var.keys.confirm, bbn.var.keys.numsigns);
        if (
          ((this.min >= 0) && (e.keyCode === 189)) ||
          (!this.decimals && !this.unit && ((e.keyCode === 110) || (e.keyCode === 190))) ||
          (!keys.includes(e.keyCode) && (e.keyCode !== 17))
        ){
          e.preventDefault();
          return;
        }
        //arrow up
        if ( e.keyCode === 38 ){
          this.increment();
        }
        //arrow down
        if ( e.keyCode === 40 ){
          this.decrement();
        }
        //page up - increase the step of 10 unit
        if ( e.keyCode === 33 ){
          let step = 10 * this.step,
          tmp = parseFloat(this.value) + (this.isPercentage ? step / 100 : step);
          this.changeValue(tmp);
        }
        //page down - decrease the step of 10 unit
        if ( e.keyCode === 34 ){
          let step = 10 * this.step,
          tmp = parseFloat(this.value) - (this.isPercentage  ? step / 100 : step);
          this.changeValue(tmp);
        }
        this.keydown(e);
      },
      /**
       * @method _focus
       * @param {Event} e
       * @fires focus
       */
      _focus(e){
        if ( !this.disabled && !this.readonly ){
          this.currentValue = this.value;
          this.editMode = true;
          this.$nextTick(() => {
            this.focus(e);
          })
        }
      },
      /**
       * @method _blur
       * @fires blur
       * @param {Event} e
       */
      _blur(e){
        this.checkMinMax()
        this.editMode = false;
        this.$nextTick(() => {
          this.blur(e);
        })
      },
      checkMinMax(){
        let w = false;
        if ( 
          (this.max !== undefined) && 
          (this.currentValue !== '') &&
          (this.currentValue !== null) &&
          (this.currentValue > this.max) 
        ){
          this.currentValue = parseFloat(this.max).toFixed(this.currentDecimals);
          w = true;
        }
        else if ( 
          (this.min !== undefined) &&
          (this.currentValue !== '') &&
          (this.currentValue !== null) &&
          (this.currentValue < this.min) 
        ){
          this.currentValue = parseFloat(this.min).toFixed(this.currentDecimals);
          w = true;
        }
        if ( w ){
          this.setInputValue(this.currentValue);
          if ( this.value !== this.currentValue ){
            this.emitInput(this.currentValue);
          }
        }
      },
      /**
       * Increase the value of the component of 1 step.
       * @method increment
       * @fires changeValue
       */
      increment(){
        if ( !this.readonly && !this.disabled ){
          this.changeValue((parseFloat(this.value) || 0) + (this.isPercentage ? this.step / 100 : this.step));
        }
      },
      /**
       * Decrease the value of the component of 1 step.
       * @method decrement
       * @fires changeValue
       */
      decrement(){
        if (!this.readonly && !this.disabled) {
          this.changeValue((parseFloat(this.value) || 0) - (this.isPercentage ? this.step / 100 : this.step));
        }
      },
      /**
       * Change the value of the component.
       * @method changeValue
       * @param {Number|String} newVal
       * @fires setInputValue
       * @fires emitInput
       */
      changeValue(newVal){
        if ( (newVal === '') || (newVal === null) ){
          this.currentValue = '';
          this.setInputValue('');
          this.emitInput(this.nullable ? null : '');
        }
        else {
          let v = newVal ? parseFloat(parseFloat(newVal).toFixed(this.currentDecimals)) : 0;
          if ( (typeof newVal === 'string') && newVal.match(/^0\.0*[1-9]{0}$/) ){
            v = newVal;
            this.currentValue = v;
            return;
          }          
          else {
            v = parseFloat(v.toFixed(this.currentDecimals));
          }
          this.currentValue = v;
          this.setInputValue(v);
          if ( this.value !== v ){
            this.emitInput(v);
          }
        }
      },
      /**
       * Sets the value to the input (view mode)
       * @method setInputValue
       * @param {Number|String} val
       * @fires getFormatted
       */
      setInputValue(val){
        if ( val === undefined ){
          val = this.currentValue;
        }
        if ( (val === '') || (val === null) ){
          this.inputValue = '';
          return;
        }
        if ( this.isPercentage ){
          val = val * 100;
        }
        this.inputValue = this.getFormatted(val, this.decimals)
      },
      /**
       * Gets the formatted value
       * @method getFormatted
       * @param {String|Number} val
       * @param {Number|String} decimals
       * @returns {String}
       */
      getFormatted(val, decimals){
        return bbn.fn.money(
          val,
          bbn.env.money.kilo,
          this.unit,
          '',
          bbn.env.money.decimal,
          bbn.env.money.thousands,
          decimals
        )
      }
    },
    watch: {
      /**
       * @watch value
       */
      value(newVal){
        if ( newVal !== this.currentValue ){
          this.currentValue = newVal;
        }
      },
      /**
       * @watch currentValue
       * @fires changeValue
       */
      currentValue(newVal){
        this.changeValue(newVal);
      }
    }
  });
})(bbn);