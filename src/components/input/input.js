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
       * @prop {Boolean|String} [true] autocomplete
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
       * Sets the left button disabled.
       * @prop {Boolean} [false] autoHideRight
       */
      buttonLeftDisabled: {
        type: Boolean,
        default: false
      },
      /**
       * Sets the left button disabled.
       * @prop {Boolean} [false] autoHideRight
       */
      buttonRightDisabled: {
        type: Boolean,
        default: false
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
      },
      /**
       * @prop {String} prefix
       */
      prefix: {
        type: String
      },
      /**
       * Forces the input to show the nullable icon even if it is in the read-only state
       * @prop {Boolean} [false] forceNullable
       */
      forceNullable: {
        type: Boolean,
        default: false
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

      let currentValue = this.value;
      if (this.prefix && (this.value.indexOf(this.prefix) === 0)) {
        currentValue = bbn.fn.substr(currentValue, this.prefix.length);
      }
      bbn.fn.log("INSIDE INPUT DATA " + this.value, this.$el.bbnSchema.props.value);

      return {
        /**
         * @todo not used
         */
        currentValue: currentValue,
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
        currentActionLeft: bbn.fn.isFunction(this.actionLeft) ? this.actionLeft : ()=>{this.$emit('clickLeftButton')},
        /**
         * The action performed by the right button.
         * @data {Function} currentActionRight
         */
        currentActionRight: bbn.fn.isFunction(this.actionRight) ? this.actionRight : ()=>{this.$emit('clickRightButton')},
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
        this.emitInput(this.prefix || '');
        this.currentValue = '';
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
      },
      emitValue(v) {
        if (this.prefix && (v.indexOf(this.prefix) !== 0)) {
          v = this.prefix + v;
        }

        this.emitInput(v);
      }
    },
    created() {
      this.init();
    },
    mounted(){
      if (this.required) {
        this.getRef('element').setAttribute('required', '');
      }

      this.ready = true;
    },
    watch: {
      value(v) {
        if (this.prefix && (v.indexOf(this.prefix) === 0)) {
          v = bbn.fn.substr(v, this.prefix.length);
        }

        if (this.currentValue !== v) {
          this.currentValue = v;
        }
      },
      currentValue(v) {
        if (this.value !== (this.prefix || '') + this.currentValue) {
          this.getRef('element').value = v;
          this.emitValue(v);
        }
      },
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

