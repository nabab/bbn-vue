/**
 * @file bbn-datetimepicker component
 *
 * @description bbn-datetimepicker is a component that combines input, calendar and drop-down list, to choose the time.
 * Allows the user to enter or select a date and time value.
 * The calendar display is smooth, ensuring that all users can quickly search for the date they are looking for with the interface.
 * Allows the association of data in a bidirectional way.
 * Choose a validation interval period and the format of the value to be entered.
 *
 * @copyright BBN Solutions
 *
 * @author Mirko Argentino
 */
(function($, bbn){
  "use strict";

  Vue.component('bbn-datetimepicker', {
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
       * The format of the value sent to the server.
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
       * Array of dates values to insert into a range.
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
       * Show/hide the "seconds" selection.
       *
       * @prop {Boolean} [false] showSecond
      */
      showSecond: {
        type: Boolean,
        default: false
      },
      /**
       * Show an alternative view for the time selection instead of the dropdowns.
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
        isTimeOpened: false
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
       * The current value shown on the input.
       *
       * @computed inputValue
       * @fires getValueFormat
       * @return {String}
       */
      inputValue(){
        if ( this.value ){
          return moment(this.value, this.getValueFormat(this.value)).format(this.currentFormat);
        }
        return '';
      }
    },
    methods: {
      /**
       * Shows|hides the calendar's floater.
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
       * Shows|hides the time's floater
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
          let mom = moment(this.value, this.getValueFormat(this.value));
          val.hour(mom.hour()).minute(mom.minute());
          if ( this.showSecond ){
            val.second(mom.second());
          }
        }
        this.setValue(val.format(this.getValueFormat(val)));
      },
      /**
       * Sets the value from 'HH:mm'|'HH:mm:ss' formatted value.
       *
       * @method setTime
       * @fires getValueFormat
       * @fires setValue
      */
      setTime(val){
        val = moment(val, 'HH:mm' + (this.showSecond ? ':ss' : ''));
        if ( this.value ){
          let mom = moment(this.value, this.getValueFormat(this.value));
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
        this.isCalendarOpened = false;
        this.isTimeOpened = false;
        if ( value && this.min && (value < this.min) ){
          value = this.min;
        }
        if ( value && this.max && (value > this.max) ){
          value = this.max;
        }
        this.emitInput(value);
        if ( !value ){
          this.$refs.element.widget.value('');
        }
      },
      /**
       * Updates the calendar.
       *
       * @method updateCalendar
       * @fires calendar.refresh
      */
      updateCalendar(){
        this.$refs.calendar.refresh();
      },
      /**
       * Triggered when the value changed by the input.
       *
       * @method change
       * @param {$event} event Original event.
       * @fires getValueFormat
       * @fires disableDates
       * @fires setValue
       * @emits change
      */
      change(event){
        setTimeout(() => {
          let maskValue = this.$refs.element.widget.value(),
              value = !!maskValue ? moment(maskValue, this.currentFormat).format(this.getValueFormat(maskValue)) : '';
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
              this.$emit('change', event);
            });
          }
        }, 100);
      }
    },
    /**
     * @event mounted
     * @fires getOptions
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
        this.setValue(this.value);
        this.updateCalendar();
      },
      /**
       * @watch max
       * @fires setValue
       * @fires updateCalendar
       */
      max(){
        this.setValue(this.value);
        this.updateCalendar();
      },
      /**
       * @watch valueFormat
       * @fires setValue
       */
      valueFormat(){
        this.setValue(this.value);
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
             * Array used to make the minutes and the seconds.
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
             * The current hour.
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
             * Hours' scroll is ready.
             *
             * @data {Boolean} [false] hourReady
             * @memberof timepicker
             */
            hourReady: false,
            /**
             * Minutes' scroll is ready.
             *
             * @data {Boolean} [false] minuteReady
             * @memberof timepicker
             */
            minuteReady: false,
            /**
             * Seconds' scroll is ready.
             *
             * @data {Boolean} [false] secondReady
             * @memberof timepicker
             */
            secondReady: false,
            /**
             * The component is ready.
             *
             * @data {Boolean} [false] ready
             * @memberof timepicker
             */
            ready: false
          }
        },
        computed: {
          /**
             * Array used to make the hours.
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

})(jQuery, bbn);
