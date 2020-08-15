(bbn_resolve) => { ((bbn) => {
let script_dep = document.createElement('script');
script_dep.setAttribute('src', "https://cdn.jsdelivr.net/combine/gh/xdan/jodit@3.3.8/build/jodit.es2018.min.js");
script_dep.onload = () => {

let css_dependency;
css_dependency = document.createElement('link');
css_dependency.setAttribute('rel', "stylesheet");
css_dependency.setAttribute('href', "https://cdn.jsdelivr.net/combine/gh/xdan/jodit@3.3.8/build/jodit.es2018.min.css");
document.head.insertAdjacentElement('beforeend', css_dependency);
let script = document.createElement('script');
script.innerHTML = `<div :class="[componentClass, 'bbn-textbox']"
     @keydown.enter.stop=""
>
  <div class="bbn-100" ref="element" @change="onChange">
    <slot></slot>
  </div>
</div>`;
script.setAttribute('id', 'bbn-tpl-component-jodit');
script.setAttribute('type', 'text/x-template');
document.body.insertAdjacentElement('beforeend', script);
let css = document.createElement('link');
css.setAttribute('rel', "stylesheet");
css.setAttribute('href', bbn.vue.libURL + "dist/js/components/jodit/jodit.css");
document.head.insertAdjacentElement('beforeend', css);
/**
 * @file bbn-rte component
 *
 * @description bbn-rte is a component that provides users with a range of options to insert and format text as desired, automatically displaying them as a preview.
 *
 * @author BBN Solutions
 *
 * @copyright BBN Solutions
 *
 * @created 11/01/2017
 */

(function($){
  "use strict";

  /**
   * Classic input with normalized appearance
   */
  Vue.component('bbn-jodit', {
    /**
     * @mixin bbn.vue.basicComponent
     * @mixin bbn.vue.inputComponent
     */
    mixins: [bbn.vue.basicComponent],
    props: {
      value: {},
      pinned: {},
      top: {},
      left: {},
      bottom: {},
      right: {},
      /**
       * The height of the editor
       * @prop {Number|String} ['100%'] height
       */
      height:{
        default: '100%',
        type: [String, Number]
      },
      /**
       * The buttons to show on the toolbar
       * @prop {Array} buttons
       */
      buttons: {
        type: Array,
        default(){
          return [

            ['viewHTML'],
            ['undo', 'redo'], // Only supported in Blink browsers
            ['formatting'],
            ['strong', 'em', 'underline', 'del'],
            ['removeformat', 'foreColor', 'backColor'],
            ['superscript', 'subscript'],
            ['link'],
            ['insertImage', 'base64'],
            ['justifyLeft', 'justifyCenter', 'justifyRight', 'justifyFull'],
            ['unorderedList', 'orderedList'],
            ['horizontalRule'],
            ['fullscreen'],

          ];
        }
      },
      /**
       * The object of configuration
       * @prop {Object} cfgfg
       */
      cfg: {
        type: Object,
        default: function(){
          return {
            pinned: true,
            top: null,
            left: null,
            bottom: 5,
            right: 5,
          }
        }
      }
    },
    data(){
      return {
        /**
         * The height to give to the editor depending on the value of the prop height
         * @data {String} realHeight
         */
        realHeight: typeof this.height === 'string' ? this.height : this.height + 'px',
        widget: false,
        currentValue: this.value
      }
    },
    methods: {
      onChange(){
        this.currentValue = this.widget.getElementValue();
        this.$emit('input', this.currentValue);
      }
    },
    /**
     * Initializes the component
     * @event mounted
     */
    mounted(){
      this.widget = new Jodit(this.getRef('element'), {
        iframe: true,
        allowResizeX: false,
        allowResizeY: false,
        spellcheck: false,
        useSplitMode: true,
        height: '100%',
        tabIndex: 0,
        uploader: {
          insertImageAsBase64URI: true
        }
      });
      if (this.value) {
        this.widget.value = this.value
      }
      this.ready = true;
    },
    watch: {
      /**
       * @watch value
       * @param newVal 
       */
      value(newVal){
        if (this.currentValue !== newVal) {
          bbn.fn.log("CHAGING VALUE");
          this.widget.value = this.currentValue = newVal;
        }
      }
    }
  });
})();

if (bbn_resolve) {bbn_resolve("ok");}
};
document.head.insertAdjacentElement("beforeend", script_dep);
})(bbn); }