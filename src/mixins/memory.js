((bbn) => {
  "use strict";
  bbn.fn.autoExtend("vue", {
    /**
     * Memory component
     * @component memoryComponent
     */
    memoryComponent: {
      props: {
        /**
         * The object memory or a function that returns the object.
         * @prop {Object|Function} memory
         * @memberof memoryComponent
         */
        memory: {
          type: [Object, Function]
        },
      },
      /**
       * Adds the class 'bbn-memory-component' to the component.
       * @event created
       * @memberof memoryComponent
       */
      created(){
        this.componentClass.push('bbn-memory-component');
      }
    }
  });
})(bbn);