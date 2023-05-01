

return {
      /**
       * @mixin bbn.wc.mixins.list
       */
      mixins: [
        bbn.wc.mixins.list,bbn.wc.mixins.basic,
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
  