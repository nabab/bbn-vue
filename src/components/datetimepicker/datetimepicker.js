/**
 * @file bbn-datetimepicker component
 *
 * @description bbn-datetimepicker is a component that allows the user to choose a time and date.
 * The interval period and the value format are easuly customizable.
 * 
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
       * @prop {Boolean} [false] scrollMode
      */
      scrollMode: {
        type: Boolean,
        default: false
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
        inputValue: ''
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
        val = moment(val, 'YYYY-MM-DD');
        if ( this.value ){
          let mom = moment(this.value.toString(), this.getValueFormat(this.value.toString()));
          val.hour(mom.hour()).minute(mom.minute());
          if ( this.showSecond ){
            val.second(mom.second());
          }
        }
        this.setValue(val.format(this.getValueFormat(val)));
      },
      /**
       * Sets the value format from 'HH:mm' to 'HH:mm:ss'.
       *
       * @method setTime
       * @fires getValueFormat
       * @fires setValue
      */
      setTime(val){
        val = moment(val, 'HH:mm' + (this.showSecond ? ':ss' : ''));
        if ( this.value ){
          let mom = moment(this.value.toString(), this.getValueFormat(this.value.toString()));
          val.date(mom.date()).month(mom.month()).year(mom.year());
        }
        this.setValue(val.format(this.getValueFormat(val)));
      },
      /**
       * Sets the value.
       *
       * @method setValue
       * @param {String} val The value.
       * @fires getValueFormat
       * @emits input
      */
      setValue(val, format){
        if ( !format ){
          format = val ? this.getValueFormat(val) : false;
        }
        let value = format && val ? moment(val, format).format(this.getValueFormat(val)) : '';
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
        this.isCalendarOpened = false;
        this.isTimeOpened = false;
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
       * The method initialized by the input blur event.
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
     * @event beforeCreate
     */
    beforeCreate(){
      if ( bbn.env && bbn.env.lang && (bbn.env.lang !== moment.locale()) ){
        moment.locale(bbn.env.lang);
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
              let min = this.comp.min ? moment(this.comp.min, this.comp.getValueFormat(this.comp.min)).format('HH') : false,
                  max = this.comp.max  ? moment(this.comp.max, this.comp.getValueFormat(this.comp.max)).format('HH') : false;
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
           * @return {Boolean}
           */
          checkScroll(){
            return !!(
              this.comp &&
              this.comp.scrollMode &&
              this.hourReady &&
              this.minuteReady &&
              this.$refs.minuteActive &&
              this.$refs.hourActive &&
              this.comp.$refs.timeFloater.ready &&
              (!this.comp.showSecond || (this.secondReady && this.$refs.secondActive))
            );
          }
        },
        methods: {
          /**
           * Gets the current time value.
           *
           * @method getTime
           * @memberof timepicker
           */
          getTime(){
            if (
              !bbn.fn.isNull(this.hour) &&
              !bbn.fn.isNull(this.minute) &&
              (!this.comp.showSecond || !bbn.fn.isNull(this.second) )
            ){
              let v = moment().minute(this.minute).hour(this.hour),
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
                mom = format ? moment(this.comp.value, format) : false;
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
          */
          checkScroll(newVal){
            if ( newVal ){
              this.$nextTick(() => {
                setTimeout(() => {
                  if ( !bbn.fn.isNull(this.hour) ){
                    this.getRef('hourScroll').onResize();
                    this.getRef('hourScroll').scrollTo(0, this.getRef('hourActive'));
                  }
                  if ( !bbn.fn.isNull(this.minute) ){
                    this.getRef('minuteScroll').onResize();
                    this.getRef('minuteScroll').scrollTo(0, this.getRef('minuteActive'));
                  }
                  if ( !bbn.fn.isNull(this.second) ){
                    this.getRef('secondScroll').onResize();
                    this.getRef('secondScroll').scrollTo(0, this.getRef('secondActive'));
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
