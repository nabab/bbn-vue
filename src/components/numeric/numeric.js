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
       * Specify the number of decimals to be shown in the input, it doesn't affect the value of * the component.
       *
       * @prop {String|Number} decimals
       */
      decimals: {
        type: [Number, String],
        default: 0
      },
      /**
       * The unit of measure of the value.
       *
       * @prop {String} [''] unit
       *
       */
      unit: {
        type: String,
        default: ''
      },
      /**
       * The max value of the component.
       *
       * @prop {Number|String} max
       *
       */
      max: {
        type: [Number, String]
      },
      /**
       * The min value of the component.
       *
       * @prop {Number|String} min
       *
       */
      min: {
        type: [Number, String]
      },
      /**
       * The step at which the value of the component change.
       *
       * @prop {Number} [1] step
       *
       */
      step: {
        type: Number,
        default: 1
      },
      /**
       * Set to true shows the arrow buttons of the component.
       * @props {Boolean} [true] spinners
       */
      spinners: {
        type: Boolean,
        default: true
      },

    },
    data(){
      let decimals = (this.unit === '%') ? parseInt(this.decimals) + 2 : this.decimals;
      if ( !this.decimals && this.step && (this.step < 1) ){
        let step = this.step;
        while ( step < 1 ){
          step *= 10;
          decimals++;
        }
      }
      let v = this.value;
      if ( !v ){
        v = this.nullable ? '' : parseFloat(0).toFixed(decimals);
      }
      else{
        v = bbn.fn.money(this.value * (this.unit === '%' ? 100 : 1), '', this.unit, '', '.', ' ', this.unit === '%' ? this.decimals : decimals);
      }
      return {
        initialValue : this.value,
        /**
         * True if the input is changing.
         * @data {Boolean} [false] isChanging
         */
        isChanging: false,
        /**
         * @data tmpValue
         */
        tmpValue: v,
        /**
         * True if the input is focused.
         * @data {Boolan} [false] isFocused
         */
        isFocused: false,
        /**
         * The current decimals.
         * @data currentDecimals
         */
        currentDecimals: decimals,
        /**
         * The value of the timeout.
         * @data {Boolean} [false] valueTimeOut
         */
        valueTimeOut: false
      }
    },
    computed: {
      isChanged(){
        return this.initialValue !== this.value;        
      },
      disableDecrease(){
        if((this.min !== undefined) && ((parseFloat(this.value) - this.step ) < this.min)){
          return true;
        }
        else {
          return false;
        }
      },
      disableIncrease(){
        if((this.max !== undefined) && ((parseFloat(this.value) + this.step ) > this.max)){
          return true;
        }
        else {
          return false;
        }
      },
      /**
       * The pattern of the input.
       * @computed pattern
       */
      pattern(){
        let p = '^';
        if ( (this.min === undefined) || (this.min < 0) ){
          p += '[\\-]{0,1}';
        }
        if ( this.currentDecimals ){
          p += '[0-9]+([\\.]{1}[0-9]+){0,1}';
        }
        else{
          p += '[0-9]+';
        }
        p += '$';
        return new RegExp(p);
      },
      /**
       * The value rendered.
       * @computed formattedValue
       * @return String
       */
      formattedValue(){
        if ( this.value !== null ) {
          if ( !this.isFocused ){
            return bbn.fn.money(this.value * (this.unit === '%' ? 100 : 1), '', this.unit, '', '.', ' ', this.unit === '%' ? this.decimals : this.currentDecimals)
          }
          else {
            
            return (this.unit === '%' ? parseFloat(this.value) * 100 : parseFloat(this.value)).toFixed(this.decimals) + ( this.unit === '%' ? '%' : '')
          }
        }
        else{
          return '0'
        }
      }
    },
    methods: {
      /**
       * Called at keydown, defines some shortcuts for the component.
       *
       *
       * @method _keydown
       * @param {object} e The event of keydown
       * @fires increment
       * @fires decrement
       * @fires changeValue
       * @fires keydown
       * @emit input
       */
      _keydown(e){
        if (
          ((this.min >= 0 ) && (e.key === '-')) ||
          (!this.decimals && ((e.keyCode === 110) || (e.keyCode === 190))) ||
          ( (([]).concat(bbn.var.keys.numbers, bbn.var.keys.upDown, bbn.var.keys.leftRight, bbn.var.keys.dels, bbn.var.keys.confirm, bbn.var.keys.numsigns).indexOf(e.keyCode) === -1) && ( e.keyCode !== 17 ) )
        ){
          e.preventDefault();
          return;
        }
        if (e.keyCode === 38) {
          this.increment();
        }
        //arrow down
        if (e.keyCode === 40) {
          this.decrement();
        }
        //page up - increase the step of 10 unit
        if (e.keyCode === 33) {
          let step = 10 * this.step,
          tmp = parseFloat(this.value) + ((this.unit === '%')  ? step/100 : step);
          this.changeValue(tmp);
        }
        //page down - decrease the step of 10 unit
        if (e.keyCode === 34) {
          let step = 10 * this.step,
          tmp = parseFloat(this.value) - ((this.unit === '%')  ? step/100 : step);
          this.changeValue(tmp);
        }
        this.keydown(e);
      },
      /**
       * Select the value on the input when focused.
       *
       * @method _focus
       * @param {object} e The event
       * @fires focus
       */
      _focus(e){
        this.isFocused = true;
        this.$nextTick(() => {
          e.target.setSelectionRange(0, e.target.value.toString().length, e.target.value);
        })
        this.focus(e);
      },
      /**
       * @method _blur
       *
       * @fires blur
       * @param {object} e The event
       */
      _blur(e){
        this.$nextTick(() => {
          this.isFocused = false;
        })
        this.blur(e);
      },
      /**
       * Return true if the value is a decimal number
       * @method hasDecimal
       * @return boolean
       */
      hasDecimal(){
        return this.value.toString().indexOf('.') > -1
      },
      /**
       * Increase the value of the component of 1 step.
       *
       * @method increment
       * @fires changeValue
       */

      increment(){
        if ( !this.readonly && !this.disabled ){
          this.changeValue((parseFloat(this.value) || 0) + ((this.unit === '%') ? this.step / 100 : this.step));
        }
      },
      /**
       * Decrease the value of the component of 1 step.
       * @method decrement
       * @fires changeValue
       */

      decrement(){
        if (!this.readonly && !this.disabled) {
          this.changeValue((parseFloat(this.value) || 0) - ((this.unit === '%') ? this.step / 100 : this.step));
        }
      },
      /**
       * Change the value of the component.
       *
       * @method changeValue
       * @param {Number} newVal
       */
      changeValue(newVal){
        if ( this.valueTimeOut ) {
          clearTimeout(this.valueTimeOut);
        }
        if ( !this.required && (newVal === '') ){
          //if ( this.value ){
            this.isChanging = true;
            this.tmpValue = this.nullable ? null : ''
            //alert('ishere')
            this.$emit('input', this.nullable ? null : '');
            this.$nextTick(() => {
              this.isChanging = false;
            })
          //}
          return;
        }
        let v = this.nullable && !newVal ? null : (newVal ? parseFloat(parseFloat(newVal).toFixed(this.currentDecimals)) : 0);
        
        if ( this.value !== v){
          if ( this.nullable && !v ){
            this.$emit('input', null);
            this.tmpValue = '';
          }
          else{
             bbn.fn.happy('isnow ' + v )
            if ( this.respectMinMax(v) ){
              this.isChanging = true;
              this.$emit('input', v);
             
              this.$nextTick(() => {
                
                this.tmpValue = this.formattedValue;
                
                this.isChanging = false;
              })
            }
            else {
              this.isChanging = false;
              let tmp = null;
              
              if ((this.max !== undefined) && (v > this.max)){
                tmp = parseFloat(this.max).toFixed(this.currentDecimals);
              }
              else if ( (this.min !== undefined) &&  ( v < this.min ) ){
                tmp = parseFloat(this.min).toFixed(this.currentDecimals);
              }
              else {
                //tmp = this.tmpValue.replace(/\s/g,'');
                tmp = v.toFixed(this.currentDecimals);
              }
              this.$nextTick( () => {
                this.$emit('input', parseFloat(tmp));
                this.tmpValue =  tmp;
              })
            }
          }
        }
      
      },
      /**
       * @method _changeTmpValue
       * @param v 
       * @param force 
       * @fires changeValue
       */
      _changeTmpValue(v, force){
        if ( v === null ){
          if ( !this.nullable ){
            return;
          }
          this.changeValue(null);
        }
        else if ( force || this.pattern.test(v.toString()) ){
          if ( this.unit === '%' ){
            v = (parseFloat(v)/100).toFixed(this.currentDecimals)
          }
          this.changeValue(v);
        }
      },
      respectMinMax(v){
        if ( (( this.min || ( this.min === 0 ) ) && (this.max === undefined) ) || (!this.min && (this.max || (this.max === 0)))){
          if ( this.min && (parseFloat(v) >= this.min )){
            return true;
          }
          else if ( this.min && (parseFloat(v) < this.min )) {
            return false;
          }
          if ( this.max && (parseFloat(v) <= this.max )){
            return true;
          }
          else if ( this.max && (parseFloat(v) > this.max )){
            return false
          }
        }
        else if ( (this.min  || ( this.min === 0 ) ) && ( this.max || ( this.max === 0 ) )){
          if ( (parseFloat(v) >= this.min ) &&  (parseFloat(v) <= this.max )){
            return true
          }
          else{
            return false;
          }
        }
        else if ( (this.min === undefined ) && (this.max === undefined) ){
          return true;
        }
      },

    },
    watch: {
      /**
       * @watch tmpValue
       * @param v 
       * @fires _changeTmpValue
       */
      tmpValue(v){
        if ( this.valueTimeOut ) {
          clearTimeout(this.valueTimeOut);
        }
        this.valueTimeOut = setTimeout(() => {
          this._changeTmpValue(v);
        }, 2000);
      },
      /**
       * @watch value
       * @param v 
       */
      value(v){       
        this.tmpValue = v;  
        
        /*if ( !this.isChanging ){
          this.tmpValue = v;
        }*/       
      },
      /**
       * @watch isFocused
       * @param v 
       * @fires _changeTmpValue
       */
      isFocused(v){
        bbn.fn.warning('watch focused '+v)
        if ( v ){
          this.tmpValue = this.value ? (parseFloat(this.value) * (this.unit === '%' ? 100 : 1)).toFixed(this.decimals) : '';
        }
        else{
          this._changeTmpValue(this.tmpValue, true);
        }
      }
    },
    
    
  });

})(bbn);