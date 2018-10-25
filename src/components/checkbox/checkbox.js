/**
 * bbn-checkbox component
 *
 * Created by BBN on 13/02/2017.
 */
(($, bbn) => {
  "use strict";
  Vue.component('bbn-checkbox', {
    /**
     * @mixin bbn.vue.basicComponent
     * @mixin bbn.vue.inputComponent
     * @mixin bbn.vue.eventsComponent
     *
     */
    mixins: [bbn.vue.basicComponent, bbn.vue.inputComponent, bbn.vue.eventsComponent],
    props: {
      value: {
      /**
       * The value of the checkbox.
       * @props {Boolean} [true] value
       */
        default: true
      },
      /**
       * The value of the checkbox when unchecked.
       * @props {Boolean} novalue
       */
      novalue: {
        default: null
      },
      /**
       * The name of the component checkbox.
       * @props {String} name
       */
      name: {
        type: String,
        default: null
      },
      /**
       * The id of the checkbox.
       * @props {String} id
       */
      id: {
        type: String,
        default(){
          return bbn.fn.randomString(10, 25);
        }
      },
      /**
       *
       * @props {String|Boolean|Number} modelValue
       */
      modelValue: {
        type: [String, Boolean, Number],
        default: undefined
      },
      /**
       * Set to true to have required checkbox selection.
       * @props {Boolean} [false] required
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
       * The accompaning label for the checkbox.
       *
       * @prop {String} label
       */
      label: {
        type: String,
      },
      /**
       * @todo description
       *
       * @prop {Boolean} contrary
       */
      contrary: {
        type: Boolean,
        default: false
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
      }
    },
    methods: {
      /**
       * Emit a change when the state of the checkbox changes.
       *
       * @method toggle
       * @emit input
       * @emit change
       */
      toggle(){
        if ( !this.disabled && !this.readonly ){
          let emitVal = !this.state ? this.valueToSet : this.novalue;
          this.$emit('input', emitVal);
          this.$emit('change', emitVal, this);
        }
      }
    },
    watch: {
      /**
       *
       * @watch checked
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
     * @emit input
     */
    mounted(){
      if ( this.checked && !this.state ){
        this.toggle();
      }
      if ( !this.checked && !this.state ){
        this.$emit('input', this.novalue);
      }
    }
  });
})(jQuery, bbn);