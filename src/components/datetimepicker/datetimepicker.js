/**
 * @file bbn-datetimepicker component
 *
 * @description bbn-datetimepicker is a component that allows the user to choose a time and date.
 * The interval period and the value format are easuly customizable.
 *
 * @copyright BBN Solutions
 *
 * @author Mirko Argentino
 */
return {
    /**
     * @mixin bbn.wc.mixins.basic
     * @mixin bbn.wc.mixins.input
     * @mixin bbn.wc.mixins.events
     */
    mixins: 
    [
      bbn.wc.mixins.basic, 
      bbn.wc.mixins.input, 
      bbn.wc.mixins.events
    ],
    props: {
      /**
       * The format of the date and time displayed in the user interface.
       *
       * @prop {String} format
       */
      format: {
        type: String
      },
      /**
       * The format of the date and time sent to the server.
       *
       * @prop {String} valueFormat
       */
      valueFormat: {
        type: [String, Function]
      },
      /**
       * The mask for date input.
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
       * The disabled dates.
       *
       * @prop {Array|Function} disableDates
       */
      disableDates: {
        type: [Array, Function]
      },
      /**
       * The array of date values insertable into a range.
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
       * Shows/hides the seconds selection.
       *
       * @prop {Boolean} [false] showSecond
      */
      showSecond: {
        type: Boolean,
        default: false
      },
      /**
       * Shows an alternative view for the time selection instead of the dropdowns.
       *
       * @prop {Boolean} [true] scrollMode
      */
      scrollMode: {
        type: Boolean,
        default: false
      },
      /**
       * Shows an alternative view for the time selection instead of the dropdowns.
       *
       * @prop {Boolean} [false] blocksMode
      */
      blocksMode: {
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
         * Shows/hides the calendar's floater.
         *
         * @data {Boolean} [false] isCalendarOpened
        */
        isCalendarOpened: false,
        /**
         * Shows/hides the time's floater.
         *
         * @data {Boolean} [false] isTimeOpened
        */
        isTimeOpened: false,
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
       * The current mask for the input.
       *
       * @computed currentMask
       * @return {String}
       */
      currentMask(){
        return this.mask || (this.showSecond ? '00/00/0000 00:00:00' : '00/00/0000 00:00');
      },
      /**
       * The current value format.
       *
       * @computed currentValueFormat
       * @return {String}
       */
      currentValueFormat(){
        return this.valueFormat || 'YYYY-MM-DD HH:mm:ss';
      },
      /**
       * The current format shown on the input.
       *
       * @computed currentFormat
       * @return {String}
       */
      currentFormat(){
        return this.format || (this.showSecond ? 'DD/MM/YYYY HH:mm:ss' : 'DD/MM/YYYY HH:mm');
      },
      /**
       * True if the values of the inputValue and the oldInputValue properties are different.
       *
       * @computed intuValueChanged
       * @return {Boolean}
       */
      inputValueChanged(){
        return this.inputValue !== this.oldInputValue;
      }
    },
    methods: {
      /**
       * Shows/hides the calendar's floater.
       *
       * @method showCalendar
       */
      showCalendar(){
        this.isTimeOpened = false;
        this.$nextTick(() => {
          this.isCalendarOpened = !this.isCalendarOpened;
        });
      },
      /**
       * Shows/hides the time's floater
       *
       * @method showTime
       */
      showTime(){
        this.isCalendarOpened = false;
        this.$nextTick(() => {
          this.isTimeOpened = !this.isTimeOpened;
        });
      },
      /**
       * Gets the correct value format.
       *
       * @method getValueFormat
       * @param {String} val The value.
       * @fires valueFormat
       * @return {String}
       */
      getValueFormat(val){
        return bbn.fn.isFunction(this.valueFormat) ? this.valueFormat(val) : this.currentValueFormat;
      },
      /**
       * Sets the value from 'YYYY-MM-DD' formatted value.
       *
       * @method setDate
       * @param {String} val The value.
       * @fires getValueFormat
       * @fires setValue
      */
      setDate(val){
        val = dayjs(val, 'YYYY-MM-DD').isValid() ? dayjs(val, 'YYYY-MM-DD') : '';
        if ( this.value && val ){
          let mom = dayjs(this.value.toString(), this.getValueFormat(this.value.toString()));
          val = dayjs(dayjs(val, 'YYYY-MM-DD').hour(mom.hour())).minute(mom.minute());
          if ( this.showSecond ){
            val = dayjs(val).second(mom.second());
          }
        }
        this.setValue(val ? dayjs(val).format(this.getValueFormat(dayjs(val).format(this.currentValueFormat))) : '');
      },
      /**
       * Sets the value format from 'HH:mm' to 'HH:mm:ss'.
       *
       * @method setTime
       * @param {String} val The value.
       * @fires getValueFormat
       * @fires setValue
      */
      setTime(val){
        //val = dayjs(val, 'HH:mm' + (this.showSecond ? ':ss' : ''));
        val = dayjs(val, this.currentValueFormat);
        if ( this.value ){
          let mom = dayjs(this.value.toString(), this.getValueFormat(this.value.toString()));
          val = dayjs(dayjs(dayjs(val).date(mom.date())).month(mom.month())).year(mom.year());
        }
        this.setValue(dayjs(val).format(this.getValueFormat(dayjs(val).format(this.currentValueFormat))));
      },
      /**
       * Sets the value.
       *
       * @method setValue
       * @param {String} val The value.
       * @param {String} format Type format.
       * @fires getValueFormat
       * @fires setInputValue
       * @fires disabledDates
       * @emits input
      */
      setValue(val, format){
        if ( !format ){
          format = !!val ? this.getValueFormat(val.toString()) : false;
        }
        let value = !!format && !!val ? (dayjs(val.toString(), format).isValid() ? dayjs(val.toString(), format).format(format) : '') : '';
        if ( value ){
          if ( this.min && (value < this.min) ){
            value = this.min;
          }
          if ( this.max && (value > this.max) ){
            value = this.max;
          }
          if (
            this.disableDates &&
            (bbn.fn.isFunction(this.disableDates) && this.disableDates(value)) ||
            (bbn.fn.isArray(this.disableDates) && this.disableDates.includes(value))
          ){
            value = this.nullable ? null : '';
          }
        }
        else if ( this.nullable ){
          value = null;
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
        this.isCalendarOpened = false;
        this.isTimeOpened = false;
      },
      /**
       * Updates the calendar.
       *
       * @method updateCalendar
       * @fires getRef
       * @fires calendar.refresh
      */
      updateCalendar(){
        if ( this.getRef('calendar') ){
          this.getRef('calendar').refresh();
        }
      },
      /**
       * The method initialized by the input blur event.
       *
       * @method inputChanged
       * @fires getValueFormat
       * @fires disableDates
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
                this.$emit('change', value);
              }
            });
          }
        }
      },
      /**
       * The method value input.
       *
       * @method setInputValue
       * @param {String} newVal
       * @fires getValueFormat
       * @fires updateCalendar
       * @fires getRef
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
        this.updateCalendar();
      },
      /**
       * clears any contained value in input.
       *
       * @method clear
       * @fires setValue
       * @fires getRef
       */
      clear(){
        this.setValue('');
        this.$nextTick(() => {
          this.$set(this.getRef('element'), 'inputValue', '');
        })
      }
    },
    /**
     * @event beforeCreate
     */
    beforeCreate(){
      if ( bbn.env && bbn.env.lang && (bbn.env.lang !== dayjs.locale()) ){
        dayjs.locale(bbn.env.lang);
      }
    },
    /**
     * @event mounted
     *
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
        this.setValue(this.value || '');
        this.updateCalendar();
      },
      /**
       * @watch max
       * @fires setValue
       * @fires updateCalendar
       */
      max(){
        this.setValue(this.value || '');
        this.updateCalendar();
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
       * @fires setInputValue
       */
      maskedMounted(newVal){
        if ( newVal ){
          this.setInputValue(this.value);
        }
      },
      /**
       * @watch value
       * @fires setInputValue
       */
      value(newVal){
        this.setInputValue(newVal);
      }
    }
  };
