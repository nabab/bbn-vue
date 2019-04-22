/**
 * Created by BBN on 13/02/2017.
 */
(($, bbn) => {
  "use strict";
  Vue.component('bbn-switch', {
    mixins: [bbn.vue.basicComponent, bbn.vue.inputComponent, bbn.vue.eventsComponent],
    props: {
      value: {
        default: true
      },
      novalue: {
        default: null
      },
      name: {
        type: String,
        default: null
      },
      id: {
        type: String,
        default(){
          return bbn.fn.randomString(10, 25);
        }
      },
      modelValue: {
        type: [String, Boolean, Number],
        default: undefined
      },
      required: {
        type: Boolean,
        default: false
      },
      disabled: {
        type: Boolean,
        default: false
      },
      readonly: {
        type: Boolean,
        default: false
      },
      label: {
        type: String,
      },
      contrary: {
        type: Boolean,
        default: false
      },
      checked: {
        type: Boolean,
        default: false
      },
      strict: {
        type: Boolean,
        default: false
      },
      onIcon: {
        type: String,
        default: 'nf nf-fa-play'
      },
      offIcon: {
        type: String,
        default: 'nf nf-fa-stop'
      },
      noIcon: {
        type: Boolean,
        default: true
      },
      radius: {
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
      currentIcon(){
        return this.noIcon ? '' : (this.state ? this.onIcon : this.offIcon);

      }
    },
    methods: {
      toggle(){
        if ( !this.disabled && !this.readonly ){
          let emitVal = !this.state ? this.valueToSet : this.novalue;
          this.$emit('input', emitVal);
          this.$emit('change', emitVal, this);
        }
      }
    },
    watch: {
      checked(newValue){
        if ( newValue !== this.state ){
          this.toggle();
        }
      }
    },
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