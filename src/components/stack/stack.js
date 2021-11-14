

(function(bbn){
    "use strict";
    
    Vue.component('bbn-stack', {
      /**
       * @mixin bbn.vue.listComponent
       */
      mixins: [
        bbn.vue.listComponent,bbn.vue.basicComponent,
      ],
      props: {
		  /**
		   * @prop {Array} source
		   */
        source: {
					type: Array
				}
			},
			data(){
				return {
					current: []
				}
			}, 
			created(){
				bbn.fn.log('mounted', this.source)
				this.current = this.source
				//this.currentData = this.source;
			},
			methods: {
				setCurrent(a){
					this.current = a;
				}
			}
    });
  })(bbn);
  