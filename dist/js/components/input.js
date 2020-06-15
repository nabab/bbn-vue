((bbn) => {
let script = document.createElement('script');
script.innerHTML = `<div :class="[
	componentClass, 'bbn-textbox', {
		'bbn-disabled': !!disabled,
		'bbn-input-button-left' : !!buttonLeft,
		'bbn-input-button-right' : !!buttonRight,
		'bbn-invisible' : (type === 'hidden'),
    'bbn-input-nullable': isNullable
	}]"
	:style="(currentSize !== '') ? 'width:' + currentSize : '' "
>
  <div :class="{
    'bbn-w-100': (!buttonLeft && !buttonRight && !nullable),
    'bbn-flex-width' : (buttonLeft || buttonRight || nullable)
  }">
    <bbn-button v-if="buttonLeft"
          :icon="buttonLeft" 
          @click="$emit('clickLeftButton')"
          tabindex="-1"
          :class="[
            'bbn-button-left',
            'bbn-no-vborder',
            'bbn-m',
            {'bbn-invisible' : autoHideLeft}
          ]"
    ></bbn-button>
    <input :value="value"
          :type="type"
          :name="name"
          ref="element"
          :readonly="readonly"
          :disabled="disabled"
          :placeholder="placeholder"
          :maxlength="maxlength"
          :autocomplete="currentAutocomplete"
          :pattern="pattern"
          @input="emitInput($refs.element.value)"
          @click="click"
          @paste="$emit('paste', $event)"
          @focus="focus"
          @blur="blur"
          @change="change"
          @keydown="keydown"
          @keyup="keyup"
          @mouseenter="over"
          @mouseleave="out"
          :tabindex="tabindex"
          :class="{'bbn-flex-fill' : (buttonLeft || buttonRight || isNullable)}"
          :size="currentInputSize"
    >
    <bbn-loadicon v-if="loading"></bbn-loadicon>
    <div v-else-if="isNullable && hasValue && !readonly && !disabled"
         class="bbn-block bbn-h-100 bbn-input-nullable-container">
      <i class="nf nf-fa-times_circle bbn-p"
         @mousedown.prevent.stop="clear"></i>
    </div>
    <bbn-button v-if="buttonRight"
                :icon="buttonRight"
                tabindex="-1"
                @click="$emit('clickRightButton')"
                :class="[
                  'bbn-button-right',
                  'bbn-no-vborder',
                  'bbn-m',
                  {'bbn-invisible' : autoHideRight}
                ]"
    ></bbn-button></div>
</div>`;
script.setAttribute('id', 'bbn-tpl-component-input');
script.setAttribute('type', 'text/x-template');
document.body.insertAdjacentElement('beforeend', script);
let css = document.createElement('style');
css.innerHTML = `.bbn-input {
  display: inline-block;
}
.bbn-input:hover .bbn-button {
  opacity: 1;
}
.bbn-input .bbn-button {
  opacity: 0.7;
  min-width: 2em;
}
.bbn-input input {
  width: 100%;
  font-size: inherit;
  border-radius: inherit;
}
.bbn-input.bbn-input-nullable .bbn-input-nullable-container {
  opacity: 0;
  transition: opacity 0.2s;
  line-height: 100%;
  margin: auto;
  padding-right: 0.2em;
}
.bbn-input.bbn-input-nullable .bbn-input-nullable-container .nf-fa-times_circle {
  line-height: 100%;
  margin: auto;
}
.bbn-input.bbn-input-nullable:hover .bbn-input-nullable-container {
  opacity: 0.3;
}
`;
document.head.insertAdjacentElement('beforeend', css);
/**
 * @file bbn-input component
 *
 * @description bbn-input is a simple text field.
 *
 * @author BBN Solutions
 * 
 * @copyright BBN Solutions
 */

(function(bbn){
  "use strict";

  /**
   * Classic input with normalized appearance
   */
  Vue.component("bbn-input", {
    /**
     * @mixin bbn.vue.basicComponent
     * @mixin bbn.vue.eventsComponent
     * @mixin bbn.vue.inputComponent
     */
    mixins: [bbn.vue.basicComponent, bbn.vue.eventsComponent, bbn.vue.inputComponent],
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
       * The input's attribute 'pattern'. 
       * @prop {String} pattern
       */
      pattern: {
        type: String
      },
      /**
       * The size of the input.
       * @prop {String|Number} size
       */
      size: {
        type: [String, Number],
      }
    },
    data(){
      let currentAutocomplete = 'off';
      if (this.autocomplete === true) {
        currentAutocomplete = 'on';
      }
      else if (this.autocomplete.toLowerCase && ['on', 'off'].includes(this.autocomplete.toLowerCase())) {
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
        currentSize: this.size ? bbn.fn.formatSize(this.size) : '',
        /**
         * The action performed by the left button.
         * @data {Function} currentActionLeft
         */
        currentActionLeft: bbn.fn.isFunction(this.actionLeft) ? this.actionLeft : ()=>{},
        /**
         * The action performed by the right button.
         * @data {Function} currentActionRight
         */
        currentActionRight: bbn.fn.isFunction(this.actionRight) ? this.actionRight : ()=>{}
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
      }
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

      }
    }
  });

})(bbn);

})(bbn);