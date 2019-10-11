/**
 * @file bbn-fisheye component
 *
 * @description bbn-fisheye is a component that represents a horizontal menu, ideal for managing shortcuts.
 * The structure of data cannot be hierarchical.
 * Each element is represented by an icon capable of performing an action.
 *
 * @author BBN Solutions
 * 
 * @copyright BBN Solutions
 */
(function(bbn){
  "use strict";

  /**
   * Classic input with normalized appearance
   */
  Vue.component('bbn-fisheye', {
    /**
     * @mixin bbn.vue.basicComponent
     * @mixin bbn.vue.listComponent
     */
    mixins: [bbn.vue.basicComponent, bbn.vue.listComponent],
    props: {
      /**
       * The source of the component
       * @prop {Array} [[]] source
       */
      source: {
        type: Array,
        default(){
          return [];
        }
      },
      removable: {
        type: Boolean,
        default: false
      },
      /**
       * An array of items fixed on the left of the component
       * @prop {Array} [[]] fixedLeft
       */
      fixedLeft: {
        type: Array,
        default(){
          return [];
        }
      },
      /**
       * An array of items fixed on the right of the component
       * @prop {Array} [[]] fixedRight
       */
      fixedRight: {
        type: Array,
        default(){
          return [];
        }
      },
      /**
       * The zIndex of the component
       * @prop {Number} [1] zIndex
       */
      zIndex: {
        type: Number,
        default: 1
      },
      itemWidth: {
        type: Number,
        default: 24
      },
    },

    data(){
      return {
        /**
         * @data {Boolean} [false] menu
         */
        menu: false,
        /**
         * @data {Boolean} [false] widget
         */
        widget: false,
        /**
         * @data {Boolean} [false] overBin
         */
        overBin: false,
        /**
         * @data {Boolean} [false] droppableBin
         */
        droppableBin: false,
        timeout: false,
        binTimeout: false,
        visibleBin: false,
        visibleText: -1,
        itemFullWidth: 0,
        draggedIdx: -1
      };
    },

    computed: {
      items(){
        let items = [];
        let i = 0;
        bbn.fn.each(this.fixedLeft, (a) => {
          items.push({
            data: a,
            fixed: true,
            index: i
          });
          i++;
        });
        bbn.fn.each(this.filteredData, (a) => {
          items.push({
            data: a.data,
            fixed: false,
            index: i
          });
          i++;
        });
        bbn.fn.each(this.fixedRight, (a) => {
          items.push({
            data: a,
            fixed: true,
            index: i
          });
          i++;
        });
        return items;
      }
    },

    methods: {
      /**
       * Fires the action given to the item 
       * @method onClick
       * @param {Object} it 
       */
      onClick(it){
        if ( it.action && bbn.fn.isFunction(it.action) ){
          it.action();
        }
      },
      mouseover(idx){
        if ( this.visibleText !== idx ){
          clearTimeout(this.timeout);
          this.visibleText = -1;
          this.timeout = setTimeout(() => {
            this.visibleText = idx;
          }, 500);
        }
      },
      mouseout(){
        clearTimeout(this.timeout);
        this.visibleText = -1;
      },
      dragleave(e){
        setTimeout(() => {
          this.overBin = false;
        }, 500);
      },
      dragstart(idx, e){
        if ( this.removable && e.dataTransfer ){
          e.dataTransfer.allowedEffect = 'move';
          e.dataTransfer.dropEffect = 'move';
          this.draggedIdx = idx;
          this.visibleBin = true;
        }
        else{
          e.preventDefault();
        }
      },
      dragend(idx, e){
        if ( this.removable ){
          this.visibleBin = false;
          this.draggedIdx = -1;
        }
      },
      drop(e){
        if ( this.items[this.draggedIdx] ){
          e.preventDefault();
          this.$emit('remove', this.items[this.draggedIdx].data, e);
        }
      }
    },
    /**
     * @event mounted
     * @fires setup
     */
    mounted(){
      this.ready = true;
    },
    watch: {
      source(){
        this.updateData();
      }
    }
  });

})(bbn);
