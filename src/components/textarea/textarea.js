/**
 * Created by BBN on 12/06/2017.
 */
(function($, bbn, kendo){
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
      let $ele = $(this.$el);

      if ( this.disabled ){
        $ele.addClass("k-state-disabled");
      }
      this.ready = true;
    }
  });

})(jQuery, bbn, kendo);
