(bbn_resolve) => {
((bbn) => {

let script = document.createElement('script');
script.innerHTML = `<component :is="tag"
           :class="componentClass"
           @mouseenter="isVisible = true">
  <slot></slot>
  <span class="bbn-p bbn-tooltip-icon bbn-left-xsspace"
        ref="helper"
        v-if="icon">
    <i :class="[icon, 'bbn-m']"/>
  </span>
  <bbn-floater v-if="isVisible"
               :tag="tag"
               ref="floater"
               tabindex="-1"
               :position="position"
               :content="getContent()"
               @close="isVisible = false"
               :component="component"
               :element="$el"
               :element-width="false"
               :arrow="true"
               :distance="distance"
               :auto-hide="500"
               :scrollable="false"/>
</component>`;
script.setAttribute('id', 'bbn-tpl-component-tooltip');
script.setAttribute('type', 'text/x-template');document.body.insertAdjacentElement('beforeend', script);


let css = document.createElement('link');
css.setAttribute('rel', 'stylesheet');
css.setAttribute('href', bbn.vue.libURL + 'dist/js/components/tooltip/tooltip.css');
document.head.insertAdjacentElement('beforeend', css);

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
  });

})(bbn);

if (bbn_resolve) {bbn_resolve("ok");}
})(bbn);
}