/**
 * bbn-datepicker component
 * Created by BBN on 10/02/2017.
 */
(function($, bbn){
  "use strict";

  Vue.component('bbn-datetimepicker2', {
    /**
     * @mixin bbn.vue.basicComponent
     * @mixin bbn.vue.fullComponent
     */
    mixins: [bbn.vue.basicComponent, bbn.vue.fullComponent],
    props: {
      /**
       * The format of the date shown.
       *
       * @prop {String} [DD/MM/YYYY] format
       */
      format: {
        type: String,
        default: 'DD/MM/YYYY HH:mm'
      },
      /**
       * The format of the value sent to the server.
       *
       * @prop {String} [YYYY-MM-DD] valueFormat
       */
      valueFormat: {
        type: [String, Function],
        default(){
          return 'YYYY-MM-DD HH:mm';
        }
      },
      /**
       * The mask for date input.
       *
       * @prop {String} [00/00/0000] mask
       */
      mask: {
        type: String,
        default: '00/00/0000 00:00'
      },
      /**
       * The max date allowed.
       *
       * @prop {Date|String} max
       */
      max: {
        type: [Date, String]
      },
      /**
       * The min date allowed.
       *
       * @prop {Date|String} min
       */
      min: {
        type: [Date, String]
      },
      /**
       * The dates disabled.
       *
       * @prop {Array|Function} disableDates
       */
      disableDates: {
        type: [Array, Function]
      },
      /**
       * Set to true to show the default footer in the component or set a costumized template for the footer.
       *
       * @prop {Boolean|Function|String} footer
       */
      footer: {
        type: [Boolean, Function, String]
      },
      datesRange: {
        type: Array,
        default(){
          return [];
        }
      }
    },
    data(){
      return {
        isCalendarOpened: false,
        isTimeOpened: false
      }
    },
    computed: {
      ivalue(){
        if ( this.value ){
          return moment(this.value, this.getValueFormat(this.value)).format(this.format);
        }
        return ''; 
      }
    },
    methods: {
      getValueFormat(val){
        return bbn.fn.isFunction(this.valueFormat) ? this.valueFormat(val) : this.valueFormat;
      },
      setValue(d){
        let format = d ? this.getValueFormat(d) : false;
        this.isCalendarOpened = false;
        this.isTimeOpened = false;
        this.emitInput(format ? moment(d, format).format(format) : '');
        if ( !format ){
          this.$refs.element.widget.value('');
        }
      },
      updateCalendar(){
        this.$refs.calendar.refresh();
      },
      change(event){
        let maskValue = this.$refs.element.widget.value(),
            value = moment(maskValue, this.format).format(this.getValueFormat(maskValue));
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
          this.setValue(false);
        }
        else {
          this.setValue(value);
          this.$nextTick(() => {
            this.$emit('change', event);
          });
        }
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
       * @fires updateCalendar
       */
      min(){
        this.updateCalendar();
      },
      /**
       * @watch max
       * @fires updateCalendar
       */
      max(){
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
      timeSplitter: {
        name: 'time-splitter',
        data(){
          return {
            comp: bbn.vue.closest(this, 'bbn-datetimepicker2'),
            hour: null,
            minute: null,
            hourReady: false,
            minuteReady: false
          }
        },
        computed: {
          checkScroll(){
            return !!(this.hourReady && this.minuteReady && this.$refs.minuteActive && this.$refs.hourActive && this.comp && this.comp.$refs.timeFloater.ready);
          }
        },
        methods: {
          setHour(h){
            this.hour = h;
            if ( !bbn.fn.isNull(this.minute) ){
              let v = moment().minute(this.minute).hour(this.hour);
              this.comp.setValue(v.format(this.comp.getValueFormat(v.format('HH:mm'))));
            }
          },
          setMinute(m){
            this.minute = m;
            if ( !bbn.fn.isNull(this.hour) ){
              let v = moment().minute(this.minute).hour(this.hour);
              this.comp.setValue(v.format(this.comp.getValueFormat(v.format('HH:mm'))));
            }
          }
        },
        beforeMount(){
          if ( this.comp.value ){
            let format = this.comp.getValueFormat(this.comp.value);
            this.hour = format ? moment(this.comp.value, format).hour() : null;
            this.minute = format ? moment(this.comp.value, format).minute() : null;
          }
        },
        watch: {
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
                }, 300)
              })
            }
          }
        }
      }
    }
  });

})(jQuery, bbn);
