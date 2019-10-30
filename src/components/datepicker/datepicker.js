/**
  * @file bbn-datepicker component
  *
  * @description bbn-datepicker is a component that combines input and calendar, allowing the user to choose a date value.
  * This component allows the association of data in a bidirectional way and allows the users to choose a validation interval period and the format of the value entered.
  *
  * @copyright BBN Solutions
  *
  * @author Mirko Argentino
  */
(function(bbn){
  "use strict";

  Vue.component('bbn-datepicker', {
    /**
     * @mixin bbn.vue.fullComponent
     */
    mixins: [bbn.vue.basicComponent, bbn.vue.inputComponent, bbn.vue.eventsComponent],
    props: {
      /**
       * The format of the date displayed.
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
       * The visualization mode.
       * Allowed values: days, weeks, months and years.
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
       * Array of date values insertable into a range.
       *
       * @prop {Array} [[]] datesRange
      */
      datesRange: {
        type: Array,
        default(){
          return [];
        }
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
         * Indicates if the bbn-masked is mounted.
         * 
         * @data {Boolean} [false] maskedMounted
        */
        maskedMounted: false,
        /** 
         * The current value displayed in the input.
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
       * The current mask for the date input.
       *
       * @computed currentMask
       * @return {String}
       */
      currentMask(){
        if ( this.mask ){
          return this.mask;
        }
        switch ( this.type ){
          case 'months':
            return '00/0000';
          case 'years':
            return '0000';
        }
        return '00/00/0000';
      },
      /**
       * The current value format.
       *
       * @computed currentValueFormat
       * @return {String}
       */
      currentValueFormat(){
        if ( this.valueFormat ){
          return this.valueFormat;
        }
        switch ( this.type ){
          case 'months':
            return 'YYYY-MM';
          case 'years':
            return 'YYYY';
        }
        return 'YYYY-MM-DD';
      },
      /**
       * The current format displayed in the input.
       *
       * @computed currentFormat
       * @return {String}
       */
      currentFormat(){
        if ( this.format ){
          return this.format;
        }
        switch ( this.type ){
          case 'months':
            return 'MM/YYYY';
          case 'years':
            return 'YYYY';
        }
        return 'DD/MM/YYYY';
      },
      /**
       * The current value displayed in the input.
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
      }, */
      /**
       * True if the values of the inputValue and the oldInputValue properties are different.
       * 
       * @computed intuValueChanged
       * @return {String}
       */
      inputValueChanged(){
        return this.inputValue !== this.oldInputValue;
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
        return bbn.fn.isFunction(this.currentValueFormat) ? this.currentValueFormat(val) : this.currentValueFormat;

      },
      /**
       * Sets the value to the 'YYYY-MM-DD' format.
       *
       * @method setDate
       * @fires getValueFormat
       * @fires setValue
      */
      setDate(val){
        this.setValue(moment(val, 'YYYY-MM-DD').isValid() ? moment(val, 'YYYY-MM-DD').format(this.getValueFormat(val)) : '');
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
            value = format ? (moment(val, format).isValid() ? moment(val, format).format(format) : '') : '';
        if ( value && this.min && (value < this.min) ){
          value = this.min;
        }
        if ( value && this.max && (value > this.max) ){
          value = this.max;
        }
        if ( value !== this.value ){
          this.emitInput(value);
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
       * The method called by the input blur event.
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
        if ( this.$refs.element.raw(newVal) !== this.oldInputValue ){
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
      setInputValue(newVal){
        let mom = moment(newVal.toString(), this.getValueFormat(newVal.toString()));
        this.inputValue = newVal && this.$refs.element && mom.isValid() ? 
          this.$refs.element.raw(mom.format(this.currentFormat)) : 
          ''; 
        this.oldInputValue = this.inputValue;
        this.updateCalendar();
      }
    },
    /**
     * @event beforeCreate
     */
    beforeCreate(){
      if ( bbn.env && bbn.env.lang && (bbn.env.lang !== moment.locale()) ){
        moment.locale(bbn.env.lang);
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
        this.setValue(this.value !== undefined ? this.value.toString() : '');
        this.updateCalendar();
      },
      /**
       * @watch max
       * @fires setValue
       * @fires updateCalendar
       */
      max(){
        this.setValue(this.value !== undefined ? this.value.toString() : '');
        this.updateCalendar();
      },
      /**
       * @watch valueFormat
       * @fires setValue
       */
      valueFormat(){
        this.setValue(this.value !== undefined ? this.value.toString() : '');
      },
      /**
       * @watch maskedMounted
       * @fires getValueFormat
       */
      maskedMounted(newVal){
        if ( newVal ){
          let val = this.value ? this.value.toString() : '';
          this.inputValue = this.$refs.element.raw(moment(val, this.getValueFormat(val)).format(this.currentFormat));
          this.oldInputValue = this.inputValue;
        }
      },
      /** 
       * @watch value
       * @fires getValueFormat
       * @fires updateCalendar
      */
      value(newVal){
        this.setInputValue(newVal);
      }
    }
  });

})(bbn);
