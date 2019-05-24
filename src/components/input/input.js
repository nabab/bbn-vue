/**
 * @file bbn-input component
 *
 * @description bbn-input is a simple text field that can be used as an element of a module, from simple implementation.
 * Users can format the entered text or change it dynamically and apply controls on it.
 * It can be used in all applications where textual information needs to be processed.
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
       * Specifies whether or not the input field should have autocomplete enabled. Acctept boolean of string 'on', 'off'
       * @prop {Boolean|String} [true] autocomplete
       */
      autocomplete: {
        type: [Boolean,String],
        default: true
      },
      /**
       * The type of the input
       * @prop {String} type
       */
      type: {
        type: String,
        default: 'text'
      },
      /**
       * The icon of the button on the left of  the input
       * @prop {String} buttonLeft
       */
      buttonLeft: {
        type: String
      },
      /**
       * The icon of the button on the right of  the input
       * @prop {String} buttonRight
       */
      buttonRight: {
        type: String
      },
      /**
       * The action of the left button
       * @prop {Function} actionLeft
       */
      actionLeft: {
        type: Function,
      },
      /**
       * The action of the right button
       * @prop {Function} actionLeft
       */
      actionRight: {
        type: Function,
      },
      /**
       * Hides left button 
       * @prop {Boolean} [false] autoHideLeft
       */
      autoHideLeft: {
        type: Boolean,
        default: false
      },
      /**
       * Hides right button
       * @prop {Boolean} [false] autoHideRight
       */
      autoHideRight: {
        type: Boolean,
        default: false
      },
      /**
       * The input's attribute pattern 
       * @prop {String} pattern
       */
      pattern: {
        type: String
      },
      size:{
        type: [String,Number],
      }
    },
    data(){
      return {
        /**
         * @todo not used
         */
        currentValue: this.value,
        /**
         * The prop autocomplete normalized
         * @data {String} [''] currentAutocomplete
         */
        currentAutocomplete: '',
        /**
         * The prop size normalized
         * @data {String} [''] currentSize
         */
        currentSize:'',
        /**
         * The action for the button left
         * @data {Function} currentActionLeft
         */
        currentActionLeft: ()=>{},
        /**
         * The action for the button right
         * @data {Function} currentActionRight
         */
        currentActionRight: ()=>{},
      }
    },
    methods: {
      clear: function(){
        this.emitInput('');
      }
    },
    /**
     * 
     * @event created
     */
    created(){
      if ( typeof(this.autocomplete) === 'boolean' ){
        if ( this.autocomplete ){
          this.currentAutocomplete = 'on';
        }
        else{
          this.currentAutocomplete = 'off'
        }
      }
      else if ( bbn.fn.isString(this.autocomplete) ){
        if ( ( this.autocomplete === 'on' ) || ( this.autocomplete === 'off' ) ){
          this.currentAutocomplete = this.autocomplete;
        }
      }
      if ( this.size ){
        if ( bbn.fn.isNumber(this.size) ){
          this.currentSize = this.size + 'px';
        }
        else if ( bbn.fn.isString(this.size) ){
          this.currentSize = this.size;
        }
      }
      if ( this.buttonRight ){
        if ( bbn.fn.isFunction(this.actionRight) ){
          this.currentActionRight = this.actionRight;
        }
      }
      
      if ( this.buttonLeft ){
        if ( bbn.fn.isFunction(this.actionLeft) ){
          this.currentActionLeft = this.actionLeft;
        }
      }
    },

  });

})(bbn);
