 /**
  * @file bbn-grapes component
  * @description
  * @copyright BBN Solutions
  * @author BBN Solutions
  * @created 10/02/2017
  */
((bbn, Vue, grapesjs) => {
  "use strict";

  const cpDef = {
    /**
     * @mixin bbn.vue.basicComponent
     */
    mixins: [bbn.vue.basicComponent],
    props: {
      /**
       * @prop {(String|Function)} css
       */
      css: {
        type: [String, Function]
      }
    },
    data(){
      return {
        /**
         * @data [null] widget
         */
        widget: null
      }
    },
    /**
     * @event mounted
     */
    mounted(){
      this.widget = grapesjs.init({
        container: this.$el,
        fromElement: true,
        plugins: ['gjs-blocks-basic'],
        style: this.css || ''
      })
    }
  };

  if (Vue.component) {
    Vue.component('bbn-grapes', cpDef);
  }

  return cpDef;

})(window.bbn, window.Vue, window.grapesjs);
