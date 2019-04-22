/**
 * bbn-datepicker component
 * Created by BBN on 10/02/2017.
 */
(function($, bbn, kendo){
  "use strict";

  Vue.component('bbn-datetimepicker2', {
    /**
     * @mixin bbn.vue.basicComponent
     * @mixin bbn.vue.fullComponent
     */
    mixins: [bbn.vue.basicComponent, bbn.vue.fullComponent],
    props: {
      /**
       * Use this prop to give native widget's properties.
       *
       * @prop {Object} [{}] cfg
       */
      cfg: {
        type: Object
      },
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
       * @todo description
       *
       * @prop {Array} dates
       */
      dates: {
        type: Array
      },
      /** 
       * The visualization mode.
       * "day", "week", "month", "year".
       * 
       * @prop {String} ['day'] mode
      */
      mode: {
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
      /**
       * @todo description, it seems not to work.
       *
       * @prop {Boolean} [false] inputReadonly
       */
      inputReadonly: {
        type: Boolean,
        default: false
      },
      /**
       * The type of the datepicker.
       *
       * @prop {String} [''] type
       */
      type: {
        type: String,
        default: ''
      },
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
        let format = this.getValueFormat(d);
        this.isOpened = false;
        this.emitInput(moment(d, format).format(format));
      },
      updateCalendar(){
        this.$refs.calendar.refresh();
      },
      change(event){
        let maskValue = this.$refs.element.widget.value(),
            value = moment(maskValue, this.format).format(this.getValueFormat(maskValue));
        this.setValue(value);
        this.$nextTick(() => {
          this.$emit('change', event);
        })
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
       * @watch format
       * @fires widget.setOptions
       */
      format(newVal){
        this.widget.setOptions({
          format: newVal
        });
      },
      /**
       * @watch parseFormats
       * @fires widget.setOptions
       */
      parseFormats(newVal){
        this.widget.setOptions({
          parseFormats: newVal
        });
      },
      /**
       * @watch readonly
       */
      readonly(newVal){
        this.widget.readonly(!!newVal);
        if ( !newVal && this.inputReadonly ){
          this.$nextTick(() => {
            this.$refs.element.setAttribute("readonly", true);
          });
        }
      },
      /**
       * @watch inputReadonly
       */
      inputReadonly(newVal){
        if ( !this.readonly ){
          if ( newVal ){
            this.$refs.element.setAttribute("readonly", true);
          }
          else {
            this.$refs.element.removeAttribute("readonly");
          }
        }
      }
    }
  });

})(jQuery, bbn, kendo);
