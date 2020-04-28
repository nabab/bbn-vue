<template>
<div :class="[componentClass, 'bbn-textbox']"
     @keydown.enter.stop=""
>
  <div class="bbn-100"
       ref="element"
       :required="required"
       :readonly="readonly"
       @change="onChange"
       :value="value"
       :disabled="disabled"
       
  >
   <slot></slot>
  </div>
</div>
</template>
<script>
  module.exports = /**
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
  Vue.component('bbn-rte', {
    /**
     * @mixin bbn.vue.basicComponent
     */
    mixins: [bbn.vue.basicComponent],
    props: {
      iFrame:{
        type: Boolean,
        default: false
      },
      value: {},
      required: {
        type: [Boolean, Function, String],
        default: false
      },
      /**
       * Defines if the component has to be disabled.
       * @prop {Boolean|Function} [false] disabled
       * @memberof inputComponent
       */
      disabled: {
        type: [Boolean, Function],
        default: false
      },
      /**
       * Defines if the component has to be readonly.
       * @prop {Boolean|Function} [false] readonly
       * @memberof inputComponent
       */
      readonly: {
        type: [Boolean, Function],
        default: false
      },
      pinned: {},
      top: {},
      left: {},
      bottom: {},
      right: {},
      fullSize:{
        default:false,
        type: Boolean
      },
      iframeCSSLinks :{
        default(){
          return [bbn.env.cdn + 'lib/bbnjs/1.0.1/src/css/iFrame.less']
        },
        type: Array
      }, 
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
        this.$emit('input', this.widget.getElementValue());
      },
      
    },
    /**
     * Initializes the component
     * @event mounted
     */
    mounted(){
      this.widget = new Jodit(this.getRef('element'), {
        iframe: this.iFrame,
        disabled: this.disabled,
        readOnly: this.readOnly,
        required: this.required,
        allowResizeX: false,
        allowResizeY: false,
        spellcheck: false,
        useSplitMode: true,
        height: this.height,
        tabIndex: 0,
        uploader: {
          insertImageAsBase64URI: true
        },
        iframeCSSLinks: this.iFrame ? this.iframeCSSLinks : []
      });
      bbn.fn.log('IFRAME', this.iFrame)
      if ( this.iFrame ){
        this.widget.iframeCSSLinks = this.iframeCSSLinks
      }
      if ( this.value) {
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
        if (this.widget && (this.widget.getElementValue()!== newVal)) {
           bbn.fn.log("CHANFING CURRENT VALUE");
           this.widget.value = newVal;
        }
      }
    }
  });
})();

</script>
<style scoped>
.bbn-rte {
  min-height: unset !important;
  height: calc(99.2%);
  padding: 0.4em;
  box-sizing: content-box;
}
.bbn-rte > div {
  color: black;
  background-color: white;
}

</style>
