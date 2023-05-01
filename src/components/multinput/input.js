/**
 * @file bbn-input component
 *
 * @description bbn-input is a simple text field.
 *
 * @author BBN Solutions
 * 
 * @copyright BBN Solutions
 */

return {
    /**
     * @mixin bbn.wc.mixins.basic
     * @mixin bbn.wc.mixins.events
     * @mixin bbn.wc.mixins.input
     */
    mixins: 
    [
      bbn.wc.mixins.basic, 
      bbn.wc.mixins.events,
      bbn.wc.mixins.input
    ],
    props: {
      /**
       * Specifies whether a loading icon isshown inside the input field.
       * @prop {Boolean} [false] loading
       */
      loading: {
        type: [Boolean],
        default: false
      },
      /**
       * Specifies whether or not the input field should have autocomplete enabled. Accepts boolean or the strings 'on' or 'off'.
       * @prop {(Boolean|String)} [true] autocomplete
       */
      autocomplete: {
        type: [Boolean,String],
        default: true
      },
      /**
       * The type of the input.
       * @prop {String} type
       */
      type: {
        type: String,
        default: 'text'
      },
      /**
       * The button's icon on the left of the input.
       * @prop {String} buttonLeft
       */
      buttonLeft: {
        type: String
      },
      /**
       * The button's icon on the right of the input.
       * @prop {String} buttonRight
       */
      buttonRight: {
        type: String
      },
      /**
       * Hides the left button. 
       * @prop {Boolean} [false] autoHideLeft
       */
       autoHideLeft: {
        type: Boolean,
        default: false
      },
      /**
       * Hides the right button.
       * @prop {Boolean} [false] autoHideRight
       */
      autoHideRight: {
        type: Boolean,
        default: false
      },
      /**
       * Called when click the left button. 
       * @prop {Function} actionLeft
       */
       actionLeft: {
        type: Function
      },
      /**
       * Called when click the right button. 
       * @prop {Function} actionRight
       */
       actionRight: {
        type: Function
      },
      /**
       * The input's attribute 'pattern'. 
       * @prop {String} pattern
       */
      pattern: {
        type: String
      },
      /**
       * The size of the input.
       * @prop {(String|Number)} size
       */
      size: {
        type: [String, Number],
      },
      /**
       * @prop {(String|Number)} min
       */
      min: {
        type: [String, Number]
      },
      /**
       * @prop {(String|Number)} max
       */
      max: {
        type: [String, Number]
      }
    },
    data(){
      let currentAutocomplete = 'off';
      if (this.autocomplete === true) {
        currentAutocomplete = 'on';
      }
      else if (this.autocomplete && bbn.fn.isString(this.autocomplete)) {
        currentAutocomplete = this.autocomplete;
      }
      return {
        /**
         * @todo not used
         */
        currentValue: this.value,
        /**
         * The property 'autocomplete' normalized.
         * @data {String} [''] currentAutocomplete
         */
        currentAutocomplete: currentAutocomplete,
        /**
         * The property 'size' normalized.
         * @data {String} [''] currentSize
         */
        currentSize: this.size || '',
        /**
         * The action performed by the left button.
         * @data {Function} currentActionLeft
         */
        currentActionLeft: bbn.fn.isFunction(this.actionLeft) ? this.actionLeft : ()=>{},
        /**
         * The action performed by the right button.
         * @data {Function} currentActionRight
         */
        currentActionRight: bbn.fn.isFunction(this.actionRight) ? this.actionRight : ()=>{},
        currentPattern: null,
        currentType: null
      }
    },
    computed: {
      /**
       * The current input width in characters if the 'autosize' is enabled
       * @computed currentInputSize
       * @returns {Number}
       */
      currentInputSize(){
        return this.autosize ? (this.value ? this.value.toString().length : 1) : 0
      }
    },
    methods: {
      clear(){
        this.emitInput('');
      },
      init(){
        if (this.pattern) {
          let types = ['text', 'date', 'search', 'url', 'tel', 'email', 'password'];
          this.currentPattern = this.pattern;
          this.currentType = types.includes(this.type) ? this.type : 'text';
        }
        else if (this.type === 'hostname') {
          this.currentPattern = bbn.var.regexp.hostname.source;
          this.currentType = 'text';
        }
        else if (this.type === 'ip') {
          this.currentPattern = bbn.var.regexp.ip.source;
          this.currentType = 'text';
        }
        else {
          this.currentPattern = this.pattern;
          this.currentType = this.type;
        }
      }
    },
    created() {
      this.init();
    },
    mounted(){
      if (this.required) {
        this.getRef('element').setAttribute('required', '');
      }
    },
    watch: {
      required(v){
        if (v) {
          this.getRef('element').setAttribute('required', '');
        }
        else{
          this.getRef('element').removeAttribute('required');
        }

      },
      type(newVal) {
        this.init()
      }
    }
  };
