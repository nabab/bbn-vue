/**
 * @file bbn-tooltip component
 *
 * @description the bbn-tooltip represents a display of information that is related to an element and which is displayed when is focused or clicked.
 *
 * @copyright BBN Solutions
 *
 * @author BBN Solutions
 */

(function(bbn){
  "use strict";

  Vue.component('bbn-tooltip', {
    /**
     * @mixin bbn.vue.basicComponent
     */
    mixins: [bbn.vue.basicComponent, bbn.vue.toggleComponent],
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
      /**
       * The HTML element to which the floater must bind
       * @prop {HTMLElement} element
       */
      element: {
        type: HTMLElement
      },
      raw: {
        type: Boolean,
        default: false
      }
    },
    data(){
      return {
        /**
         * @data {Boolean} [false] currentVisible
         */
        currentVisible: false,
      };
    },
    methods: {
      /**
       * Returns the items of the component from the source.
       * @method getContent
       * @return {String}
       */
      getContent() {
        let st = bbn.fn.isFunction(this.source) ? this.source() : this.source;
        if (!this.raw) {
          st = '<div class="bbn-vxspadded bbn-hspadded">' + st + '</div>';
        }

        return st;
      }
    }
  });

})(bbn);
