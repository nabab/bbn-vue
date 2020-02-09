((bbn) => {
  "use strict";
  bbn.fn.autoExtend("vue", {
    /**
     * Close component.
     * @component closeComponent
     */
    closeComponent: {
      /**
       * Adds the class 'bbn-close-component' to the component.
       * @event created
       * @memberof closeComponent
       */
      created(){
        this.componentClass.push('bbn-close-component');
      },
      data(){
        return {
          /**
           * @data {Boolean}  [false] dirty
           * @memberof closeComponent
           */
          dirty: false
        }
      },
      computed: {
        /**
         * @computed {Boolean} canClose
         * @memberof closeComponent
         */
        canClose(){
          return !this.dirty;
        }
      },
      methods: {

      }
    }
  });
})(bbn);