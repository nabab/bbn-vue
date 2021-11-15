(bbn_resolve) => {
((bbn) => {
let script = document.createElement('script');
script.innerHTML = `<div :class="componentClass">
  <div class="bbn-iblock"
       tabindex="0"
       @blur="updateEditor"
       ref="divEditor"
       @input="onInlineInput"
       contenteditable="plaintext-only"/>
</div>
`;
script.setAttribute('id', 'bbn-tpl-component-inline-editor');
script.setAttribute('type', 'text/x-template');
document.body.insertAdjacentElement('beforeend', script);
let css = document.createElement('link');
css.setAttribute('rel', "stylesheet");
css.setAttribute('href', bbn.vue.libURL + "dist/js/components/inline-editor/inline-editor.css");
document.head.insertAdjacentElement('beforeend', css);
/**
 * @file bbn-cms-block component
 * @description bbn-cms-block 
 * @copyright BBN Solutions
 * @author Loredana Bruno
 * @created 09/11/2020.
 */
(function(bbn){
  "use strict";
  Vue.component('bbn-inline-editor', {
    /**
     * @mixin bbn.vue.basicComponent
     * @mixin bbn.vue.inputComponent
     */
    mixins: 
    [
      bbn.vue.basicComponent, 
      bbn.vue.inputComponent
    ],
    props: {
      /**
       * @prop {String} value
       */
      value: {
        type: String
      }
    },
    data(){
      return {
      }
    },
    computed: {
    },
    methods: {
      onInlineInput(ev) {
        this.emitInput(ev.target.innerText);
      },
      updateEditor(){
        this.getRef('divEditor').innerText = this.value;
      }
    },
    mounted(){
      this.updateEditor();
    },
    watch: {
      currentValue(v) {
        this.emitInput(v);
        this.updateEditor();
      },
      value(v){
        if (v !== this.currentValue) {
          this.currentValue = v;
        }
      },
    }, 
 
  });
})(bbn);

if (bbn_resolve) {bbn_resolve("ok");}
})(bbn);
}