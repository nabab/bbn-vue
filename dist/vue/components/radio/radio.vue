<template>
<div :class="['bbn-iblock', componentClass]">
  <input class="bbn-hidden"
         ref="element"
         :value="modelValue"
         :disabled="disabled"
         :required="required"
  >
  <div :style="getStyle()">
    <div v-for="(d, idx) in source"
         :class="{
            'bbn-iblock': !vertical,
            'bbn-right-space': !vertical && !separator && source[idx+1],
            'bbn-bottom-sspace': !!vertical && !separator && source[idx+1]
         }"
    >
      <input :value="d[sourceValue]"
             :name="name"
             class="bbn-radio"
             type="radio"
             :disabled="disabled || d.disabled"
             :required="required"
             :id="id + '_' + idx"
             @change="changed(d[sourceValue], d, $event)"
             :checked="d[sourceValue] === modelValue"
      >
      <label class="bbn-radio-label bbn-iflex bbn-vmiddle"
             :for="id + '_' + idx"
      >
         <span class="bbn-left-sspace"
               v-html="render ? render(d) : d[sourceText]"
         ></span>
      </label>
      <br v-if="!vertical && step && ((idx+1) % step === 0)">
      <div v-if="(source[idx+1] !== undefined) && !!separator"
           :class="{
            'bbn-w-100': vertical,
            'bbn-iblock': !vertical
           }"
           v-html="separator"
      ></div>
    </div>
  </div>
</div>
</template>
<script>
  module.exports = /**
 * @file bbn-radio component
 * @description bbn-radio is a component that can be used to select a particular choice from a range of options.
 * @copyright BBN Solutions
 * @author BBN Solutions
 * @created 13/02/2017
 */
(function(bbn){
  "use strict";

  Vue.component('bbn-radio', {
    /**
     * @mixin bbn.vue.basicComponent
     * @mixin bbn.vue.inputComponent
     * @mixin bbn.vue.localStorageComponent
     * @mixin bbn.vue.eventsComponent
     *
     */
    mixins: 
    [
      bbn.vue.basicComponent,
      bbn.vue.inputComponent,
      bbn.vue.localStorageComponent,
      bbn.vue.eventsComponent
    ],
    props: {
      /**
       * The separator that can be inserted between the radio buttons.
       * @prop {String} separator
       */
      separator: {
        type: String
      },
      /**
       * Set to true to arrange the radio buttons vertically.
       * @prop {Boolean} [false] vertical
       */
			vertical: {
				type: Boolean,
				default: false
      },
      /**
       * If the property vertical is set to false, defines the number of columns used to render the component.
       * @prop {Number} step
       */
      step: {
        type: Number
      },
      /**
       * The id of the radio input.
       * @prop {String} [bbn.fn.randomString(10, 25)]  id
       */
      id: {
        type: String,
        default(){
          return bbn.fn.randomString(10, 25);
        }
      },
      /**
       * A function rendering each radio label.
       * @prop {Function} render
       */
      render: {
        type: Function
      },
      /**
       * The name of the property in the item object used as a text.
       * @prop {String} ['text'] sourceText
       */
      sourceText: {
        type: String,
        default: 'text'
      },
      /**
       * The name of the property in the item object used as a value
       * @prop {String} ['text'] sourceValue
       */
      sourceValue: {
        type: String,
        default: 'value'
      },
      /**
       * The source of the component.
       * @prop {Array} [[{text:'Yes', value:1},{text:'No', value:0}]] source
       */
      source: {
        type: Array,
        default(){
          return [{
            text: bbn._("Yes"),
            value: 1
          }, {
            text: bbn._("No"),
            value: 0
          }];
        }
      },
      /**
       * The real value used in the input emit.
       * @prop {String|Boolean|Number} [undefined] modelValue
       */
      modelValue: {
        type: [String, Boolean, Number],
        default: undefined
      }
    },
    model: {
      prop: 'modelValue',
      event: 'input'
    },
    methods: {
      /**
       * @method changed
       * @param val
       * @param {Event} e
       * @emits input
       * @emits change
       */
			changed(val, d, e){
				this.$emit('input', val);
        this.$emit('change', val, d, e);
      },
      /**
       * Returns the component's style based on the property 'step'.
       * @method getStyle
       */
      getStyle(){
			  if ( this.step && !this.vertical ){
			    return 'display: grid; grid-template-columns: ' + 'auto '.repeat(this.step) + ';';
        }
        else {
          return '';
        }
      }
		},
    beforeMount() {
      if (this.hasStorage) {
        let v = this.getStorage();
        if (v && (v !== this.modelValue)) {
          this.changed(v);
        }
      }
    },
    watch: {
      /**
       * @watch value
       * @param {Mixed} v
       */
      modelValue(v) {
        if (this.storage) {
          if (v) {
            this.setStorage(v);
          }
          else {
            this.unsetStorage()
          }
        }
      },
    }
  });

})(bbn);

</script>
