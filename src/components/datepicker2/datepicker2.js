/**
 * bbn-datepicker component
 * Created by BBN on 10/02/2017.
 */
(function($, bbn, kendo){
  "use strict";

  Vue.component('bbn-datepicker2', {
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
        default: 'DD/MM/YYYY'
      },
      /**
       * The format of the value sent to the server.
       *
       * @prop {String} [YYYY-MM-DD] valueFormat
       */
      valueFormat: {
        type: [String, Function],
        default(){
          return 'YYYY-MM-DD';
        }
      },
      /**
       * The mask for date input.
       *
       * @prop {String} [00/00/0000] mask
       */
      mask: {
        type: String,
        default: '00/00/0000'
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
       * The visualization type.
       * "day", "week", "month", "year".
       * 
       * @prop {String} ['day'] type
      */
      type: {
        type: String,
        default: 'days',
        validator: (m) => ['days', 'weeks', 'months', 'years'].includes(m)
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
        isOpened: false
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
        this.isOpened = false;
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
      this.widget = {};
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
    }
  });

})(jQuery, bbn, kendo);
