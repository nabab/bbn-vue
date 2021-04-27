((bbn) => {
let script = document.createElement('script');
script.innerHTML = `<bbn-context :tag="tag"
            :class="componentClass"
            ref="floater"
            tabindex="-1"
            position="top"
            :content="content"
            @click="action('click', $event)"
            @contextmenu="action('context', $event)"
            @keydown="action('keydown', $event)"
            @mousedown="action('mousedown', $event)"
            @mouseover="action('mouseover', $event)"
>
  <slot>
    <i :class="icon"></i>
  </slot>
</bbn-context>`;
script.setAttribute('id', 'bbn-tpl-component-tooltip');
script.setAttribute('type', 'text/x-template');
document.body.insertAdjacentElement('beforeend', script);
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
  const tpl = `
  <div style="padding-top: 4em" class="bbn-padded">
    <div class="bbn-top-left bbn-vmargin">
      <i class="bbn-xl ---BBN-ICON---"></i>
    </div>
    <div>
    ---BBN-CONTENT---
    </div>
  </div>`;
  Vue.component('bbn-tooltip', {
    /**
     * @mixin bbn.vue.basicComponent
     */
    mixins: [bbn.vue.basicComponent],
    props: {
      component: {
        type: [String, Object]
      },
      /**
       * The source of the component tooltip.
       * @prop {Function|Array} source
       */
      source: {
        type: [Function, String],
        required: true
      },
      template: {
        type: String
      },
      icon: {
        type: String,
        default: "bbn-m nf nf-mdi-information_outline"
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
       * True if the tooltip component has a context menu.
       * @prop {Boolean} [false] context
       */
      context: {
        type: Boolean,
        default: false
      },
      /**
       * The mode of the component.
       * @prop {String} ['free'] mode
       */
      mode: {
        type: String,
        default: 'free'
      }
    },
    data(){
      return {
        /**
         * The items.
         * @data {Array} items
         */
        content: this.getContent()
      };
    },
    methods: {
      /**
       * Returns the items of the component from the source.
       * @method getItems
       * @returns {Array}
       */
      getContent() {
        let st = bbn.fn.isFunction(this.source) ? this.source() : this.source;
        let st2 = this.template || tpl;
        return st2.replace('---BBN-ICON---', this.icon).replace('---BBN-CONTENT---', st);
      },
      action(type, ev) {

      }
    },

  });

})(bbn);


})(bbn);