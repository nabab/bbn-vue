/**
 * @file bbn-loadicon component
 *
 * @description bbn-loadicon is a simple implementation component, which represents an icon displaying a waiting state.
 *
 * @copyright BBN Solutions
 *
 * @author  BBN Solutions
 * 
 * @created 07/01/2017
 */

return {
    /**
     * @mixin bbn.wc.mixins.basic 
     */
    mixins: [bbn.wc.mixins.basic],
    props: {
      /**
       * The size of the icon container
       * @prop {Number|String} [16] size
       */
      size: {
        type: [Number, String],
        default: 16
      },
    },
    computed: {
      currentSize(){
        return bbn.fn.formatSize(this.size);
      }

    }
  };
