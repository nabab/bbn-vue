/**
 * @file bbn-numeric component
 *
 * @description bbn - numeric allows to enter and modify numeric values​​ by typing it, using arrow buttons or keyboard shortcuts.
 * By configuring the component it is possible to define its range and its step.
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
        currentValue: this.value === null ? '' : (bbn.fn.isNumber(this.value) ? parseFloat(this.value).toFixed(this.decimals) : this.value),
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
        return (this.min !== undefined) && (parseFloat(this.currentValue)  <= this.min)
      },
      /**
       * True if the increase functionality must to disabled.
       * @computed disableIncrease
       * @returns {Boolean}
       */
      disableIncrease(){
        return (this.max !== undefined) && (parseFloat(this.currentValue) >= this.max)
      },
      /**
       * The pattern of the input.  ^\-?[0-9]+\.0*[1-9]{0}$
       * @computed pattern
       * @returns {RegExp}
       */
      pattern(){
        let p = '^';
        if ( (this.min === undefined) || (this.min < 0) ){
          p += '\\-?';
        }
        p += '[0-9]+';
        if ( this.currentDecimals ){
          p += '(\\.[0-9]{1,' + this.currentDecimals + '}){0,1}';
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
       * @fires checkMinMax
       * @fires checkDecimals
       * @param {Event} e
       */
      _blur(e){
        this.checkMinMax();
        this.checkDecimals();
        this.editMode = false;
        this.$nextTick(() => {
          this.blur(e);
        })
      },
      /**
       * @method checkDecimals
       */
      checkDecimals(){
        if ( 
          this.currentDecimals &&
          this.currentValue &&
          parseFloat(this.currentValue).toString().match('^\-?[0-9]+\.0{0,' + this.currentDecimals + '}[1-9]{0}$')
        ){
          this.currentValue = parseFloat(this.currentValue).toFixed(0);
        }
      },
      /**
       * @method checkMinMax
       * @fires setInputValue
       * @fires emitInput
       * @returns Boolean
       */
      checkMinMax(){
        let w = false;
        if ( 
          (this.max !== undefined) && 
          (this.currentValue !== '') &&
          (this.currentValue !== null) &&
          (parseFloat(this.currentValue) > parseFloat(this.max)) 
        ){
          this.currentValue = parseFloat(this.max).toFixed(this.currentDecimals);
          w = true;
        }
        else if ( 
          (this.min !== undefined) &&
          (this.currentValue !== '') &&
          (this.currentValue !== null) &&
          (parseFloat(this.currentValue) < parseFloat(this.min))
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
        return w;
      },
      /**
       * Increase the value of the component of 1 step.
       * @method increment
       * @fires checkMinMax
       */
      increment(){
        if ( !this.readonly && !this.disabled && !this.disableIncrease ){
          this.currentValue = ((parseFloat(this.value) || 0) + (this.isPercentage ? this.step / 100 : this.step)).toFixed(this.currentDecimals);
          this.$nextTick(() => {
            this.checkMinMax();
          })
        }
      },
      /**
       * Decrease the value of the component of 1 step.
       * @method decrement
       * @fires checkMinMax
       */
      decrement(){
        if ( !this.readonly && !this.disabled && !this.disableDecrease ) {
          this.currentValue = ((parseFloat(this.value) || 0) - (this.isPercentage ? this.step / 100 : this.step)).toFixed(this.currentDecimals);
          this.$nextTick(() => {
            this.checkMinMax();
          })
        }
      },
      /**
       * Change the value of the component.
       * @method changeValue
       * @param {Number|String} newVal
       * @fires setInputValue
       * @fires emitInput
       */
      changeValue(newVal, oldVal){
        if ( (newVal === '') || (newVal === null) ){
          this.currentValue = '';
          this.setInputValue('');
          this.emitInput(this.nullable ? null : '');
        }
        else {
          if ( 
            this.pattern.exec(newVal) ||
            (this.currentDecimals && bbn.fn.isString(newVal) && newVal.match(/^\-?[0-9]+\.$/))
          ){
            let v = newVal ? parseFloat(parseFloat(newVal).toFixed(this.currentDecimals)) : 0;
            this.setInputValue(v);
            if ( this.value !== v ){
              this.emitInput(v);
            }
          }
          else if ( 
            (!this.currentDecimals || (bbn.fn.isString(newVal) && !newVal.match(/^\-?[0-9]+\.$/))) &&
            (oldVal !== undefined)
          ){
            this.currentValue = oldVal;
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
          ((bbn.env.money !== undefined) && (bbn.env.money.kilo !== undefined)) ? bbn.env.money.kilo : undefined,
          this.unit,
          '',
          ((bbn.env.money !== undefined) && (bbn.env.money.decimal !== undefined)) ? bbn.env.money.decimal : undefined,
          ((bbn.env.money !== undefined) && (bbn.env.money.thousands !== undefined)) ? bbn.env.money.thousands : undefined,
          decimals
        )
      }
    },
    watch: {
      /**
       * @watch value
       */
      value(newVal){
        if ( (newVal !== this.currentValue) && !this.editMode ){
          this.currentValue = newVal;
        }
      },
      /**
       * @watch currentValue
       * @fires changeValue
       */
      currentValue(newVal, oldVal){
        if ( (newVal !== oldVal) ){
          this.changeValue(newVal, oldVal);
        }
      }
    }
  });
})(bbn);