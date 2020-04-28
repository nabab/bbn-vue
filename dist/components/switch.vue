<template>
<span :class="['bbn-iblock', componentClass]">
  <input type="checkbox"
         :id="id"
         :name="name"
         :value="value"
         :required="required"
         :disabled="disabled"
         :checked="state"
         ref="element"
  >
  <span :class="['slider', 'bbn-primary', {
          round: !!radius, 
        }, cls]"
        tabindex="0"
        :for="id"
        @focus="focus"
        @blur="blur"
        @keyup="keyup"
        @keydown.space="toggle"
        @click="toggle"
  >
    <span :class="['slider-button', sliderCls]">
			<i :class="currentIcon"></i>
		</span>
  </span>
</span>

</template>
<script>
  module.exports =  /**
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
((bbn) => {
  "use strict";
  Vue.component('bbn-switch', {
    /**
     * @mixin bbn.vue.basicComponent
     * @mixin bbn.vue.inputComponent
     * @mixin bbn.vue.eventsComponent
     */
    mixins: [bbn.vue.basicComponent, bbn.vue.inputComponent, bbn.vue.eventsComponent],
    props: {
      /**
       * The value of the component
       * @prop {Boolean} [true] value
       */
      value: {
        default: true
      },
      /**
       * The value of the component when switch is off
       * @prop [null] novalue
       */
      novalue: {
        default: null
      },
      /**
       * The name of the input
       * @prop {String} [null] name
       */
      name: {
        type: String,
        default: null
      },
      /**
       * The id of the input
       * @prop {String} [bbn.fn.randomString(10, 25)] id
       */
      id: {
        type: String,
        default(){
          return bbn.fn.randomString(10, 25);
        }
      },
      /**
       * The class to add to the span
       * @prop {String|Array} cls
       */
      cls: {
        type: [String,Array]
      },
      /**
       * The class to add to the switch button
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
       * True if a value is required
       * @prop {Boolean} [false] required
       */
      required: {
        type: Boolean,
        default: false
      },
      /**
       * Set to true disables the switch
       * @prop {Boolean} [false] disabled
       */
      disabled: {
        type: Boolean,
        default: false
      },
      /**
       * Set to true for a readonly switch
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
       * Set to true to have the component switched on
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
       * Defines the icon for the component when switched on
       * @prop {String} ['nf nf-fa-play'] onIcon
       */
      onIcon: {
        type: String,
        default: 'nf nf-fa-play'
      },
      /**
       * Defines the icon for the component when switched off
       * @prop {String} ['nf nf-fa-stop'] offIcon
       */
      offIcon: {
        type: String,
        default: 'nf nf-fa-stop'
      },
      /**
       * Set to true does not show onIcon and offIcon
       * @prop {Boolean} [tre] noIcon
       */
      noIcon: {
        type: Boolean,
        default: true
      },
      /**
       * Set to true gives the component a rounded appearance
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
       * If the prop noIcon is set to false returns the icon basing on the component's state 
       * @computed currentIcon
       * @return {String}
       */
      currentIcon(){
        return this.noIcon ? '' : (this.state ? this.onIcon : this.offIcon);

      }
    },
    methods: {
      /**
       * Switches the component 
       * @method toggle
       * @emits input
       * @emits change
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
       * @watch checked
       * @param {Boolean} newValue 
       */
      checked(newValue){
        if ( newValue !== this.state ){
          this.toggle();
        }
      }
    },
    /**
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
  });
})(bbn);

</script>
<style scoped>
.bbn-switch {
  position: relative;
  display: inline-block;
  width: 2.96rem;
  height: 1.7rem;
}
.bbn-switch input {
  display: none;
}
.bbn-switch .slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  -webkit-transition: .4s;
  transition: .4s;
  filter: grayscale(85%);
}
.bbn-switch .slider .slider-button {
  position: absolute;
  font-size: small;
  text-align: center;
  line-height: 1.26rem;
  vertical-align: middle;
  color: #666;
  height: 1.26rem;
  width: 1.26rem;
  left: 0.22rem;
  bottom: 0.22rem;
  background-color: white;
  -webkit-transition: .4s;
  transition: .4s;
}
.bbn-switch input:focus + .slider {
  box-shadow: 0 0 1px;
}
.bbn-switch input:checked + .slider {
  filter: none;
}
.bbn-switch input:disabled + .slider {
  filter: grayscale(100%) brightness(1.5);
  cursor: default;
}
.bbn-switch input:checked + .slider .slider-button {
  -webkit-transform: translateX(1.26rem);
  -ms-transform: translateX(1.26rem);
  transform: translateX(1.26rem);
}
.bbn-switch .slider.round {
  border-radius: 1.7rem;
}
.bbn-switch .slider.round .slider-button {
  border-radius: 50%;
}

</style>
