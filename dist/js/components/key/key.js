(bbn_resolve) => { ((bbn) => {
let script = document.createElement('script');
script.innerHTML = `<div :class="[componentClass, {
        'bbn-key-double': isDouble,
        'bbn-key-space': isSpace,
        'bbn-key-narrow': isTop,
        'bbn-key-bottom': isSpecial && !isEscape && !isArrow,
        'bbn-key-right': isReturn,
        'bbn-key-left': isSpecial && !isReturn && !isEscape && !isArrow,
        'bbn-key-small': isSpecial && !isReturn && !isEscape
      }]" 
     tabindex="-1"
>
  <span v-if="k === 'tab'">
    Tab <i class="bbn-lg nf nf-mdi-keyboard_tab"></i>
  </span>
  <span v-else-if="isArrow">
    <i :class="'bbn-lg ' + arrowClass"></i>
  </span>
  <span v-else v-html="rendered"></span>

</div>`;
script.setAttribute('id', 'bbn-tpl-component-key');
script.setAttribute('type', 'text/x-template');
document.body.insertAdjacentElement('beforeend', script);
let css = document.createElement('link');
css.setAttribute('rel', "stylesheet");
css.setAttribute('href', bbn.vue.libURL + "dist/js/components/key/key.css");
document.head.insertAdjacentElement('beforeend', css);
/**
 * @file bbn-context component
 *
 * @description bbn-context is a menu that can be activated with a right click.
 * The source of the menu can have a tree structure.
 * ì
 * @copyright BBN Solutions
 *
 * @created 15/02/2017.
 */

((bbn) => {
  "use strict";

  const DIRECTIONS = ['left', 'right', 'up', 'down'];

  /**
   * Classic input with normalized appearance.
   */
  Vue.component('bbn-key', {
    /**
     * @mixin bbn.vue.basicComponent
     */
    mixins: [
      bbn.vue.basicComponent,
    ],
    props: {
      /**
       * The content of the context menu.
       * @prop {String} content
       */
      content: {
        type: String
      },
    },
    data(){
      return {
        /**
         * True if the floating element of the menu is opened.
         * @data {Boolean} [false] showFloater ì
         */
        showFloater: false
      };
    },
    computed: {
      k(){
        return this.content.toLowerCase();
      },
      isReturn(){
        return ['return', 'enter'].includes(this.k)
      },
      isDelete(){
        return ['del', 'delete', 'backspace'].includes(this.k);
      },
      isSpace(){
        return (this.content === ' ') || (this.k === 'space');
      },
      isDouble(){
        return ['shift', 'tab', 'return', 'enter', 'backspace', 'caps lock'].includes(this.k);
      },
      isEscape(){
        return ['esc', 'escape'].includes(this.k);
      },
      isSpecial(){
        return this.k.length > 1;
      },
      isTop(){
        return this.isEscape || this.isFunction || ['print screen', 'prt', 'prt sc', 'prt sc.', 'screen lock', 'screen', 'scr lk', 'pause'].includes(this.k);
      },
      isFunction(){
        return this.isSpecial && (this.k.substr(0, 1) === 'f');
      },
      isArrow(){
        return (this.k.indexOf('arrow') === 0) || DIRECTIONS.includes(this.k)
      },
      rendered(){
        let st = bbn.fn.correctCase(this.k);
        if (st === 'Escape') {
          st = 'Esc';
        }
        if (st === 'Space') {
          st = ' ';
        }
        if ((st === 'Prt sc') || (st === 'Prt sc.') || (st === 'Print screen')) {
          st = 'Prt<br>Sc';
        }
        if ((st === 'Scr lk') || (st === 'Screen lock') || (st === 'Screen')) {
          st = 'Src<br>Lk';
        }
        return st;
      },
      arrowClass(){
        let cls = '';
        if (this.isArrow) {
          bbn.fn.each(DIRECTIONS, a => {
            if (this.k.indexOf(a) > -1) {
              cls = 'nf nf-fa-long_arrow_' + a;
              return false;
            }
          });
        }
        return cls;
      }
    }
  });

})(bbn);

if (bbn_resolve) {bbn_resolve("ok");}
})(bbn); }