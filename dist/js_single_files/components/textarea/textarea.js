((bbn) => {
let script = document.createElement('script');
script.innerHTML = `<div :class="[
        'bbn-textbox',
        componentClass,
        {'bbn-state-disabled': !!disabled}
      ]">
  <textarea :class="[
              'bbn-no-border',
              'bbn-radius',
              'bbn-w-100',
              'bbn-spadded',
              {'bbn-state-disabled': !!disabled}
            ]"
            style="max-width: 100%; min-width: 100%; min-height: 100%"
            :value="value"
            :name="name"
            ref="element"
            @input="emitInput($event.target.value)"
            @click="click($event)"
            @focus="focus($event)"
            @blur="blur($event)"
            @change="change($event)"
            @keydown="keydown($event)"
            @keydown.enter.stop=""
            @keyup="keyup($event)"
            @paste="$emit('paste', $event)"
            :disabled="disabled"
            :required="required"
            :placeholder="placeholder"
            :maxlength="maxlength"
            :rows="rows"
            :cols="cols"
  ></textarea>
</div>
`;
script.setAttribute('id', 'bbn-tpl-component-textarea');
script.setAttribute('type', 'text/x-template');
document.body.insertAdjacentElement('beforeend', script);
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
       * The object of configuration.
       * @prop {object} [{}] cfg
       */
      cfg:{
				type: Object,
        default: function(){
          return {}
				}
			}
    },
    methods: {
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
     * Adds the css class 'bbn-state-disabled' if the prop disabled is set to true and sets the prop ready to true.
     * @event mounted
     */
    mounted(){
      this.ready = true;
    }
  });

})(bbn);


})(bbn);