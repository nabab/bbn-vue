((bbn) => {

let script = document.createElement('script');
script.innerHTML = `<div :class="[{'bbn-overlay':true}, componentClass]" v-if="currentData.length">
	<!--bbn-toolbar></bbn-toolbar-->
	<div class="bbn-block" v-for="(c, i) in current" @click="setCurrent(c)" :key="i">
		<i class="bbn-xl nf nf-custom-folder"></i>
		<div v-text="c.text"></div>
	</div>
</div>
`;
script.setAttribute('id', 'bbn-tpl-component-stack');
script.setAttribute('type', 'text/x-template');document.body.insertAdjacentElement('beforeend', script);



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
  

})(bbn);