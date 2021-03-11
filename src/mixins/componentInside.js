((bbn) => {
  "use strict";
  bbn.fn.autoExtend("vue", {
    /**
     * component Inside Component.
     *
     * @component componentInsideComponent
     */
    componentInsideComponent: {
      props: {
       /**
        * The component that will be rendered inside the main component.
        * @prop {Number|String} maxWidth
        * @memberof dimensionsComponent
        */
        component: {
          type: [String, Object, Vue]
        },
       /**
        * The maximum height of the component.
        * @prop {Number|String} maxHeight
        * @memberof dimensionsComponent
        */
        componentOptions: {
          type: Object,
          default(){
            return {};
          }
        }
      }
    }
  });
})(bbn);
