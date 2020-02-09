((bbn) => {
  "use strict";
  bbn.fn.autoExtend("vue", {
    positionComponent: {
      props: {
        /**
        * The position 'left'.
        * @prop {Number} left
        */
        left: {
          type: Number
        },
        /**
        * The position 'right'.
        * @prop {Number} right
        */
        right: {
          type: Number
        },
        /**
        * The position 'top'.
        * @prop {Number} top
        */
        top: {
          type: Number
        },
        /**
        * The position 'bottom'.
        * @prop {Number} bottom
        */
        bottom: {
          type: Number
        },
      }
    }
  });
})(bbn);