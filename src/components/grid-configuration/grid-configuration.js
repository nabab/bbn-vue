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

