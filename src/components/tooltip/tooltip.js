/**
 * @file bbn-tooltip component
 *
 * @description the bbn-tooltip represents a display of information that is related to an element and which is displayed when is focused or clicked.
 *
 * @copyright BBN Solutions
 *
 * @author BBN Solutions
 */

return {
    /**
     * @mixin bbn.wc.mixins.basic
     */
    mixins: [bbn.wc.mixins.basic],
    props: {
      /**
       * @prop {(String|Object|Object)} component
       */
      component: {
        type: [String, Object, Object]
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
        let st = bbn.fn.isFunction(this.source) ? this.source() : this.source;
        if (!this.raw) {
          st = '<div class="bbn-xsvpadding bbn-shpadding">' + st + '</div>';
        }

        return st;
      },
      /**
       * The method called after the floater close
       * @methods onClose
       * @emit close
       */
      onClose(){
        this.isVisible = false;
        this.$emit('close', this);
      }
    }
  };
