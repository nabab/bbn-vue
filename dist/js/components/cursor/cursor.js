(bbn_resolve) => {
((bbn) => {
let script = document.createElement('script');
script.innerHTML = `<div :class="[componentClass, 'bbn-w-100']">
  <label v-text="label" class="bbn-cursor-label"></label>
  <input :focused="true"
          v-bind:value="parseInt(value)"
          placeholder="Type your text here!"
          v-on:input="$emit('input', $event.target.value + unit)"
          type="range"
          :min="min" 
          :max="max" 
          class="slider"
          :step="step"
  >
</div>`;
script.setAttribute('id', 'bbn-tpl-component-cursor');
script.setAttribute('type', 'text/x-template');
document.body.insertAdjacentElement('beforeend', script);
let css = document.createElement('link');
css.setAttribute('rel', "stylesheet");
css.setAttribute('href', bbn.vue.libURL + "dist/js/components/cursor/cursor.css");
document.head.insertAdjacentElement('beforeend', css);
/**
 * @file bbn-block component
 * @description bbn-block 
 * @copyright BBN Solutions
 * @author Loredana Bruno
 * @created 09/11/2020.
 */
(function(bbn){
  "use strict";
  
  Vue.component('bbn-cursor', {
    /**
     * @mixin bbn.vue.basicComponent
     */
    mixins: [bbn.vue.basicComponent, bbn.vue.eventsComponent, bbn.vue.inputComponent],
    props: {
      step: {
        type: Number, 
        default: 1
      },
      /**
       * The aduio's URL
       */
      /*source: {
        type: Number,
        required: true
      },*/
      /**
       * The audio's title
       * @prop {String} [''] title
       */
      min: {
        type: Number,
        default: 0  
      },
      max: {
        type: Number,
        default: 500
      },
      title: {
        type: String,
        default: ''
      },
      value: {
        type: Number | String,
      },
      unit: {
        type: String,
        default: ''
      }
    },
    computed: {
      label(){
        return this.value 
      }
    }
  });
})(bbn);

if (bbn_resolve) {bbn_resolve("ok");}
})(bbn);
}