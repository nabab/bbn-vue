((bbn) => {

let script = document.createElement('script');
script.innerHTML = `<div :class="[
        'bbn-textbox',
        componentClass,
        {'bbn-state-disabled': !!isDisabled}
      ]">
  <textarea :class="{
              'bbn-no-border': true,
              'bbn-radius': true,
              'bbn-w-100': !cols,
              'bbn-spadded': true,
              'bbn-state-disabled': !!isDisabled
            }"
            :value="value"
            :name="name"
            ref="element"
            @input="onInput"
            @click="click($event)"
            @focus="focus($event)"
            @blur="blur($event)"
            @change="change($event)"
            @keydown="textareaKeydown($event)"
            @keydown.enter.stop
            @keyup="keyup($event)"
            @paste="$emit('paste', $event)"
            :disabled="isDisabled"
            :readonly="readonly"
            :required="required"
            :placeholder="placeholder"
            :maxlength="maxlength"
            :rows="currentRows"
            :cols="cols"
            :style="{resize: !resizable ? 'none' : ''}"/>
</div>
`;
script.setAttribute('id', 'bbn-tpl-component-textarea');
script.setAttribute('type', 'text/x-template');document.body.insertAdjacentElement('beforeend', script);

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
				validator: bbn.fn.isNumber
      },
      /**
       * The number of columns of the textarea.
       * @prop {Number} cols
       */
			cols: {
				validator: bbn.fn.isNumber
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
    computed: {
      currentRows() {
        if (this.rows) {
          return this.rows;
        }

        if (this.autosize) {
          return 1;
        }

        return undefined;
      },
    },
    methods: {
      onInput(e) {
        if (this.maxlength && (e.target.value.length > this.maxlength)) {
          this.emitInput(this.value);
          return;
        }
        if (this.autosize) {
          e.target.style.height = 'auto';
          e.target.style.height = e.target.scrollHeight+'px';
        }

        this.emitInput(e.target.value)
      },
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
      const el = this.getRef('element');
      el.style.height = 'auto';
      el.style.height = el.scrollHeight+'px';

    }
  });

})(bbn);


})(bbn);