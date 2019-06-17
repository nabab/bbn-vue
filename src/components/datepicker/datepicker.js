/**
  * @file bbn-datepicker component
  *
  * @description bbn-datepicker is a component that combines input and calendar, allowing the user to enter or select a date value.
  * The calendar display is smooth, ensuring that all users can quickly search for the date they are looking for with the interface.
  * Allows the association of data in a bidirectional way and to choose a validation interval period and the format of the value to be entered.
  *
  * @copyright BBN Solutions
  *
  * @author Mirko Argentino
  */
(function(bbn){
  "use strict";

  Vue.component('bbn-datepicker', {
    /**
     * @mixin bbn.vue.basicComponent
     * @mixin bbn.vue.fullComponent
     */
    mixins: [bbn.vue.basicComponent, bbn.vue.fullComponent],
    props: {
      /**
       * The format of the date shown.
       *
       * @prop {String} format
       */
      format: {
        type: String
      },
      /**
       * The format of the value.
       *
       * @prop {String} valueFormat
       */
      valueFormat: {
        type: [String, Function]
      },
      /**
       * The mask for the date input.
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
       *
       * @prop {String} min
       */
      min: {
        type: String
      },
      /**
       * The visualization type of the calendar.
       * Types: "days", "weeks", "months", "years".
       *
       * @prop {String} ['days'] type
      */
      type: {
        type: String,
        default: 'days',
        validator: (m) => ['days', 'weeks', 'months', 'years'].includes(m)
      },
      /**
       * The disabled dates.
       *
       * @prop {Array|Function} disableDates
       */
      disableDates: {
        type: [Array, Function]
      },
      /**
       * Array of dates values to insert into a range.
       *
       * @prop {Array} [[]] datesRange
      */
      datesRange: {
        type: Array,
        default(){
          return [];
        }
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
         * Indicates if the bbn-masked is mounted.
         * 
         * @data {Boolean} [false] maskedMounted
        */
        maskedMounted: false,
        /** 
         * The current value shown on the input.
         * 
         * @data {String} [''] inputValue
        */
        inputValue: ''
      }
    },
    computed: {
      /**
       * The current mask for the date input.
       *
       * @computed currentMask
       * @return {String}
       */
      currentMask(){
        let mask = '';
        switch ( this.type ){
          case 'days':
          case 'weeks':
            mask = '00/00/0000';
            break;
          case 'months':
            mask = '00/0000';
            break;
          case 'years':
            mask = '0000';
            break;
        }
        return this.mask || mask;
      },
      /**
       * The current value format.
       *
       * @computed currentValueFormat
       * @return {String}
       */
      currentValueFormat(){
        let format = '';
        switch ( this.type ){
          case 'days':
          case 'weeks':
            format = 'YYYY-MM-DD';
            break;
          case 'months':
            format = 'YYYY-MM';
            break;
          case 'years':
            format = 'YYYY';
            break;
        }
        return this.valueFormat || format;
      },
      /**
       * The current format shown on the input.
       *
       * @computed currentFormat
       * @return {String}
       */
      currentFormat(){
        let format = '';
        switch ( this.type ){
          case 'days':
          case 'weeks':
            format = 'DD/MM/YYYY';
            break;
          case 'months':
            format = 'MM/YYYY';
            break;
          case 'years':
            format = 'YYYY';
            break;
        }
        return this.format || format;
      },
      /**
       * The current value shown on the input.
       *
       * @computed inputValue
       * @fires getValueFormat
       * @return {String}
       */
      /* inputValue(){
        if ( this.value && this.maskedMounted ){
          return this.$refs.element.raw(moment(this.value, this.getValueFormat(this.value)).format(this.currentFormat));
        }
        return '';
      } */
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
        return bbn.fn.isFunction(this.currentValueFormat) ? this.currentValueFormat(val) : this.currentValueFormat;
      },
      /**
       * Sets the value from 'YYYY-MM-DD' formatted value.
       *
       * @method setDate
       * @fires getValueFormat
       * @fires setValue
      */
      setDate(val){
        this.setValue(moment(val, 'YYYY-MM-DD').format(this.getValueFormat(val)));
      },
      /**
       * Sets the value.
       *
       * @method setValue
       * @param {String} val The value.
       * @fires getValueFormat
       * @emits input
      */
      setValue(val){
        let format = !!val ? this.getValueFormat(val) : false,
            value = format ? moment(val, format).format(format) : '';
        if ( value && this.min && (value < this.min) ){
          value = this.min;
        }
        if ( value && this.max && (value > this.max) ){
          value = this.max;
        }
        if ( value !== this.value ){
          this.emitInput(value);
        }
        if ( !value ){
          this.inputValue = '';
        }
        this.isOpened = false;
      },
      /**
       * Updates the calendar.
       *
       * @method updateCalendar
       * @fires calendar.refresh
      */
      updateCalendar(){
        if ( this.$refs.calendar ){
          this.$refs.calendar.refresh();
        }
      },
      /** 
       * The method called on input blur event.
       * 
       * @method inputChanged
       * @fires getValueFormat
       * @fires disableDates
       * @fires setValue
       * @emits change
      */
      inputChanged(){
        let newVal = this.$refs.element.inputValue,
            value = !!newVal ? moment(newVal, this.currentFormat).format(this.getValueFormat(newVal)) : '';
        if ( value && this.min && (value < this.min) ){
          value = this.min;
        }
        if ( value && this.max && (value > this.max) ){
          value = this.max;
        }
        if (
          this.disableDates &&
          (bbn.fn.isFunction(this.disableDates) && this.disableDates(value)) ||
          (bbn.fn.isArray(this.disableDates) && this.disableDates.includes(value))
        ){
          this.setValue(false);
        }
        else {
          this.setValue(value);
          this.$nextTick(() => {
            if ( this.value !== value ){
              this.$emit('change', event);
            }
          });
        }
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
       * @watch min
       * @fires setValue
       * @fires updateCalendar
       */
      min(){
        this.setValue(this.value.toString());
        this.updateCalendar();
      },
      /**
       * @watch max
       * @fires setValue
       * @fires updateCalendar
       */
      max(){
        this.setValue(this.value.toString());
        this.updateCalendar();
      },
      /**
       * @watch valueFormat
       * @fires setValue
       */
      valueFormat(){
        this.setValue(this.value.toString());
      },
      /**
       * @watch maskedMounted
       * @fires getValueFormat
       */
      maskedMounted(newVal){
        if ( newVal ){
          let val = this.value ? this.value.toString() : '';
          this.inputValue = this.$refs.element.raw(moment(val, this.getValueFormat(val)).format(this.currentFormat));
        }
      },
      /** 
       * @watch value
       * @fires getValueFormat
       * @fires updateCalendar
      */
      value(newVal){
        let mom = moment(newVal.toString(), this.getValueFormat(newVal.toString()));
        this.inputValue = newVal && this.$refs.element && mom.isValid() ? 
          this.$refs.element.raw(mom.format(this.currentFormat)) : 
          ''; 
        this.updateCalendar();
      }
    }
  });

})(bbn);
