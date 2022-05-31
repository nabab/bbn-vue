(bbn_resolve) => {
((bbn) => {

let script = document.createElement('script');
script.innerHTML = `<!-- HTML Document -->

<div :class="['bbn-iblock', componentClass]">
  <bbn-button :notext="true"
              icon="nf nf-mdi-grid"
              :text="_('Open selector')"
              @click="showWindow=!showWindow"
              ref="button"/>
  <bbn-floater :title="false"
               v-if="showWindow"
               @close="showWindow=false"
               :auto-hide="true"
               :scrollable="false"
               :element="buttonElement">
    <div class="bbn-grid-configuration-container bbn-grid"
         :style="{gridTemplateRows: 'repeat(' + rows + ', ' + realCellSize + ')'}">
      <div v-for="rowidx in rows"
           class="bbn-grid-configuration-container bbn-grid"
           :style="{gridTemplateColumns: 'repeat(' + cols + ', ' + realCellSize + ')'}">
        <div v-for="colidx in cols"
             :class="['bbn-bordered', {'bbn-state-selected': (currentRow >= rowidx) && (currentCol >= colidx)}]"
             @mouseenter="mouseEnter(colidx, rowidx)"
             @mouseleave="mouseLeave()"
             @click="$emit('select', [colidx, rowidx])"
             :title="_('Row') + ': ' + rowidx + ' / ' + _('Col') + ': ' + colidx"/>
      </div>
    </div>
  </bbn-floater>
</div>`;
script.setAttribute('id', 'bbn-tpl-component-grid-configuration');
script.setAttribute('type', 'text/x-template');document.body.insertAdjacentElement('beforeend', script);


let css = document.createElement('link');
css.setAttribute('rel', 'stylesheet');
css.setAttribute('href', bbn.vue.libURL + 'dist/js/components/grid-configuration/grid-configuration.css');
document.head.insertAdjacentElement('beforeend', css);

/**
 * @file bbn-grid-configuration component
 *
 * @description 
 *
 * @copyright BBN Solutions
 *
 * @author Mirko Argentino
 */
 (function() {
  "use strict";
  Vue.component('bbn-grid-configuration', {
    name: 'bbn-grid-configuration',
    /**
     * @mixin bbn.vue.basicComponent
     */
    mixins: [bbn.vue.basicComponent],
    props: {
      rows: {
        type: Number,
        default: 20
      },
      cols: {
        type: Number,
        default: 20
      },
      cellSize: {
        type: [String, Number],
        default: '1rem'
      }
    },
    data() {
      return {
        showWindow: false,
        currentRow: -1,
        currentCol: -1
      }
    },
    computed: {
      realCellSize() {
        return bbn.fn.isNumber(this.cellSize) ? this.cellSize + 'px' : this.cellSize;
      },
      numGrids() {
        return this.cols * this.rows;
      },
      buttonElement() {
        let btn = this.getRef("button");
        if (btn) {
          return btn.$el;
        }
        return null;
      }
    },
    methods: {
      mouseEnter(colidx, rowidx) {
        this.currentRow = rowidx;
        this.currentCol = colidx;
      },
      mouseLeave() {
        this.currentRow = -1;
        this.currentCol = -1;
      }
    }
  });
})();


if (bbn_resolve) {bbn_resolve("ok");}
})(bbn);
}