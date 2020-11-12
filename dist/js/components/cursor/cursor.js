(bbn_resolve) => { ((bbn) => {
let script = document.createElement('script');
script.innerHTML = `<div :class="[componentClass, 'bbn-w-100']">
  <label v-text="label + ' ' + value" class="bbn-hspadded"></label>
  <input :focused="true"
          v-bind:value="value"
          placeholder="Type your text here!"
          v-on:input="$emit('input', $event.target.value)"
          type="range"
          :min="min" 
          :max="max" 
          class="slider"
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
      label: {
        type: String,
        default: ''
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
      }
    },
 
  });
})(bbn);

if (bbn_resolve) {bbn_resolve("ok");}
})(bbn); }