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
(function(bbn){
  "use strict";

  Vue.component('bbn-datetimepicker', {
    /**
     * @mixin bbn.vue.basicComponent
     * @mixin bbn.vue.inputComponent
     * @mixin bbn.vue.eventsComponent
     */
    mixins: [bbn.vue.basicComponent, bbn.vue.inputComponent, bbn.vue.eventsComponent],
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
        default: true
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
        return this.valueFormat || (this.showSecond ? 'YYYY-MM-DD HH:mm:ss' : 'YYYY-MM-DD HH:mm');
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
          val.hour(mom.hour()).minute(mom.minute());
          if ( this.showSecond ){
            val.second(mom.second());
          }
        }
        this.setValue(val ? val.format(this.getValueFormat(val)) : '');
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
        val = dayjs(val, 'HH:mm' + (this.showSecond ? ':ss' : ''));
        if ( this.value ){
          let mom = dayjs(this.value.toString(), this.getValueFormat(this.value.toString()));
          val.date(mom.date()).month(mom.month()).year(mom.year());
        }
        this.setValue(val.format(this.getValueFormat(val)));
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
    },
    components: {
      /**
       * @component timepicker
       */
      timepicker: {
        name: 'timepicker',
        data(){
          return {
            /**
             * The main component.
             *
             * @data {Vue} comp
             * @memberof timepicker
             */
            comp: bbn.vue.closest(this, 'bbn-datetimepicker'),
            /**
             * The array used to make the minutes and the seconds.
             *
             * @data {Array} minsec
             * @memberof timepicker
             */
            minsec: Array.from({length: 60}, (v,i) => {
              return {
                text: i.toString().length === 1 ? '0' + i : i,
                value: i
              };
            }),
            /**
             * The current hour
             *
             * @data {String|null} [null] hour
             * @memberof timepicker
             */
            hour: null,
            /**
             * The current minute.
             *
             * @data {String|null} [null] minute
             * @memberof timepicker
             */
            minute: null,
            /**
             * The current second.
             *
             * @data {String|null} [null] second
             * @memberof timepicker
             */
            second: null,
            /**
             * True when the hours scroll is ready.
             *
             * @data {Boolean} [false] hourReady
             * @memberof timepicker
             */
            hourReady: false,
            /**
             * True when the minutes scroll is ready.
             *
             * @data {Boolean} [false] minuteReady
             * @memberof timepicker
             */
            minuteReady: false,
            /**
             * True when the seconds scroll is ready.
             *
             * @data {Boolean} [false] secondReady
             * @memberof timepicker
             */
            secondReady: false,
            /**
             * True when the component is ready.
             *
             * @data {Boolean} [false] ready
             * @memberof timepicker
             */
            ready: false
          }
        },
        computed: {
          /**
             * The array used to make the hours.
             *
             * @computed hours
             * @memberof timepicker
             * @fires comp.getValueFormat
             * @return {Array}
             */
          hours(){
            if ( this.comp ){
              /* let min = this.comp.min ? dayjs(this.comp.min, this.comp.getValueFormat(this.comp.min)).format('HH') : false,
                  max = this.comp.max  ? dayjs(this.comp.max, this.comp.getValueFormat(this.comp.max)).format('HH') : false; */
              let min = false,
                  max = false;
              return Array.from({length: 24}, (v,i) => {
                return {
                  text: i.toString().length === 1 ? '0' + i : i,
                  value: i
                };
              }).filter((v) => {
                return !((min && (v.value < min)) || (max && (v.value > max)))
              })
            }
            return [];
          },
          /**
           * Checks if all scrolls are ready.
           *
           * @computed checkScroll
           * @memberof timepicker
           * @fires getRef
           * @return {Boolean}
           */
          checkScroll(){
            return !!(
              this.comp &&
              this.comp.scrollMode &&
              this.hourReady &&
              this.minuteReady &&
              this.getRef('minuteActive') &&
              this.getRef('hourActive') &&
              this.comp.getRef('timeFloater').ready &&
              (!this.comp.showSecond || (this.secondReady && this.getRef('secondActive')))
            );
          }
        },
        methods: {
          /**
           * Gets the current time value.
           *
           * @method getTime
           * @memberof timepicker
           * @return {String}
           */
          getTime(){
            if (
              !bbn.fn.isNull(this.hour) &&
              !bbn.fn.isNull(this.minute) &&
              (!this.comp.showSecond || !bbn.fn.isNull(this.second) )
            ){
              let v = dayjs().minute(this.minute).hour(this.hour),
                  f = 'HH:mm';
              if ( this.comp.showSecond ){
                v.second(this.second);
                f += ':ss';
              }
              return v.format(f);
            }
            return '';
          },
          /**
           * Sets the current hour.
           *
           * @method setHour
           * @memberof timepicker
           * @fires getTime
           * @param {Number} h
           * @emits change
           */
          setHour(h){
            this.hour = h;
            let time = this.getTime();
            if ( !!time ){
              this.$emit('change', time, 'HH:mm' + (this.comp.showSecond ? ':ss' : ''));
            }
          },
          /**
           * Sets the current minute.
           *
           * @method setMinute
           * @memberof timepicker
           * @fires getTime
           * @param {Number} m
           * @emits change
           */
          setMinute(m){
            this.minute = m;
            let time = this.getTime();
            if ( !!time ){
              this.$emit('change', time, 'HH:mm' + (this.comp.showSecond ? ':ss' : ''));
            }
          },
          /**
           * Sets the current second.
           *
           * @method setSecond
           * @memberof timepicker
           * @param {Number} s
           * @fires getTime
           * @emits change
           */
          setSecond(s){
            this.second = s;
            let time = this.getTime();
            if ( !!time ){
              this.$emit('change', time, 'HH:mm' + (this.comp.showSecond ? ':ss' : ''));
            }
          }
        },
        /**
         * @event beforeMount
         * @memberof timepicker
         * @fires comp.getValueFormat
         */
        beforeMount(){
          this.ready = false;
          if ( this.comp.value ){
            let format = this.comp.getValueFormat(this.comp.value),
                mom = format ? dayjs(this.comp.value, format) : false;
            this.hour = mom ? mom.hour() : null;
            this.minute = mom ? mom.minute() : null;
            this.second = mom && this.comp.showSecond ? mom.second() : null;
          }
        },
        /**
         * @event mounted
         * @memberof timepicker
         */
        mounted(){
          this.$nextTick(() => {
            this.ready = true;
          });
        },
        watch: {
          /**
           * @watch hour
           * @memberof timepicker
           * @fires setHour
          */
          hour(newVal, oldVal){
            if ( this.ready && (newVal !== oldVal) ){
              this.setHour(newVal);
            }
          },
          /**
           * @watch minute
           * @memberof timepicker
           * @fires setMinute
          */
          minute(newVal, oldVal){
            if ( this.ready && (newVal !== oldVal) ){
              this.setMinute(newVal);
            }
          },
          /**
           * @watch second
           * @memberof timepicker
           * @fires setSecond
          */
          second(newVal, oldVal){
            if ( this.ready && (newVal !== oldVal) && this.comp.showSecond ){
              this.setSecond(newVal);
            }
          },
          /**
           * @watch checkScroll
           * @memberof timepicker
           * @fires getRef
          */
          checkScroll(newVal){
            if ( newVal ){
              this.$nextTick(() => {
                setTimeout(() => {
                  let hs = this.getRef('hourScroll'),
                      ms = this.getRef('minuteScroll'),
                      ss = this.getRef('secondScroll');
                  if ( !bbn.fn.isNull(this.hour)  && hs ){
                    hs.onResize();
                    hs.scrollTo(0, this.getRef('hourActive'));
                  }
                  if ( !bbn.fn.isNull(this.minute) && ms ){
                    ms.onResize();
                    ms.scrollTo(0, this.getRef('minuteActive'));
                  }
                  if ( !bbn.fn.isNull(this.second) && ss ){
                    ss.onResize();
                    ss.scrollTo(0, this.getRef('secondActive'));
                  }
                }, 400)
              })
            }
          }
        }
      }
    }
  });

})(bbn);
