(bbn_resolve) => { ((bbn) => {
let script = document.createElement('script');
script.innerHTML = `<span :class="componentClass"
	   :style="(currentSize !== '') ? 'width:' + currentSize : '' "
>
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
         class="bbn-range-input bbn-radius">
</span>`;
script.setAttribute('id', 'bbn-tpl-component-range');
script.setAttribute('type', 'text/x-template');
document.body.insertAdjacentElement('beforeend', script);
let css = document.createElement('link');
css.setAttribute('rel', "stylesheet");
css.setAttribute('href', bbn.vue.libURL + "dist/js/components/range/range.css");
document.head.insertAdjacentElement('beforeend', css);
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
      min: {
        type: Number,
        default: 1
      },
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
        currentSize: this.size || ''
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
    /**
     * @event mounted
     */
    mounted(){
      this.ready = true;
    }
  });
})(bbn, Vue);
if (bbn_resolve) {bbn_resolve("ok");}
})(bbn); }