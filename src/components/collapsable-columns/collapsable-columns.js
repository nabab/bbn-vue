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
       * @prop {String|Object|Vue} toolbar
       */
      toolbar: {
        type: [String, Object, Vue]
      },
      /**
       * The name of the property used to specify the color to use as the background
       * @prop {String} ['backgroundColor'] sourceBackgroundColor
       */
      sourceBackgroundColor: {
        type: String,
        default: 'backgroundColor'
      },
      /**
       * The name of the property used to specify the color to use for the font
       * @prop {String} ['fontColor'] sourceFontColor
       */
      sourceFontColor: {
        type: String,
        default: 'fontColor'
      },
      /**
       * The name of the property used to specify the component for the toolbar
       * @prop {String} ['toolbar'] sourceToolbar
       */
      sourceToolbar: {
        type: String,
        default: 'toolbar'
      },
      /**
       * The name of the property used to specify the item component
       * @prop {String} ['component'] sourceComponent
       */
      sourceComponent: {
        type: String,
        default: 'component'
      },
      /**
       * Defines the behaviour of the columns about the scroll.
       * @prop {Boolean} [true] scrollable
       */
      scrollable: {
        type: Boolean,
        default: true
      },
      /**
       * The column's width
       * @prop {Number|String} ['40rem'] columnWidth
       */
      columnWidth: {
        type: [Number, String],
        default: '40rem'
      },
      /**
       * Set to true allows the columns children to be filtered.
       * @prop {Boolean} [false] childrenFilterable
       */
      childrenFilterable: {
        type: Boolean,
        default: false
      },
      /**
       * Defines the filters of the columns' children.
       * @prop {Object} [{logic: 'AND',conditions: []}] filters
       * @memberof listComponent
       */
      childrenFilters: {
        type: [Object, Function],
        default () {
          return {
            logic: 'AND',
            conditions: []
          };
        }
      },
      /**
       * On first dataloaded event collapse empty columns
       * @prop {Boolean} [true] collapseEmpty
       */
      collapseEmpty: {
        type: Boolean,
        default: true
      }
    },
    methods: {
      /**
       * Collapses a column
       * @method collapse
       * @param {Object} column
       * @fires $set
       * @emits collapse
       */
      collapse(column){
        this.$set(column, 'opened', false);
        this.$emit('collapse', column);
      },
      /**
       * Collapses all columns
       * @method collapseAll
       * @fires $set
       * @emits collapse
       */
      collapseAll(){
        bbn.fn.each(this.currentData, c => {
          this.$set(c, 'opened', false);
          this.$emit('collapse', c);
        });
      },
      /**
       * Expands a column
       * @method collapseAll
       * @fires $set
       * @emits expand
       */
      expand(column){
        this.$set(column, 'opened', true);
        this.$emit('collapse', column);
      },
      /**
       * Expands all columns
       * @method expandAll
       * @fires $set
       * @emits expand
       */
      expandAll(){
        bbn.fn.each(this.currentData, c => {
          this.$set(c, 'opened', true);
          this.$emit('expand', c);
        });
      }
    },
    components: {
      column: {
        name: 'column',
        mixins: [bbn.vue.listComponent],
        props: {
          column: {
            type: Object
          },
          index: {
            type: Number
          }
        },
        data(){
          return {
            main: this.closest('bbn-collapsable-columns')
          }
        },
        computed: {
          items(){
            if (this.pageable && (!this.isAjax || !this.serverPaging)) {
              return this.filteredData.slice().splice(this.start, this.currentLimit);
            }
            return this.filteredData;
          }
        },
        methods: {
          randomString: bbn.fn.randomString,
          checkCollapse(){
            if (this.main.collapseEmpty) {
              this.$once('dataloaded', () => {
                if (!this.filteredData.length) {
                  this.$set(this.column, 'opened', false);
                }
              });
            }
          }
        },
        beforeMount(){
          this.checkCollapse();
          this.main.$on('dataloaded', this.checkCollapse);
        },
        mounted(){
          this.ready = true;
        },
        beforeDestroy(){
          this.main.$off('dataloaded', this.checkCollapse);
        },
        watch: {
          data: {
            deep: true,
            handler(){
              this.updateData();
            }
          }
        }
      }
    }
  });
})(bbn);