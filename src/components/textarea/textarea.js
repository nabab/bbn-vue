/**
 * @file bbn-textareais a component with easy configuration, it represents a multiline text field, where one can assign an initial value among the various configurations, validate the content and give a maximum number of characters that it can accept. It is possible to define actions on the events triggered on it.
 * @copyright BBN Solutions
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
        this.$el.classList.add("k-state-disabled");
      }
      this.ready = true;
    }
  });

})(bbn);
