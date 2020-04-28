<template>
<textarea :class="['bbn-textbox', componentClass]"
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
</template>
<script>
  module.exports = /**
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

  /**
   * Classic textarea with normalized appearance
   */
  Vue.component('bbn-textarea', {
    mixins: [bbn.vue.basicComponent, bbn.vue.inputComponent, bbn.vue.eventsComponent],
    props: {
			rows: {
				type: Number
			},
			cols: {
				type: Number
			},
			maxlength: {
				type: Number
			},
      cfg:{
				type: Object,
        default: function(){
          return {}
				}
			}
    },
    methods: {
      clear: function(){
        this.emitInput('');
      }
    },
    mounted: function(){
      if ( this.disabled ){
        this.$el.classList.add("bbn-state-disabled");
      }
      this.ready = true;
    }
  });

})(bbn);

</script>
