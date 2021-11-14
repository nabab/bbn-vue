(bbn => {
  "use strict";
  bbn.fn.autoExtend("vue", {
    /**
     * Dimensions Component.
     *
     * @component dimensionsComponent
     */
    dimensionsComponent: {
      props: {
       /**
        * The maximum width of the component.
        * @prop {Number|String} maxWidth
        * @memberof dimensionsComponent
        */
        maxWidth: {
          type: [Number, String]
        },
       /**
        * The maximum height of the component.
        * @prop {Number|String} maxHeight
        * @memberof dimensionsComponent
        */
        maxHeight: {
          type: [Number, String]
        },
       /**
        * The minimum width of the component.
        * @prop {Number|String} minWidth
        * @memberof dimensionsComponent
        */
        minWidth: {
          type: [Number, String]
        },
       /**
        * The minimum height of the component.
        * @prop {Number|String} maxHeight
        * @memberof dimensionsComponent
        */
        minHeight: {
          type: [Number, String]
        },
       /**
        * The width of the component.
        * @memberof dimensionsComponent
        * @prop {String|Number|Boolean} width
        */
        width: {
          type: [String, Number, Boolean]
        },
       /**
        * The height of the component.
        * @memberof dimensionsComponent
        * @prop {String|Number|Boolean} height
        */
        height: {
          type: [String, Number, Boolean]
        },
      },
      data(){
        return {
         /**
          * The current height of the component.
          * @memberof dimensionsComponent
          * @data [null] currentHeight
          */
          currentHeight: null,
         /**
          * The current width of the component.
          * @data [null] currentWidth
          */
          currentWidth: null,
         /**
          * The current min-height of the component.
          * @memberof dimensionsComponent 
          * @data [null] currentMinHeight
          */
          currentMinHeight: null,
         /**
          * The current min-width of the component.
          * @memberof dimensionsComponent
          * @data [null] currentMinWidth
          */
          currentMinWidth: null,
         /**
          * The current max-height of the component.
          * @memberof dimensionsComponent
          * @data [null] currentMaxHeight
          */
          currentMaxHeight: null,
         /**
          * The current max-width of the component.
          * @memberof dimensionsComponent
          * @data [null] currentMaxWidth
          */
          currentMaxWidth: null,
        };
      }
    },
  });
})(bbn);