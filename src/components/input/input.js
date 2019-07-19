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
      size:{
        type: [String,Number],
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
        currentActionRight: bbn.fn.isFunction(this.actionRight) ? this.actionRight : ()=>{},
      }
    },
    methods: {
      clear(){
        this.emitInput('');
      }
    }
  });

})(bbn);
