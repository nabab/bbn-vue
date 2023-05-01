/**
 * @file bbn-checkbox component
 *
 * @description The bbn-checkbox component is a box that by clicking, it assigns a certain value and when we deselect it takes another.
 * The values ​​that can be assumed in case of selection or not are  defined in the configuration of the component.
 * In addition, we can customize it by using the properties at disposal.
 *
 * @copyright BBN Solutions
 *
 * @author BBN Solutions
 *
 */
return {
    /**
     * @mixin bbn.wc.mixins.basic
     * @mixin bbn.wc.mixins.input
     * @mixin bbn.wc.mixins.events
     *
     */
    mixins: 
    [
      bbn.wc.mixins.basic,
      bbn.wc.mixins.input,
      bbn.wc.mixins.events
    ],
    props: {
      value: {
      /**
       * The value of the checkbox.
       *
       * @prop {Boolean} [true] value
       */
        default: true
      },
      /**
      * The value of the checkbox when unchecked.
      *
      * @prop {Boolean} [null] novalue
      */
      novalue: {
        default: null
      },
      /**
       * The name of the component checkbox.
       *
       * @prop {String} [null] name
       */
      name: {
        type: String,
        default: null
      },
      /**
       * The id of the checkbox.
       *
       * @prop {String} id
       */
      id: {
        type: String,
        default(){
          return bbn.fn.randomString(10, 25);
        }
      },
      /**
       * @todo description
       * @prop {String|Boolean|Number} [undefined] modelValue
       */
      modelValue: {
        type: [String, Boolean, Number],
        default: undefined
      },
      /**
       * Set to true to have required checkbox selection.
       *
       * @prop {Boolean} [false] required
       */
      required: {
        type: Boolean,
        default: false
      },
      /**
       * Set to true to disable the checkbox.
       *
       * @prop {Boolean} [false] disabled
       */
      disabled: {
        type: Boolean,
        default: false
      },
      /**
       * Set to true for a readonly checkbox.
       *
       * @prop {Boolean} [false] readonly
       */
      readonly: {
        type: Boolean,
        default: false
      },
      /**
       * The accompanying label for the checkbox.
       *
       * @prop {String} label
       */
      label: {
        type: String,
      },
      /**
       * Set to true for a checked checkbox.
       *
       * @prop {Boolean} [false] checked
       */
      checked: {
        type: Boolean,
        default: false
      },
      /**
       * @todo description
       *
       * @prop {Boolean} [false] strict
       */
      strict: {
        type: Boolean,
        default: false
      }
    },
    model: {
      prop: 'modelValue',
      event: 'input'
    },
    data(){
      return {
        /**
         * @data valueToSet
         */
        valueToSet: this.value
      }
    },
    computed: {
      /**
       * Returns the state of the checkbox.
       *
       * @computed state
       * @return {Boolean}
       */
      state(){
        if ( this.checked && (this.modelValue === undefined) ){
          return true;
        }
        if ( this.checked &&
          (
            ( !this.strict && (this.modelValue != this.valueToSet) ) ||
            ( this.strict && (this.modelValue !== this.valueToSet) )
          )
        ){
          return false;
        }
        if (
          ( this.strict && (this.modelValue === this.valueToSet) ) ||
          ( !this.strict && (this.modelValue == this.valueToSet) )
        ){
          return true;
        }
        return this.checked;
      },
    },
    methods: {
      /**
       * Emits a change when the state of the checkbox changes.
       *
       * @method toggle
       * @emits input
       * @emits change
       */
      toggle(){
        if ( !this.isDisabled && !this.readonly ){
          let emitVal = !this.state ? this.valueToSet : this.novalue;
          this.$emit('input', emitVal);
          this.$emit('change', emitVal, this);
        }
      },
      /**
       * Prevents the event action if the component is disabled or readonly
       * @method onClick
       * @fires click
       */
      onClick(ev){
        if (this.isDisabled || this.readonly){
          ev.preventDefault();
        }
        else {
          this.$emit('beforechange', ev, this.checked);
        }
      },
      /**
       * Prevents the event action if the component is disabled or readonly
       * @method onKeyDown
       * @fires keydown
       */
      onKeyDown(ev){
        if ((this.isDisabled || this.readonly) && (ev.keyCode === 32)) {
          ev.preventDefault()
        }
        else {
          this.keydown(ev);
        }
      }
    },
    watch: {
      /**
       *
       * @watch checked
       * @param {Boolean} newValue
       * @fires toggle
       */
      checked(newValue){
        if ( newValue !== this.state ){
          this.toggle();
        }
      }
    },
    /**
     * @todo ask mirko about @emit
     *
     *
     * @event mounted
     * @fires toggle
     * @emits input
     */
    mounted(){
      if ( this.checked && !this.state ){
        this.toggle();
      }
      if ( !this.checked && !this.state ){
        //this.$emit('input', this.novalue);
      }
    }
  };
