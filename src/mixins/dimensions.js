((bbn) => {
  "use strict";
  bbn.fn.autoExtend("vue", {
    dimensionsComponent: {
      props: {
        /**
        * The maximum width of the component.
        * @prop {Number|String} maxWidth
        */
        maxWidth: {
          type: [Number, String]
        },
        /**
        * The maximum height of the component.
        * @prop {Number|String} maxHeight
        */
        maxHeight: {
          type: [Number, String]
        },
        /**
        * The minimum width of the component.
        * @prop {Number|String} minWidth
        */
        minWidth: {
          type: [Number, String]
        },
        /**
        * The minimum height of the component.
        * @prop {Number|String} maxHeight
        */
        minHeight: {
          type: [Number, String]
        },
        /**
        * The width of the component.
        * @prop {String|Number|Boolean} width
        */
        width: {
          type: [String, Number, Boolean]
        },
        /**
        * The height of the component.
        * @prop {String|Number|Boolean} height
        */
        height: {
          type: [String, Number, Boolean]
        },
      },
      data(){
        return {
          /**
          * @data [null] currentHeight
          */
          currentHeight: null,
          /**
          * @data [null] currentWidth
          */
          currentWidth: null,
          /**
          * @data [null] currentHeight
          */
          currentMinHeight: null,
          /**
          * @data [null] currentWidth
          */
          currentMinWidth: null,
          /**
          * @data [null] currentHeight
          */
          currentMaxHeight: null,
          /**
          * @data [null] currentWidth
          */
          currentMaxWidth: null,
        };
      }
    },
  });
})(bbn);