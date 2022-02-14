<template>
<div :class="[componentClass, {
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

</div>
</template>
<script>
  module.exports = /**
 * @file bbn-context component
 *
 * @description bbn-context is a menu that can be activated with a right click.
 * The source of the menu can have a tree structure.
 * ì
 * @copyright BBN Solutions
 *
 * @created 15/02/2017.
 */

(bbn => {
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
        return this.isSpecial && (bbn.fn.substr(this.k, 0, 1) === 'f');
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

</script>
<style scoped>
.bbn-key {
  cursor: pointer;
  position: relative;
  display: inline-block;
  color: #aaa;
  font: bold 0.9em arial;
  text-decoration: none;
  text-align: center;
  width: 3.7em;
  height: 3.4em;
  background: #eff0f2;
  border-radius: 0.3em;
  border-top: 1px solid rgba(255,255,255,0.8);
  box-shadow: inset 0 0 2em #e8e8e8, 0 0.1em 0 #c3c3c3, 0 0.15em 0 #c9c9c9, 0 0.15em 0.2em #333;
  margin: 0.2em;
}
.bbn-key span {
  position: absolute;
  top: 50%;
  margin-top: -0.5em;
  left: 0;
  right: 0;
  margin-left: auto;
  margin-right: auto;
}
.bbn-key.bbn-key-double {
  width: 7.4em;
}
.bbn-key.bbn-key-space {
  width: 14.8em;
}
.bbn-key.bbn-key-narrow {
  height: 2.8em;
}
.bbn-key.bbn-key-bottom span {
  top: auto;
  bottom: 0.4em;
}
.bbn-key.bbn-key-right span {
  left: auto;
  right: 0.4em;
}
.bbn-key.bbn-key-left span {
  left: 0.4em;
  right: auto;
}
.bbn-theme-dark .bbn-key {
  color: #aaa;
  background: #222;
  box-shadow: inset 0 0 2em #333, 0 0.1em 0 #000, 0 0.15em 0 #222, 0 0.15em 0.2em #333;
}

</style>
