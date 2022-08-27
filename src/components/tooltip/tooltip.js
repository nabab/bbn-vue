/**
 * @file bbn-tooltip component
 *
 * @description the bbn-tooltip represents a display of information that is related to an element and which is displayed when is focused or clicked.
 *
 * @copyright BBN Solutions
 *
 * @author BBN Solutions
 */

((bbn, Vue) => {

  "use strict";

  const cpDef = {
    /**
     * @mixin bbn.vue.basicComponent
     */
    mixins: [bbn.vue.basicComponent],
    props: {
      /**
       * @prop {(String|Object|Vue)} component
       */
      component: {
        type: [String, Object, Vue]
      },
      /**
       * The source of the component tooltip.
       * @prop {Function|Array} source
       */
      source: {
        type: [Function, String]
      },
      /**
       * @prop {String|Boolean} ['nf nf-mdi-information_outline'] icon
       */
      icon: {
        type: [String, Boolean],
        default: 'nf nf-mdi-information_outline'
      },
      /**
       * The html tag.
       * @prop {String} ['span'] tag
       */
      tag: {
        type: String,
        default: 'span'
      },
      /**
       * If an element is given this will force the position.
       * @prop {String} ['bottom'] position
       */
      position: {
        type: String,
        validator: p => ['', 'topLeft', 'topRight', 'bottomLeft', 'bottomRight', 'top', 'bottom', 'left', 'right'].includes(p),
        default: 'bottom'
      },
      /**
        * Tooltip offset from the element
        * @prop {Number} [10] distance
      */
      distance: {
        type: Number,
        default: 10
      },
    },
    data(){
      return {
        /**
         * @data {Boolean} [false] isVisible
         */
        isVisible: false,
      };
    },
    methods: {
      /**
       * Returns the items of the component from the source.
       * @method getContent
       * @return {String}
       */
      getContent() {
        return bbn.fn.isFunction(this.source) ? this.source() : this.source;
      }
    }
  };

  if (Vue.component) {
    Vue.component('bbn-tooltip', cpDef);
  }

  return cpDef;

})(window.bbn, window.Vue);
