 /**
  * @file bbn-switch component
  *
  * @description bbn-switch is a component with easy implementation and customization that allows the user to switch between selected and unselected states, defining the value and novalue in the appropriate properties.
  *
  * @copyright BBN Solutions
  *
  * @author BBN Solutions
  *
  * @created 13/02/2017
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
       * The value of the component.
       * @prop {Boolean} [true] value
       */
      value: {
        default: true
      },
      /**
       * The value of the component when switch is off.
       * @prop [null] novalue
       */
      novalue: {
        default: null
      },
      /**
       * The name of the input.
       * @prop {String} [null] name
       */
      name: {
        type: String,
        default: null
      },
      /**
       * The id of the input.
       * @prop {String} [bbn.fn.randomString(10, 25)] id
       */
      id: {
        type: String,
        default(){
          return bbn.fn.randomString(10, 25);
        }
      },
      /**
       * The class(es) to add to the tag span.
       * @prop {String|Array} cls
       */
      cls: {
        type: [String,Array]
      },
      /**
       * The class(es) to add to the switch button.
       * @prop {String|Array} sliderCls
       */
      sliderCls: {
        type: [String,Array]
      },
      /**
       * @prop {String|Boolean|Number} [undefined] modelValue
       */
      modelValue: {
        type: [String, Boolean, Number],
        default: undefined
      },
      /**
       * True if a value is required.
       * @prop {Boolean} [false] required
       */
      required: {
        type: Boolean,
        default: false
      },
      /**
       * Set to true disables the switch.
       * @prop {Boolean} [false] disabled
       */
      disabled: {
        type: Boolean,
        default: false
      },
      /**
       * Set to true for a readonly switch.
       * @prop {Boolean} [false] readonly
       */
      readonly: {
        type: Boolean,
        default: false
      },
      // @todo not used
      /*label: {
        type: String,
      },*/
      //@todo not used
      /*
      contrary: {
        type: Boolean,
        default: false
      },*/

      /**
       * Set to true to have the component switched on.
       * @prop {Boolean} [false] checked
       */
      checked: {
        type: Boolean,
        default: false
      },
      /**
       * @prop {Boolean} [false] strict
       */
      strict: {
        type: Boolean,
        default: false
      },
      /**
       * Defines the icon for the component when switched on.
       * @prop {String} ['nf nf-fa-play'] onIcon
       */
      onIcon: {
        type: String,
        default: 'nf nf-fa-play'
      },
      /**
       * Defines the icon for the component when switched off.
       * @prop {String} ['nf nf-fa-stop'] offIcon
       */
      offIcon: {
        type: String,
        default: 'nf nf-fa-stop'
      },
      /**
       * Set to true does not show onIcon and offIcon.
       * @prop {Boolean} [tre] noIcon
       */
      noIcon: {
        type: Boolean,
        default: true
      },
      /**
       * Set to true gives the component a rounded appearance.
       * @prop {Boolean} [false] radius
       */
      radius: {
        type: Boolean,
        default: false
      }
    },
    /**
     * @prop {Object} model
     */
    model: {
      prop: 'modelValue',
      event: 'input'
    },
    data(){
      return {
        /**
         * The value of the component.
         * @data {Boolean} valueToSet
         */
        valueToSet: this.value
      }
    },
    computed: {
      /**
       * Gives information about the state of the switch
       * @computed state
       * @return {Boolean}
       */
      state(){
        if ( this.modelValue === undefined ){
          return this.checked;
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
      /**
       * If the prop noIcon is set to false returns the icon basing on the component's state. 
       * @computed currentIcon
       * @return {String}
       */
      currentIcon(){
        return this.noIcon ? '' : (this.state ? this.onIcon : this.offIcon);

      }
    },
    methods: {
      /**
       * Switches the component. 
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
      }
    },
    watch: {
      /**
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
     * Sets the initial state of the component.
     * @event mounted
     * @fires toggle
     * @emits input
     */
    mounted(){
      if ( this.checked && !this.state ){
        this.toggle();
      }
      if ( !this.checked && !this.state ){
        this.$emit('input', this.novalue);
      }
    }
  };
