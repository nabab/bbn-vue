((bbn, Vue) => {

	"use strict";
    
	const cpDef = {
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
	};

	if (Vue.component) {
		Vue.component('bbn-stack', cpDef);
	}

	return cpDef;

})(window.bbn, window.Vue);
  