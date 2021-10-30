(bbn => {
  "use strict";
  bbn.fn.autoExtend("vue", {
    positionComponent: {
      props: {
        /**
        * The position 'left'.
        * @memberof positionComponent
        * @prop {Number} left
        */
        left: {
          type: Number
        },
        /**
        * The position 'right'.
        * @memberof positionComponent
        * @prop {Number} right
        */
        right: {
          type: Number
        },
        /**
        * The position 'top'.
        * @memberof positionComponent
        * @prop {Number} top
        */
        top: {
          type: Number
        },
        /**
        * The position 'bottom'.
        * @memberof positionComponent
        * @prop {Number} bottom
        */
        bottom: {
          type: Number
        },
      }
    }
  });
})(bbn);