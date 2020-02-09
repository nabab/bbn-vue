((bbn) => {
  "use strict";
  bbn.fn.autoExtend("vue", {
    /**
     * Basic Component.
     *
     * @component basicComponent
     */
    emptyComponent: {
      template: '<template><slot></slot></template>',
      created(){
        this.componentClass.push('bbn-empty-component');
      },
    }
  });
})(bbn);