/**
 * @file bbn-textarea component
 *
 * @description bbn-textarea is an easy to configure component, it represents a multiline text field, in which it is possible to assign an initial value among the various configurations, validate the content and provide a maximum number of characters that can be inserted.
 * You can define actions on the events activated on it.
 *
 * @copyright BBN Solutions
 *
 * @author BBN Solutions
 */
(function(bbn){
  "use strict";
  Vue.component('bbn-textarea', {
    /**
     * @mixin bbn.vue.basicComponent
     * @mixin bbn.vue.inputComponent
     * @mixin bbn.vue.eventsComponent
     */
    mixins:
    [
      bbn.vue.basicComponent,
      bbn.vue.inputComponent,
      bbn.vue.eventsComponent
    ],
    props: {
      /**
       * The number of rows of the textarea.
       * @prop {Number} rows
       */
			rows: {
				type: Number
      },
      /**
       * The number of columns of the textarea.
       * @prop {Number} cols
       */
			cols: {
				type: Number
      },
      /**
       * The max length of the text inside the textarea.
       * @prop {Number}  maxlength
       */
			maxlength: {
				type: Number
      },
      /**
       * Sets the textarea resizable
       * @prop {Boolean} [true] resizable
       */
      resizable: {
        type: Boolean,
        default: true
      }
    },
    methods: {
      /**
       * @method textareaKeydown
       * @param {Event} ev
       * @fires keydown
       */
      textareaKeydown(ev) {
        if (this.maxlength && (this.value.length >= this.maxlength)) {
          ev.preventDefault();
        }
        else {
          this.keydown(ev);
        }
      },
      /**
       * Clears the textarea.
       * @method clear
       * @fires emitInput
       */
      clear: function(){
        this.emitInput('');
      }
    },
    /**
     * Sets the prop ready to true.
     * @event mounted
     */
    mounted(){
      this.ready = true;
    }
  });

})(bbn);
