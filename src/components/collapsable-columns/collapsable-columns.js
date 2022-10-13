/**
 * @file bbn-collapsable-columns component
 * @description The bbn-collapsable-columns.
 * @copyright BBN Solutions
 * @author Mirko Argentino
 * @created 11/10/2022
 */

 (bbn => {
  "use strict";
  Vue.component('bbn-collapsable-columns', {
    /**
     * @mixin bbn.vue.basicComponent
     * @mixin bbn.vue.listComponent
     */
    mixins: [
      bbn.vue.basicComponent,
      bbn.vue.listComponent
    ],
    props: {
      /**
       * The component to use for the toolbar
       * @prop [String|Object|Vue] toolbar
       */
      toolbar: {
        type: [String, Object, Vue]
      },
      /**
       * The name of the property used to specify the color to use as the background
       * @prop [String] {'backgroundColor'} sourceBackgroundColor
       */
      sourceBackgroundColor: {
        type: String,
        default: 'backgroundColor'
      },
      /**
       * The name of the property used to specify the color to use for the font
       * @prop [String] {'fontColor'} sourceFontColor
       */
      sourceFontColor: {
        type: String,
        default: 'fontColor'
      },
      /**
       * The name of the property used to specify the component for the toolbar
       * @prop [String] {'toolbar'} sourceToolbar
       */
      sourceToolbar: {
        type: String,
        default: 'toolbar'
      },
      /**
       * The name of the property used to specify the item component
       * @prop [String] {'component'} sourceComponent
       */
      sourceComponent: {
        type: String,
        default: 'component'
      }
    },
    methods: {
      /**
       * Collapses a column
       * @method collapse
       * @param {Object} column
       * @fires $forceUpdate
       * @emits collapse
       */
      collapse(column){
        column.opened = false;
        this.$emit('collapse', column);
        this.$forceUpdate();
      },
      /**
       * Collapses all columns
       * @method collapseAll
       * @fires $forceUpdate
       * @emits collapse
       */
      collapseAll(){
        bbn.fn.each(this.currentData, c => {
          c.opened = false;
          this.$emit('collapse', c);
        });
        this.$forceUpdate();
      },
      /**
       * Expands a column
       * @method collapseAll
       * @fires $forceUpdate
       * @emits expand
       */
      expand(column){
        column.opened = true;
        this.$emit('collapse', column);
        this.$forceUpdate();
      },
      /**
       * Expands all columns
       * @method expandAll
       * @fires $forceUpdate
       * @emits expand
       */
      expandAll(){
        bbn.fn.each(this.currentData, c => {
          c.opened = true;
          this.$emit('expand', c);
        });
        this.$forceUpdate();
      }
    }
  });
})(bbn);