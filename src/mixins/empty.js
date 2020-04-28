((bbn) => {
  "use strict";
  bbn.fn.autoExtend("vue", {
    /**
     * Basic Component.
     *
     * @component emptyComponent
     */
    emptyComponent: {
      template: '<template><slot></slot></template>',
      /**
       * Adds the class 'bbn-empty-component' to the component's template.
       * @event created
       * @memberof emptyComponent
       */
      created(){
        this.componentClass.push('bbn-empty-component');
      },
    }
  });
})(bbn);