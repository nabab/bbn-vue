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
  Vue.component('bbn-rte', {
    /**
     * @mixin bbn.vue.basicComponent
     */
    mixins: [bbn.vue.basicComponent, bbn.vue.inputComponent],
    props: {
      /**
       * @prop {Boolean} [false] iFrame
       */
      iFrame:{
        type: Boolean,
        default: false
      },
      /**
       * @prop value
       */
      value: {},
      /**
       * Defines if the component value is required.
      * @prop {Boolean|Function|String} [false] required
      */
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
      /**
       * @prop pinned
       */
      pinned: {},
      /**
       * @prop top
       */
      top: {},
      /**
       * @prop left
       */
      left: {},
      /**
       * @prop bottom
       */
      bottom: {},
      /**
       * @prop right
       */
      right: {},
      /**
       * @prop {Boolean} [false] fullSize
       */
      fullSize:{
        default:false,
        type: Boolean
      },
      /**
       * @prop {Array} [bbn.env.cdn + 'lib/bbnjs/1.0.1/src/css/iFrame.less'] iframeCSSLinks
       */
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
       * @prop {Array} [[['viewHTML'],['undo', 'redo'],['formatting'],['strong', 'em', 'underline', 'del'],['removeformat', 'foreColor', 'backColor'],['superscript', 'subscript'],['link'],['insertImage', 'base64'],['justifyLeft', 'justifyCenter', 'justifyRight', 'justifyFull'],['unorderedList', 'orderedList'],['horizontalRule'],['fullscreen']]] buttons
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
       * The object of configuration.
       * @prop {Object} cfg
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
         * The height to give to the editor depending on the value of the prop height.
         * @data {String} realHeight
         */
        realHeight: typeof this.height === 'string' ? this.height : this.height + 'px',
        /**
         * @data {Boolean} [false] widget
         */
        widget: false,
         /**
         * @data {String|Number} currentValue
         */
        currentValue: this.value
      }
    },
    methods: {
      /**
       * @method onChange
       * @emit input
       */
      onChange(){
        this.$emit('input', this.widget.value);
      }
    },
    created(){
      if (!this.value
        && this.$slots.default
        && this.$slots.default[0]
        && this.$slots.default[0].text.length
      ) {
        this.currentValue = this.$slots.default[0].text;
      }
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
      if ( this.iFrame ){
        this.widget.iframeCSSLinks = this.iframeCSSLinks
      }
      if ( this.currentValue) {
        this.widget.value = this.currentValue;
      }
      if (!this.value && this.currentValue) {
        this.$emit('input', this.currentValue);
      }
      this.ready = true;
    },
    watch: {
      /**
       * @watch value
       * @param newVal 
       */
      value(newVal){
        if (this.widget && (this.widget.value !== newVal)) {
           bbn.fn.log("CHANFING CURRENT VALUE");
           this.widget.value = newVal;
        }
      }
    }
  });
})();
