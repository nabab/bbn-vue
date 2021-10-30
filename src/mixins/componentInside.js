(bbn => {
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
        * @prop {String|Object|Vue} component
        * @memberof componentInsideComponent
        */
        component: {
          type: [String, Object, Vue]
        },
       /**
        * The component's props.
        * @prop {Object} componentOptions
        * @memberof componentInsideComponent
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
