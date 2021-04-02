((bbn) => {
let script = document.createElement('script');
script.innerHTML = `<span :class="[componentClass, 'bbn-flex-width', 'bbn-vmiddle']"
	    :style="(currentSize !== '') ? 'width:' + currentSize : '' ">
  <input :value="value"
         type="range"
         :name="name"
         ref="element"
         :readonly="readonly"
         :disabled="disabled"
         :required="required"
         :min="min"
         :max="max"
         @input="emitInput(parseInt($refs.element.value))"
         @click="click"
         @focus="focus"
         @blur="blur"
         @change="change"
         @keydown="keydown"
         @keyup="keyup"
         @mouseenter="over"
         @mouseleave="out"
         :tabindex="tabindex"
         :size="currentInputSize"
         class="bbn-range-input bbn-radius bbn-flex-fill">
  <i class="nf nf-mdi-backup_restore bbn-p bbn-m bbn-left-xsspace"
     @click="reset"
     :title="_('Reset')"/>
</span>`;
script.setAttribute('id', 'bbn-tpl-component-range');
script.setAttribute('type', 'text/x-template');
document.body.insertAdjacentElement('beforeend', script);
/**
 * @file bbn-range component
 * @description bbn-range is a 'range' input type
 * @copyright BBN Solutions
 * @author BBN Solutions
 */
(function(bbn, Vue){
  "use strict";

  Vue.component("bbn-range", {
    name: 'bbn-range',
    mixins: [
      /**
       * @mixin bbn.vue.basicComponent
       * @mixin bbn.vue.eventsComponent
       * @mixin bbn.vue.inputComponent
       */
      bbn.vue.basicComponent,
      bbn.vue.eventsComponent,
      bbn.vue.inputComponent
    ],
    props: {
      /**
       * The min value
       * @prop {Number} [1] min
       */
      min: {
        type: Number,
        default: 1
      },
      /**
       * The max value
       * @prop {Number} [100] max
       */
      max: {
        type: Number,
        default: 100
      }
    },
    data(){
      return {
        /**
         * The property 'size' normalized.
         * @data {String} [''] currentSize
         */
        currentSize: this.size || '',
        /**
         * The original value
         * @data {Number} originalValue
         */
        originalValue: this.value
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
      /**
       * Resets the value to the original one
       * @method reset
       * @emits input
       */
      reset(){
        if (!this.disabled && !this.readonly) {
          this.emitInput(this.originalValue)
        }
      }
    },
    /**
     * @event mounted
     */
    mounted(){
      this.ready = true;
    }
  });
})(bbn, Vue);

})(bbn);